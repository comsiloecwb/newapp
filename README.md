# App Igreja

App mobile multi-igrejas (Expo + Supabase). PRD em [`docs/PRD.md`](docs/PRD.md).

## Estrutura

```
app/                      # Expo Router (telas)
  (auth)/                 # Login
  (tabs)/                 # Home, Calendário, Perfil
  event/[id].tsx          # Detalhe do evento
src/features/             # Domínios (auth, events, home, …)
  auth/
  home/
  events/
  weekly-message/
  calendar/               # hooks futuros (vista mensal)
  profile/
  payments/               # Stripe (MVP)
  notifications/          # Expo Push (MVP)
src/components/ui/        # UI compartilhada
src/lib/                  # Supabase, React Query, mocks
src/services/             # Camada de serviços/API
src/hooks/                # Hooks compartilhados
src/stores/               # Zustand (estado local)
src/types/                # Tipos TypeScript
src/theme/                # Tema por igreja
supabase/migrations/      # Schema + RLS
supabase/functions/       # Edge Functions (Stripe, lembretes)
docs/PRD.md               # Fonte da verdade do produto
```

## Começar

```bash
cd app-igreja
cp .env.example .env   # preencher Supabase
npm install
npm start
```

No simulador: login → **Modo preview (sem Supabase)** em dev.

## Supabase

1. Crie projeto em [supabase.com](https://supabase.com)
2. SQL Editor → rode `supabase/migrations/20250603000000_initial.sql`
3. Rode `supabase/seed.sql` (dados de exemplo)
4. Auth → crie usuário → insira linha em `profiles` (ver comentário no seed)
5. Storage: buckets `church-logos`, `event-covers`, `weekly-messages`

## Próximas entregas (MVP)

- [ ] RSVP gratuito
- [ ] Stripe Checkout + webhook
- [ ] Expo Push (evento novo + lembretes 24h/1h)
- [ ] EAS Build → App Store / Play Store
