# APPSiloe — Estado atual do projeto

> Documento para onboarding de IA ou desenvolvedor. Descreve tudo que foi construído, as decisões tomadas e o que ainda não foi implementado.

---

## 1. O que é o projeto

Aplicativo mobile **multi-igrejas** (multi-tenant) para comunicação, eventos e gestão de participação. Resolve o problema de comunicação descentralizada via WhatsApp, falta de controle de inscrições e dificuldade de enviar lembretes.

Plataforma: **iOS e Android** (publicação nas lojas). Desenvolvido em Expo / React Native.

---

## 2. Stack exata

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework mobile | Expo + React Native | expo ~56, RN 0.85.3 |
| Navegação | Expo Router (file-based) | ~56.2.9 |
| Linguagem | TypeScript strict | ~6.0.3 |
| Estado remoto | TanStack React Query | ^5.90 |
| Estado local | Zustand | ^5.0 |
| Backend | Supabase (Auth, Postgres, Storage, Edge Functions) | ^2.98 |
| Pagamentos | Stripe Checkout | não iniciado |
| Push | expo-notifications | ~56.0.6 |
| React | 19.2.3 | — |

---

## 3. Estrutura de pastas

```
newapp/
├── app/                          # Expo Router — cada arquivo = rota
│   ├── _layout.tsx               # Root layout: QueryClientProvider + ChurchThemeProvider + Stack
│   ├── index.tsx                 # Entry point: redireciona para /(auth)/login ou /(tabs)
│   ├── (auth)/
│   │   ├── _layout.tsx           # Stack sem header
│   │   ├── login.tsx             # Tela de login
│   │   └── register.tsx          # Tela de cadastro
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar: Home | Calendário | Perfil
│   │   ├── index.tsx             # Aba Home
│   │   ├── calendar.tsx          # Aba Calendário
│   │   └── profile.tsx           # Aba Perfil
│   └── event/
│       └── [id].tsx              # Detalhe do evento (modal card)
│
├── src/
│   ├── components/ui/
│   │   ├── Card.tsx              # Container com sombra
│   │   └── EmptyState.tsx        # Estado vazio reutilizável
│   ├── features/
│   │   ├── auth/hooks/
│   │   │   └── use-session.ts    # Carrega sessão do Supabase + popula Zustand
│   │   ├── events/
│   │   │   ├── components/
│   │   │   │   └── EventListItem.tsx   # Linha de evento com badge RSVP/Pago
│   │   │   └── hooks/
│   │   │       └── use-events.ts       # useEvents(filter) + useUpcomingEvents(limit)
│   │   ├── home/components/
│   │   │   └── WeeklyMessageCard.tsx   # Card da palavra da semana
│   │   ├── weekly-message/hooks/
│   │   │   └── use-weekly-message.ts   # useLatestWeeklyMessage()
│   │   ├── calendar/hooks/       # VAZIO — só .gitkeep
│   │   ├── notifications/        # VAZIO — só .gitkeep
│   │   ├── payments/             # VAZIO — só .gitkeep
│   │   └── profile/hooks/        # VAZIO — só .gitkeep
│   ├── lib/
│   │   ├── supabase.ts           # Cliente Supabase + flag isSupabaseConfigured
│   │   ├── query-client.ts       # Instância do QueryClient
│   │   └── mock-data.ts          # Dados mock para rodar sem Supabase
│   ├── stores/
│   │   └── auth-store.ts         # Zustand: { profile, church, setSession, clear }
│   ├── theme/
│   │   └── ChurchThemeProvider.tsx  # Tema dinâmico por igreja + dark mode
│   ├── types/
│   │   └── database.ts           # Tipos TypeScript do banco
│   └── services/                 # VAZIO — só .gitkeep
│
├── supabase/
│   ├── migrations/
│   │   └── 20250603000000_initial.sql  # Schema completo + RLS
│   ├── seed.sql                  # Seed básico: uma igreja + eventos de exemplo
│   └── seed-dev-user.sql         # Instrução para criar usuário dev manualmente
│
└── docs/
    └── PRD.md                    # Product Requirements Document
```

