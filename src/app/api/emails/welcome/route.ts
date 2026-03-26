import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (resend) {
      await resend.emails.send({
        from: 'IZI CRM <onboarding@resend.dev>', // Domínio de testes do Resend
        to: [email],
        subject: '🚀 Bem-vindo(a) ao IZI CRM!',
        html: `
          <h1>Olá! Que bom ter você conosco.</h1>
          <p>Sua licença no <strong>IZI CRM</strong> foi criada com sucesso.</p>
          <p>O IZI CRM é o ecossistema definitivo para a gestão inteligente da sua imobiliária e conversão dos seus leads.</p>
          <br/>
          <p>Para começar, acesse o dashboard e crie a sua URL de Webhook em Configurações para automatizar a chegada de captações.</p>
          <br/>
          <p>Sucesso e muitas vendas!</p>
          <p>Equipe IZI CRM</p>
        `
      });
    }

    return NextResponse.json({ success: true, message: "Welcome email sent" }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no envio do email de boas-vindas", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
