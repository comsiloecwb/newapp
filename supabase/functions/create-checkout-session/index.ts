import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing auth header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { event_id, success_url, cancel_url } = await req.json();

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) throw new Error('Evento não encontrado');
    if (!event.is_paid || !event.price_cents) throw new Error('Evento não é pago');

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('stripe_session_id, status')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingPayment) {
      const session = await stripe.checkout.sessions.retrieve(existingPayment.stripe_session_id);
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: { name: event.title },
          unit_amount: event.price_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: success_url ?? 'appigreja://payment-success',
      cancel_url: cancel_url ?? 'appigreja://payment-cancel',
      metadata: { event_id, user_id: user.id, church_id: event.church_id },
    });

    await supabase.from('payments').insert({
      user_id: user.id,
      event_id,
      stripe_session_id: session.id,
      amount_cents: event.price_cents,
      status: 'pending',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
