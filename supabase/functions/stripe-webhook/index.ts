import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { adminClient } from '../_shared/auth.ts';

// Endpoint chamado pelo Stripe, não por um usuário logado — sem JWT do Supabase.
// Precisa ser deployado com `supabase functions deploy stripe-webhook --no-verify-jwt`.

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const cryptoProvider = Stripe.createSubtleCryptoProvider();

async function marcarPago(db: ReturnType<typeof adminClient>, stripeSessionId: string) {
  const { data: payment } = await db
    .from('payments')
    .update({ status: 'paid' })
    .eq('stripe_session_id', stripeSessionId)
    .select('id')
    .single();

  if (payment) {
    await db.from('inscricoes').update({ status: 'pago' }).eq('payment_id', payment.id);
  }
}

async function liberarVaga(db: ReturnType<typeof adminClient>, stripeSessionId: string) {
  const { data: payment } = await db
    .from('payments')
    .select('id')
    .eq('stripe_session_id', stripeSessionId)
    .maybeSingle();

  if (payment) {
    await db
      .from('inscricoes')
      .update({ status: 'cancelado' })
      .eq('payment_id', payment.id)
      .eq('status', 'pendente');
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error('Assinatura Stripe inválida:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  const db = adminClient();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await marcarPago(db, session.id);
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await liberarVaga(db, session.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erro ao processar webhook Stripe:', err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