---

## 4. Telas implementadas

### `(auth)/login.tsx`
- Campos e-mail + senha → `supabase.auth.signInWithPassword`
- Se Supabase não configurado → exibe alerta pedindo as env vars
- **"Modo preview (sem Supabase)"** → injeta `MOCK_PROFILE` + `MOCK_CHURCH` no Zustand e redireciona para `/(tabs)`
- Link para tela de cadastro

### `(auth)/register.tsx`
- Campos: nome completo, e-mail, senha
- Validação de campos vazios
- `supabase.auth.signUp({ email, password, options: { data: { name } } })`
- Exibe alerta de confirmação de e-mail → volta para login

### `(tabs)/index.tsx` — Home
- Greeting: `church.name` ou "App Igreja"
- `WeeklyMessageCard` — palavra da semana
- Lista de até 5 próximos eventos via `useUpcomingEvents(5)`
- Fallback para `MOCK_EVENTS` quando Supabase não configurado
- Clicar no evento → navega para `event/[id]`

### `(tabs)/calendar.tsx` — Calendário
- Chips "Próximos" / "Passados" — alterna filtro da query
- Lista completa de eventos com `EventListItem`
- Estado vazio com `EmptyState`
- **Grid visual de calendário (mensal) não iniciado**

### `(tabs)/profile.tsx` — Perfil
- Card com nome, e-mail, papel (role), nome da igreja (tudo do Zustand)
- Card de notificações — **placeholder**: "configurar push na fase seguinte"
- Botão Sair → `supabase.auth.signOut()` + `clear()` + redirect para login

### `event/[id].tsx` — Detalhe do evento
- Lê evento do cache do React Query (`useEvents('upcoming')`)
- Exibe título, descrição
- Preço: `R$ X,XX` (se pago) ou `"Gratuito (RSVP)"`
- **Placeholder**: "Stripe Checkout e RSVP serão ligados na próxima sprint"
- Não busca eventos passados (limitação: só resolve id de eventos upcoming)

---

## 5. Componentes e hooks

### Componentes UI reutilizáveis

| Componente | Arquivo | O que faz |
|---|---|---|
| `Card` | `src/components/ui/Card.tsx` | View com borderRadius 12, sombra, cor via tema |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | Título + mensagem opcional centralizados |
| `EventListItem` | `src/features/events/components/EventListItem.tsx` | Linha clicável com título, data (pt-BR), local e badge |
| `WeeklyMessageCard` | `src/features/home/components/WeeklyMessageCard.tsx` | Card com loading/empty/conteúdo da mensagem |

### Hooks

| Hook | Arquivo | Descrição |
|---|---|---|
| `useEvents(filter)` | `features/events/hooks/use-events.ts` | Busca eventos `upcoming` ou `past` por `church_id`; key: `['events', filter, churchId]` |
| `useUpcomingEvents(limit)` | idem | Wrapper de `useEvents('upcoming')` com `.slice(0, limit)` |
| `useLatestWeeklyMessage()` | `features/weekly-message/hooks/use-weekly-message.ts` | Última mensagem publicada da igreja; key: `['weekly-message', 'latest', churchId]` |
| `useSession()` | `features/auth/hooks/use-session.ts` | Carrega sessão do Supabase, popula Zustand, escuta `onAuthStateChange` |
| `useAuthStore` | `stores/auth-store.ts` | Zustand store: `profile`, `church`, `setSession(profile, church)`, `clear()` |
| `useChurchTheme()` | `theme/ChurchThemeProvider.tsx` | Retorna cores do tema atual (primary/secondary da igreja + bg/surface/text/muted do dark mode) |

---

## 6. Sistema de tema

`ChurchThemeProvider` envolve tudo no root layout. Combina:
- **Cores da igreja** (`primary_color`, `secondary_color`) vindas do Supabase/Zustand
- **Dark mode** via `useColorScheme()` do React Native

