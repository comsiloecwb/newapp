# Setup do banco de dados

## 1. Rodar as migrations

No Supabase SQL Editor, rode cada arquivo em ordem:

```
migrations/20250603000000_initial.sql
migrations/20260630000000_in_app_notifications.sql
migrations/20260701000000_profiles_insert_policy.sql
```

## 2. Rodar o seed principal

```
seed.sql
```

Cria a Igreja Exemplo, 6 eventos e a Palavra da Semana.

## 3. Criar o usuário de desenvolvimento

No Supabase Dashboard → **Authentication → Users → Add user**:

| Campo | Valor |
|-------|-------|
| E-mail | `dev@appigreja.com` |
| Senha | `Igreja@2025` |
| Auto Confirm | ✅ marcado |

Depois rode no SQL Editor:

```
seed-dev-user.sql
```

## 4. Credenciais de acesso

| | |
|---|---|
| **App (login)** | dev@appigreja.com / Igreja@2025 |
| **Cadastro de novos membros** | código da igreja: `igreja-exemplo` |
| **Role** | admin |

## 5. Variáveis de ambiente necessárias (.env)

```env
EXPO_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Stripe — necessário para Edge Function create-checkout-session
# Configure via: supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

## 6. Deploy das Edge Functions (quando pronto)

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```
