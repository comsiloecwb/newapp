# app-igreja — Contexto do Projeto

## Stack
- **Expo SDK 56** (managed workflow) + **Expo Router** (file-based routing)
- **Supabase** (auth, PostgreSQL, RLS)
- **TanStack Query** (queries e mutations)
- **Zustand** — store de auth (`src/stores/auth-store.ts`)
- **React Native SVG**, **expo-web-browser**, **expo-clipboard**
- Fontes: `PlayfairDisplay_500Medium` (constante `SERIF`)

## Supabase
- URL: `https://dovgkxtqjijkwaefrusy.supabase.co`
- Projeto ref: `dovgkxtqjijkwaefrusy`
- Org: Inovacao Pray (conta da startup)
- Migrations em `supabase/migrations/` — rodar manualmente no SQL Editor do dashboard quando não há Docker
- Não há `supabase link` configurado — `db push` não funciona sem Docker

## Autenticação
- Email/senha + Google OAuth
- OAuth flow: `signInWithOAuth` → `WebBrowser.openAuthSessionAsync` → parse do hash fragment → `setSession`
- Callback deep link: `appigreja://auth/callback`
- Store: `useAuthStore` (`profile`, `church`, `loadProfileAndNavigate`)

## Tema
- Provider: `src/theme/ChurchThemeProvider.tsx`
- Interface `ChurchTheme`: `text`, `textMuted`, `background`, `surface`, `elevated`, `accent`, `goldText`
- `textMuted: '#6E5E50'` (6.05:1 WCAG AA), `goldText: '#7D6300'` (5.59:1) — só usar `#C9A84C` em fundos escuros
- Fundo escuro padrão dos headers: `DARK_BG = '#0A1628'`

## Estrutura de rotas (Expo Router)
```
app/
  (auth)/          login, callback
  (tabs)/          index, eventos, comunidade, perfil
  event/[id]       detalhe do evento + check-in
  devocional/
    index          tela principal (tabs Hoje / Em Grupo)
    grupo/
      criar        criar grupo
      [id]         detalhe do grupo
  grupo/
    [code]         deep link handler (appigreja://grupo/CODE)
    entrar         digitar código manualmente
  comunidade/      palavras, oracao, doacoes, fotos
  palavra/[id]
```

## Funcionalidades implementadas
- **Login Google** via OAuth + expo-web-browser
- **Check-in de eventos** — botão sempre visível quando inscrito e não fez check-in (`checked_in_at` na tabela `registrations`)
- **Devocional diário** — 30 devocionais rotativos por dia do mês (`src/lib/devotionals.ts`), progresso em `reading_progress` com `plan_id = 'devocional-diario'`
- **Grupos de devocional** — qualquer membro cria, convite por código 6 chars ou deep link, membros veem conclusão uns dos outros via `group_day_completions`

## Tabelas do banco
- `profiles`, `churches`, `events`, `registrations` (+ `checked_in_at`)
- `reading_progress` (user_id, plan_id, day_number)
- `study_groups`, `study_group_members`, `group_day_completions`
- RLS: função `auth_church_id()` como `security definer` para evitar recursão na policy de `profiles`

## Modelo de distribuição (IMPORTANTE)
- Cada igreja tem seu **próprio app na loja** — build separado por cliente
- `EXPO_PUBLIC_CHURCH_ID` no `.env` identifica a igreja — hardcoded por build
- Usuário nunca digita código de igreja — o app já sabe qual é
- Multi-tenant no banco via `church_id`, mas single-tenant na experiência do usuário

## Padrões de código
- Sem comentários desnecessários — só quando o "por quê" não é óbvio
- Sem tratamento de erro para cenários impossíveis
- Cores WCAG: nunca usar `#C9A84C` (GOLD) em fundo claro — usar `theme.goldText`
- Mock data quando `!isSupabaseConfigured` para preview sem Supabase
- Commits: `git config user.name "Israel"`

## Git
- Branch de trabalho: `dev`
- Remote: `https://github.com/comsiloecwb/newapp.git`
- Autor: Israel <comsiloecwb@gmail.com>