```typescript
interface ChurchTheme {
  primary: string;    // cor da igreja (default #1E3A5F)
  secondary: string;  // cor da igreja (default #4A90D9)
  background: string; // #F5F7FA (light) | #0F1419 (dark)
  surface: string;    // #FFFFFF (light) | #1A2332 (dark)
  text: string;       // #1A1A2E (light) | #F9FAFB (dark)
  textMuted: string;  // #6B7280 (light) | #9CA3AF (dark)
}
```

Todos os componentes consomem via `useChurchTheme()`. Nenhum valor de cor está hard-coded nos componentes.

---

## 7. Mock data (src/lib/mock-data.ts)

Permite rodar o app completo sem Supabase. A flag `isSupabaseConfigured` (em `lib/supabase.ts`) verifica se `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` estão definidas no `.env`.

```typescript
MOCK_CHURCH   = { id, name: 'Igreja Exemplo', primary_color: '#1E3A5F', secondary_color: '#4A90D9', ... }
MOCK_PROFILE  = { id, church_id, role: 'editor', name: 'Dev Preview', email: 'dev@igreja.local', ... }
MOCK_WEEKLY_MESSAGE = { title: 'Fé que move montanhas', content: '...', published: true }
MOCK_EVENTS   = [ Culto de domingo (gratuito, +3 dias), Retiro jovem (pago R$50, +14 dias) ]
```

---

## 8. Banco de dados (Supabase / Postgres)

### Tabelas

| Tabela | Chave | Descrição |
|---|---|---|
| `churches` | UUID PK | Igreja. Tem `slug` único, `primary_color`, `secondary_color`, `logo_url` |
| `profiles` | UUID PK → `auth.users` | Usuário. Tem `church_id`, `role` (admin/editor/member), `notify_*` |
| `weekly_messages` | UUID PK | Mensagem da semana. Tem `church_id`, `published`, `preached_at` |
| `events` | UUID PK | Evento. Tem `church_id`, `is_paid`, `price_cents`, `capacity`, `stripe_price_id`, `published` |
| `registrations` | UUID PK | Inscrição. Tem `user_id`, `event_id`, `status` (confirmed/cancelled), `payment_id` |
| `payments` | UUID PK | Pagamento Stripe. Tem `stripe_session_id`, `amount_cents`, `status` (pending/paid/refunded) |
| `push_tokens` | UUID PK | Token Expo Push. Tem `user_id`, `expo_push_token` |
| `scheduled_notifications` | UUID PK | Fila de envio. Tem `event_id`, `send_at`, `type` (reminder_24h/reminder_1h/event_created), `sent_at` |

**Constraint importante:** `events` tem `CHECK (is_paid = false OR (is_paid = true AND price_cents IS NOT NULL AND price_cents > 0))` — evento pago obriga `price_cents`.

**UNIQUE:** `registrations(user_id, event_id)` — um usuário só pode ter uma inscrição por evento.

### Funções RLS auxiliares

```sql
public.user_church_id()  -- retorna church_id do usuário logado
public.user_role()        -- retorna role do usuário logado
public.current_profile()  -- retorna o profile completo
```

### Políticas RLS (resumo)

- `churches`: membro lê só sua igreja; admin atualiza só sua igreja
- `profiles`: todos da mesma igreja leem; cada um edita apenas o próprio; admin gerencia todos
- `weekly_messages`: members leem publicadas da sua igreja; editor/admin gerenciam
- `events`: members leem publicados da sua igreja; editor/admin gerenciam
- `registrations`: members veem e inserem as próprias (com `user_id = auth.uid()`); admin vê todas
- `payments`: member vê os próprios; admin vê todos da igreja
- `push_tokens`: cada um gerencia os próprios
- `scheduled_notifications`: staff gerencia; pg_cron usa service role

### Índices criados

```sql
profiles_church_id_idx
weekly_messages_church_published_idx  -- (church_id, preached_at DESC)
events_church_start_idx               -- (church_id, start_at)
registrations_event_idx
scheduled_notifications_pending_idx   -- (send_at) WHERE sent_at IS NULL
scheduled_notifications_church_idx
```

### Storage buckets (criar no dashboard)

`church-logos`, `event-covers`, `weekly-messages`

---

## 9. Navegação (Expo Router)

