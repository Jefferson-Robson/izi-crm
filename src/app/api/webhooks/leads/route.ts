import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { resend } from "@/lib/resend";
import { tenantConfig } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized. Missing or invalid Bearer token." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Busca a agência que possui esse token usando ADMIN SDK para contornar security rules
    const agenciesRef = adminDb.collection("agencies");
    const q = agenciesRef.where("webhookToken", "==", token);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Unauthorized. Invalid Token." }, { status: 401 });
    }

    const agencyDoc = querySnapshot.docs[0];
    const userId = agencyDoc.id;

    const data = await req.json();

    // Validar payload base
    if (!data.name || !data.phone) {
      return NextResponse.json({ error: "Bad Request. 'name' and 'phone' are required fields." }, { status: 400 });
    }

    // Estrutura padrão da captação
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email || "",
      origin: data.source || "webhook",
      property: data.property || "Não Informado",
      status: "nova",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agencyId: userId,
      value: data.value || 0,
      notes: data.notes || "Lead recebido automaticamente via integração."
    };

    const docRef = await adminDb.collection("leads").add(payload);
    
    // Dispara alerta por e-mail se Resend estiver configurado
    if (resend) {
      try {
        const agencyData = agencyDoc.data();
        const agencyEmail = agencyData.email || "test@example.com";
        
        await resend.emails.send({
          from: `${tenantConfig.appName} <${tenantConfig.supportEmail}>`,
          to: [agencyEmail],
          subject: '🚀 Nova Captação Recebida!',
          html: `
            <h1>Novo Lead Capturado</h1>
            <p>Você acabou de receber um novo lead no seu funil do ${tenantConfig.appName}.</p>
            <ul>
              <li><strong>Nome:</strong> ${payload.name}</li>
              <li><strong>Telefone:</strong> ${payload.phone}</li>
              <li><strong>Origem:</strong> ${payload.origin}</li>
              <li><strong>Imóvel de Interesse:</strong> ${payload.property}</li>
            </ul>
            <p>Acesse o painel para iniciar o atendimento.</p>
          `
        });
      } catch (err) {
        console.error("Erro ao notificar agência por e-mail:", err);
      }
    }

    return NextResponse.json({ success: true, id: docRef.id, message: "Lead recebido com sucesso." }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook Error", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
