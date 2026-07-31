# Stripe Webhook

Eventos tratados: `checkout.session.completed`, `checkout.session.expired`.

1. Valida a assinatura Stripe (`STRIPE_WEBHOOK_SECRET`)
2. `checkout.session.completed` → `payments.status = 'paid'` + `inscricoes.status = 'pago'`
3. `checkout.session.expired` → `inscricoes.status = 'cancelado'` (libera a vaga)

## Deploy

```
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase functions deploy stripe-webhook --no-verify-jwt
```

`--no-verify-jwt` é obrigatório: o Stripe chama esse endpoint sem token de usuário do Supabase,
só com a assinatura no header `stripe-signature`.

Depois do deploy, cadastre a URL da function no Dashboard do Stripe
(Developers → Webhooks) para os eventos acima.
