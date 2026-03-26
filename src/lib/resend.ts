import { Resend } from 'resend';

// Inicializa o cliente do Resend
// A API Key deve ser adicionada no arquivo .env.local como RESEND_API_KEY
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
