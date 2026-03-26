import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId, email, planId } = await req.json();

    if (!userId || !email) {
      return new NextResponse('Missing userId or email', { status: 400 });
    }

    // O Stripe requer uma secret key válida.
    if (!process.env.STRIPE_SECRET_KEY) {
      return new NextResponse('Stripe not properly configured', { status: 500 });
    }

    // Buscar o usuário no Firestore para verificar se ele já possui um stripeCustomerId
    const userDocRef = adminDb.collection('agencies').doc(userId);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
       return new NextResponse('User not found in database', { status: 404 });
    }

    const userData = userDoc.data();
    let stripeCustomerId = userData?.stripeCustomerId;

    // Se o usuário não tiver um cliente no Stripe, criar um
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          firebaseUserId: userId,
        },
      });
      stripeCustomerId = customer.id;
      
      await userDocRef.set({ stripeCustomerId }, { merge: true });
    }

    const priceId = planId || process.env.STRIPE_PRO_PRICE_ID; 

    if (!priceId) {
      return new NextResponse('Missing priceId for the subscription', { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Criar a sessão de checkout
    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/configs?success=true`,
      cancel_url: `${appUrl}/configs?canceled=true`,
      metadata: {
        firebaseUserId: userId,
      },
      subscription_data: {
        metadata: {
          firebaseUserId: userId,
        }
      }
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