```
Stack (root _layout.tsx)
├── (auth)                     headerShown: false
│   ├── login
│   └── register
├── (tabs)                     headerShown: false
│   ├── index (Home)
│   ├── calendar
│   └── profile
└── event/[id]                 headerShown: true, presentation: 'card'
```

Fluxo de entrada (`app/index.tsx`):
1. Se Supabase configurado + loading → spinner
2. Se tem sessão ou profile no store → redirect `/(tabs)`
3. Senão → redirect `/(auth)/login`

---

## 10. Padrões e convenções

- **Feature-based**: código em `src/features/<feature>/components/` e `src/features/<feature>/hooks/`
- **Alias `@/`** mapeado para `src/` no tsconfig
- **Nenhum valor de cor hard-coded** nos componentes — sempre via `useChurchTheme()`
- **Fallback mock**: todo hook verifica `isSupabaseConfigured`; se false, retorna mock ao invés de fazer query
- **React Query**: queries habilitadas com `enabled: Boolean(churchId) && isSupabaseConfigured`
- **Zustand** apenas para estado local/auth — dados remotos sempre via React Query
- **TypeScript strict**: habilitado no tsconfig

---

## 11. O que está implementado vs. pendente

### ✅ Implementado e funcional

- Autenticação (login, cadastro, logout) via Supabase Auth
- Modo preview completo sem Supabase (mock data)
- Sessão persistida no Zustand, restaurada via `useSession` no boot
- Tema dinâmico por igreja + dark mode automático
- Home: palavra da semana + próximos eventos
- Calendário: lista com filtro próximos/passados
- Perfil: exibição de dados do usuário e da igreja
- Detalhe do evento: título, descrição, localização, data, vagas, preço
- Schema completo do banco com RLS
- Seed de desenvolvimento

### 🟡 Existe no código mas incompleto

| O que | Onde | O que falta |
|---|---|---|
| Detalhe do evento | `event/[id].tsx` | Só busca eventos "upcoming" — não resolve eventos passados pelo id |
| Perfil notificações | `profile.tsx` | Card de placeholder — não lê/salva preferências |
| Tipos de Registration/Payment/ScheduledNotification | `src/types/database.ts` | Tipos definidos, mas nenhum hook ou tela os consome |

### 🔴 Não iniciado (pastas vazias com .gitkeep)

| Módulo | Pasta | O que precisa ser feito |
|---|---|---|
| RSVP gratuito | `features/calendar/hooks/` | Hook para criar/cancelar inscrição em evento gratuito |
| Pagamento Stripe | `features/payments/` | Abrir Stripe Checkout, webhook para confirmar pagamento, criar inscrição |
| Push notifications | `features/notifications/` | Registrar token Expo, enviar via Edge Function, pg_cron para lembretes |
| Hooks de perfil | `features/profile/hooks/` | Editar nome/telefone/preferências de notificação |
| Serviços externos | `src/services/` | Wrappers para Stripe, Edge Functions |
| Grid de calendário | `(tabs)/calendar.tsx` | Vista mensal visual (PRD marca como fase futura) |
| Painel admin/editor | — | Criar/editar eventos, publicar mensagem da semana |

---

## 12. Como rodar

```bash
cd newapp
cp .env.example .env          # preencher SUPABASE_URL + ANON_KEY (opcional)
npm install
npm start                     # expo start
```

Sem preencher o `.env`, o app detecta automaticamente e entra em modo mock — tela de login tem botão "Modo preview (sem Supabase)" que injeta dados locais e entra direto no app.

Para rodar com Supabase local:
```bash
npm run setup:supabase        # roda migration + seed
```

---

## 13. Roadmap de evolução — próxima fase

> Decisões já tomadas para a próxima fase de desenvolvimento. Seguir exatamente esta especificação ao implementar.

---

### 13.1 Restrições absolutas (não violar)

