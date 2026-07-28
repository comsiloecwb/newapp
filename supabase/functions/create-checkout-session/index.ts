import Stripe from 'https://esm.sh/stripe@14?target=deno';
import {
  CORS_HEADERS,
  adminClient,
  authErrorResponse,
  getAuthContext,
} from '../_shared/auth.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const ctx = await getAuthContext(req);

    const { event_id, success_url, cancel_url } = await req.json();

    const db = adminClient();

    const { data: evento, error: eventoError } = await db
      .from('eventos')
      .select('*')
      .eq('id', event_id)
      .eq('tenant_id', ctx.tenantId)
      .single();

    if (eventoError || !evento) {
      return new Response(JSON.stringify({ error: 'Evento não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
    if (!evento.is_paid || !evento.price_cents) {
      return new Response(JSON.stringify({ error: 'Evento não é pago' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Reutiliza sessão Stripe pendente se existir
    const { data: existingPayment } = await db
      .from('payments')
      .select('stripe_session_id, status')
      .eq('evento_id', event_id)
      .eq('user_id', ctx.userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingPayment) {
      const session = await stripe.checkout.sessions.retrieve(existingPayment.stripe_session_id);
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: { name: evento.titulo },
          unit_amount: evento.price_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: success_url ?? 'appigreja://payment-success',
      cancel_url: cancel_url ?? 'appigreja://payment-cancel',
      metadata: { event_id, user_id: ctx.userId, tenant_id: ctx.tenantId },
    });

    await db.from('payments').insert({
      user_id: ctx.userId,
      evento_id: event_id,
      tenant_id: ctx.tenantId,
      stripe_session_id: session.id,
      amount_cents: evento.price_cents,
      status: 'pending',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (err) {
    return authErrorResponse(err);
  }
});
