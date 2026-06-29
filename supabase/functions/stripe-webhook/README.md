# Stripe Webhook (próxima sprint)

Evento: `checkout.session.completed`

1. Validar assinatura Stripe
2. Atualizar `payments.status` → `paid`
3. Criar `registrations` com `status = confirmed`

Deploy: `supabase functions deploy stripe-webhook`