- **NÃO mexer em Stripe / pagamentos**: tabelas `payments`, campos `is_paid`, `price_cents`, `stripe_price_id`, `stripe_session_id` em `events`/`payments` e a pasta `features/payments/` ficam intocados. O placeholder atual em `event/[id].tsx` ("Stripe Checkout e RSVP serão ligados na próxima sprint") permanece como está.
- **NÃO recriar sistema de tema**: `ChurchThemeProvider` e `useChurchTheme()` já existem — apenas estender com novos tokens.
- **NÃO recriar multi-tenancy**: o padrão `church_id` + RLS já existe — apenas replicar nas novas tabelas.
- **NÃO criar painel admin**: o app é a visão do membro. Administração é feita por painel web separado (fora de escopo).

---

### 13.2 Extensão do tema (passo 1 — base para todo o resto)

Estender `ChurchTheme` em `src/theme/ChurchThemeProvider.tsx` com os novos tokens abaixo. Todos com fallback fixo para a Igreja Siloé, mas configuráveis por igreja via campos novos em `churches` (assim como `primary_color` e `secondary_color` já são).

```typescript
interface ChurchTheme {
  // já existentes — não alterar
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;

  // novos tokens
  accent: string;       // dourado  — light: #C9A84C  dark: #E8C96A
  silver: string;       // prata    — light: #C0C8D4  dark: #8A96A4
  charcoal: string;     // chumbo   — light: #4A4A4A  dark: #6B6B6B
  surfaceMuted: string; // cinza claro — light: #E8ECF1  dark: #F5F7FA

  fonts: {
    serif: string;      // Georgia — títulos e textos longos
    mono: string;       // 'Courier New' — labels, datas, badges, códigos
  };
}
```

Adicionar em `churches` (migration): `subtitle TEXT`, `accent_color TEXT`, `silver_color TEXT`.

---

### 13.3 Header com identidade visual da igreja

Novo componente `src/components/ui/ChurchHeader.tsx` para substituir o header padrão do Expo Router nas tabs. Características:

- Fundo com gradiente na cor `primary` da igreja (usar `expo-linear-gradient` ou simulação via View aninhadas)
- Logo da igreja: exibir `church.logo_url` via `expo-image`; fallback: ícone de cruz em `accent` quando `logo_url` é null (hoje só o nome em texto é exibido — corrigir isso)
- `church.name` em branco, fonte serif
- `church.subtitle` (novo campo) em `silver`, fonte menor
- Saudação: "Olá, {profile.name}" em `accent`
- Ícone de perfil/avatar clicável no canto direito (abre tela de perfil)

---

### 13.4 Reestruturação da tab bar (5 abas)

Substituir as 3 abas atuais (Home, Calendário, Perfil) pelas 5 abas do produto. O acesso ao **Perfil** sai da tab bar e passa a ser acessado pelo ícone no header.

| Aba | Ícone | Rota |
|---|---|---|
| Início | ⛪ | `(tabs)/index.tsx` (Home atual evoluída) |
| Células | 🏠 | `(tabs)/cells.tsx` (novo) |
| Louvor | 🎵 | `(tabs)/worship.tsx` (novo) |
| Agenda | 📅 | `(tabs)/calendar.tsx` (evoluída) |
| Módulos | 🧩 | `(tabs)/modules.tsx` (novo) |

- Ponto dourado (`accent`) abaixo do ícone da aba ativa
- Perfil acessível via ícone no `ChurchHeader`

---

### 13.5 Home evoluída (`(tabs)/index.tsx`)

Manter estrutura existente e `WeeklyMessageCard`/`useUpcomingEvents`. Evoluir:

**Card "Palavra do Dia"** (reaproveitar `WeeklyMessageCard`):
- Fundo gradiente `primary`
- Referência bíblica em `accent`, fonte mono
- Versículo em branco itálico, fonte serif
- Reflexão em `silver`, separada por linha `accent` translúcida

**Seção "Próximos Eventos"** (reaproveitar `useUpcomingEvents(3)`):
- Bloco de data: sigla do mês + número do dia em branco sobre fundo `primary`, fonte mono
- Nome do evento, horário e local

**Nova seção "Mural de Oração"**:
- Cards: nome do solicitante, pedido de oração, contador de intercessores, botão "Orar" em `accent` sobre `primary`
- Hook em `src/features/prayer/hooks/use-prayer-requests.ts`
- Nova tabela `prayer_requests`:

