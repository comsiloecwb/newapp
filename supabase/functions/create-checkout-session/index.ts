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

    // Já inscrito (pago ou aguardando confirmação)?
    const { data: inscricaoAtiva } = await db
      .from('inscricoes')
      .select('id, status, payment_id')
      .eq('evento_id', event_id)
      .eq('user_id', ctx.userId)
      .neq('status', 'cancelado')
      .maybeSingle();

    if (inscricaoAtiva?.status === 'pago') {
      return new Response(JSON.stringify({ error: 'Você já está inscrito neste evento' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Reutiliza sessão Stripe pendente se existir
    if (inscricaoAtiva?.payment_id) {
      const { data: existingPayment } = await db
        .from('payments')
        .select('stripe_session_id')
        .eq('id', inscricaoAtiva.payment_id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingPayment) {
        const session = await stripe.checkout.sessions.retrieve(existingPayment.stripe_session_id);
        return new Response(
          JSON.stringify({ url: session.url, inscricaoId: inscricaoAtiva.id }),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
        );
      }
    }

    // Vagas disponíveis?
    if (evento.vagas_total != null) {
      const { count } = await db
        .from('inscricoes')
        .select('id', { count: 'exact', head: true })
        .eq('evento_id', event_id)
        .neq('status', 'cancelado');

      if ((count ?? 0) >= evento.vagas_total) {
        return new Response(JSON.stringify({ error: 'Evento lotado' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
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
      success_url: success_url ?? `appigreja://payment-success?evento_id=${event_id}`,
      cancel_url: cancel_url ?? `appigreja://payment-cancel?evento_id=${event_id}`,
      metadata: { event_id, user_id: ctx.userId, tenant_id: ctx.tenantId },
    });

    const { data: payment } = await db.from('payments').insert({
      user_id: ctx.userId,
      evento_id: event_id,
      tenant_id: ctx.tenantId,
      stripe_session_id: session.id,
      amount_cents: evento.price_cents,
      status: 'pending',
    }).select('id').single();

    const { data: inscricao, error: inscricaoError } = await db.from('inscricoes').insert({
      evento_id: event_id,
      user_id: ctx.userId,
      tenant_id: ctx.tenantId,
      status: 'pendente',
      payment_id: payment?.id ?? null,
    }).select('id').single();

    if (inscricaoError || !inscricao) {
      return new Response(JSON.stringify({ error: 'Falha ao criar inscrição' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response(
      JSON.stringify({ url: session.url, inscricaoId: inscricao.id }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  } catch (err) {
    return authErrorResponse(err);
  }
});
