import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { tenantConfig } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (resend) {
      await resend.emails.send({
        from: `${tenantConfig.appName} <${tenantConfig.supportEmail}>`, // Utiliza a variável do config
        to: [email],
        subject: `🚀 Bem-vindo(a) ao ${tenantConfig.appName}!`,
        html: `
          <h1>Olá! Que bom ter você conosco.</h1>
          <p>Sua licença no <strong>${tenantConfig.appName}</strong> foi criada com sucesso.</p>
          <p>O ${tenantConfig.appName} é o ecossistema definitivo para a gestão inteligente da sua empresa e conversão dos seus leads.</p>
          <br/>
          <p>Para começar, acesse o dashboard e crie a sua URL de Webhook em Configurações para automatizar a chegada de captações.</p>
          <br/>
          <p>Sucesso e muitas vendas!</p>
          <p>Equipe ${tenantConfig.appName}</p>
        `
      });
    }

    return NextResponse.json({ success: true, message: "Welcome email sent" }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no envio do email de boas-vindas", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
