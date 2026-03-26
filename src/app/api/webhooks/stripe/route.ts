import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Missing webhook signature or secret', { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error: any) {
    console.error('Webhook signature verification failed.', error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        if (session.mode === 'subscription') {
          const customerId = session.customer;
          const subscriptionId = session.subscription;

          const usersRef = adminDb.collection('agencies');
          const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

          if (!snapshot.empty) {
            const userId = snapshot.docs[0].id;
            await adminDb.collection('agencies').doc(userId).set({
              stripeSubscriptionId: subscriptionId,
              plan: 'pro',
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
        break;

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        {
          const subscription = event.data.object as any;
          const customerId = subscription.customer;

          const usersRef = adminDb.collection('agencies');
          const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

          if (!snapshot.empty) {
            const userId = snapshot.docs[0].id;
            const plan = subscription.status === 'active' ? 'pro' : 'free';

            await adminDb.collection('agencies').doc(userId).set({
              plan,
              stripeSubscriptionStatus: subscription.status,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return new NextResponse('OK', { status: 200 });
}