```sql
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  request TEXT NOT NULL,
  intercessors_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS: mesma lógica de events/weekly_messages por church_id
```

---

### 13.6 Módulo Agenda — 2 abas (`(tabs)/calendar.tsx` evoluído)

Reaproveitar `useEvents(filter)` e `EventListItem` como base.

**Campo novo em `events`** (migration):
- `type TEXT` — valores: `culto | oracao | jovens | evento | retiro | reuniao | especial | conferencia`
- `requires_rsvp BOOLEAN NOT NULL DEFAULT false` — controla quais eventos têm inscrição (separado de `is_paid`)

Mapeamento de cor por tipo (front-end only):
| Tipo | Cor |
|---|---|
| culto | primary |
| oracao | azul (#3B82F6) |
| jovens | roxo (#8B5CF6) |
| evento | accent |
| retiro | verde (#10B981) |
| reuniao | charcoal |
| especial | vermelho (#EF4444) |
| conferencia | laranja (#F97316) |

**Aba "📅 Agenda" (grid mensal)**:
- Grade 4×3 com os 12 meses abreviados
- Meses com eventos: fundo `surfaceMuted`, ponto indicador colorido
- Meses sem eventos: opacidade 35%, não clicáveis
- Mês selecionado: fundo `primary`, texto `accent`
- Clicar no mês filtra a lista abaixo com `useEvents` filtrado por mês
- Título do ano com link "← Todos os meses" quando mês selecionado

**Aba "🎟 Eventos" (RSVP gratuito — SEM nenhum fluxo de pagamento)**:
- Exibir apenas eventos com `requires_rsvp = true` (ignorar `is_paid` aqui)
- Card: header colorido por tipo, data completa, nome, local
- Barra de progresso: `registrations.count / events.capacity` (verde → dourado → vermelho)
- Contagem "X/Y inscritos"
- Botão "✦ Inscrever-se" → cria registro em `registrations` sem campo de pagamento
- Quando lotado (`count >= capacity`): badge "Lotado" vermelho, sem botão
- Hook de inscrição em `src/features/calendar/hooks/use-rsvp.ts` (pasta já existe com `.gitkeep`)

---

### 13.7 Módulo Células (`(tabs)/cells.tsx` + `features/cells/`)

Nova tabela `cells`:

```sql
CREATE TABLE cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  bairro TEXT NOT NULL,
  endereco TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  horario TEXT NOT NULL,
  lider TEXT NOT NULL,
  co_lider TEXT,
  num_membros INTEGER NOT NULL DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cor_hex TEXT NOT NULL DEFAULT '#1E3A5F',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS: mesma lógica por church_id
```

Tela em scroll único contendo (de cima para baixo):

1. **Palavra da Semana** — reaproveitar `WeeklyMessageCard` / `weekly_messages`; exibir em modo fechado (prévia 3 linhas + "Ler completo →"); expansível via modal ou inline com botão ✕
2. **Estatísticas** — 2 cards lado a lado: "Células" (fundo `primary`, número grande branco, label `silver`) e "Membros" (fundo `surface`, número em `primary`)
3. **Mapa das Células** — `react-native-maps` com marcadores numerados por célula; marcador central da Igreja com ícone de cruz em `accent`; tocar marcador → card com nome, endereço, dia/horário, líder, botão "🗺 Ir" (deep link para app de mapas nativo)
4. **Lista de todas as células** — cards com ícone colorido (`cor_hex`), nome, bairro, dia/horário, líder, botão "🗺 Ir"
5. **Cadastro de nova célula** — botão fixo que abre bottom sheet com formulário: nome, bairro, endereço, dia da semana, horário, líder, co-líder. Ao salvar, cor atribuída automaticamente de paleta rotativa

Hook: `src/features/cells/hooks/use-cells.ts`

---

### 13.8 Módulo Louvor (`(tabs)/worship.tsx` + `features/worship/`)

Novas tabelas:

```sql
CREATE TABLE worship_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- confirmado | pendente
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE worship_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES worship_schedules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  nome TEXT NOT NULL,
  role TEXT NOT NULL -- ex: "Vocal", "Guitarra", "Bateria"
);

CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  key TEXT,           -- tom musical ex: "G", "Am"
  chord_sheet_url TEXT, -- deixar pronto, não implementar upload agora
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE worship_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES worship_schedules(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id),
  ordem INTEGER NOT NULL DEFAULT 0
);
-- RLS em todas: por church_id
```

**Aba "Escalas"**:
- Lista de cultos: nome + badge status (✓ Confirmado verde / ⏳ Pendente dourado)
- Seção "Equipe": tags com nome e função (fonte mono)
- Seção "Músicas": lista com ícone ♪ em `accent` e nome
- Quando pendente: botões "✓ Confirmar" (`primary`) e "✕ Recusar" (cinza)

**Aba "Repertório"**:
- Lista de músicas: bloco de tom (`accent` sobre `primary`, fonte mono), nome, autor
- Botão "Cifra" (abre `chord_sheet_url` se disponível)
- Estrutura pronta para transposição de tom — não implementar agora

---

### 13.9 Módulo Marketplace (`(tabs)/modules.tsx` + `features/modules/`)

Nova tabela:

```sql
CREATE TABLE church_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (church_id, module_key)
);
-- RLS: admin da igreja gerencia; member lê
```

Módulos ativos por padrão para todas as igrejas:
`palavra`, `agenda`, `oracao`, `celulas`, `louvor`

Módulos disponíveis no marketplace:
`ao_vivo` (🎙️), `kids` (🧒), `gestao` (📊), `comunidade` (💼)

Tela:
- Grade 4 colunas de módulos ativos: fundo `primary`, ícone emoji, label branco, ponto `accent`
- Lista de módulos disponíveis: ícone em fundo cinza, nome, descrição, botão "Ativar" (`accent` sobre `primary`)
- Ativar/desativar = toggle em `church_modules.active` — sem qualquer fluxo de cobrança

---

### 13.10 UX e estilo globais

- Scroll vertical em todas as telas, sem paginação
- Modais de cadastro como bottom sheet deslizante com handle no topo
- Botões primários: fundo `primary`, texto `accent`, border-radius 12–16px
- Botões secundários: fundo `surface`, borda `silver`, texto `charcoal`
- Inputs: borda `silver`, fundo `surface`, border-radius 10px
- Cards: border-radius 16px, sombra suave, fundo `surface`
- Badges: verde (#10B981) para confirmado/vagas disponíveis, vermelho (#EF4444) para lotado/recusado, `accent` para pendente/destaque
- Fontes: mínimo 11px labels, 13px conteúdo, 20px dados numéricos de destaque
- Transições: 0.2s entre estados
- Todo texto em **português brasileiro**

---

### 13.11 Ordem de implementação sugerida

1. Estender `ChurchThemeProvider` com novos tokens (`accent`, `silver`, `charcoal`, `surfaceMuted`, `fonts`)
2. Adicionar `subtitle` em `churches`; exibir `logo_url` de fato no header e no Perfil
3. Criar `ChurchHeader` e reestruturar tab bar para 5 abas
4. Evoluir Home: novo visual do card Palavra do Dia + Mural de Oração (`prayer_requests`)
5. Módulo Agenda: grid mensal + aba Eventos com RSVP gratuito (hook em `features/calendar/hooks/`)
6. Módulo Células: tabela `cells`, mapa, lista, estatísticas, bottom sheet de cadastro
7. Módulo Louvor: tabelas `worship_schedules`, `worship_team_members`, `songs`, `worship_songs`; abas Escalas e Repertório
8. Módulo Marketplace: tabela `church_modules`, grade de ativação
9. Para cada tabela nova: criar migration seguindo exatamente o padrão de `20250603000000_initial.sql` (RLS por `church_id`, trigger `updated_at`, índices relevantes)
10. Para cada hook novo: seguir padrão de `use-events.ts` (mock fallback, `enabled: Boolean(churchId) && isSupabaseConfigured`)
