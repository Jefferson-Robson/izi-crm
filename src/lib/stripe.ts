import Stripe from 'stripe';
import { tenantConfig } from './config';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Please set it in your environment variables.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // fallback for compatibility 
  appInfo: {
    name: tenantConfig.appName,
    version: '0.1.0',
  },
});
