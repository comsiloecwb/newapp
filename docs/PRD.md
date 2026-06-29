# PRD — App Igreja

> Fonte: PRD oficial (PDF). Atualize este arquivo quando decisões mudarem.

## Visão geral

Aplicativo mobile **multi-igrejas** para comunicação, eventos e gestão de participação.

**Problemas:** WhatsApp descentralizado, baixa adesão a eventos, sem controle de inscrições, lembretes difíceis.

**Plataforma:** iOS e Android (lojas).

## Stack

| Camada | Tecnologia |
|--------|------------|
| App | Expo, React Native, **Expo Router**, TypeScript strict |
| Estado remoto | React Query |
| Estado local | Zustand |
| Backend | Supabase (Auth, Postgres, Storage, Realtime, Edge Functions) |
| Pagamentos | Stripe Checkout |
| Push | Expo Push Notifications |

## Multi-tenant

- Toda tabela de negócio tem `church_id UUID NOT NULL`.
- Nenhum usuário acessa dados de outra igreja (RLS).
- Tema por igreja: `logo_url`, `primary_color`, `secondary_color`.

## Perfis (`profiles`)

| Role | Permissões |
|------|------------|
| `admin` | Eventos, membros, conteúdo, config igreja, inscrições |
| `editor` | Criar/editar eventos e conteúdo (sem config nem usuários) |
| `member` | Ver, RSVP, comprar, editar próprio perfil |

RLS valida `church_id` + `role`.

## Navegação

Tabs: **Home** | **Calendário** | **Perfil**

### Home
- Palavra da semana (`weekly_messages`)
- Próximos eventos (imagem, título, data, local, status inscrição)

### Calendário
- Lista completa; filtros próximos / passados
- Vista mensal: fase futura

### Eventos
- RSVP gratuito → `registrations.status`: confirmed | cancelled
- Pago → Stripe Checkout → webhook → inscrição + ingresso

### Perfil
- Dados do membro, preferências de notificação

## Push

| Gatilho | Mensagem |
|---------|----------|
| Evento publicado | "Novo evento disponível." |
| 24h antes | "Seu evento começa em breve." |
| 1h antes | "Seu evento começa em breve." |

## Banco (MVP)

`churches`, `profiles` (PRD: users), `events`, `registrations`, `payments`, `push_tokens`, `weekly_messages`, `scheduled_notifications`

### scheduled_notifications

Fila de envio processada por **pg_cron** (lembretes 24h/1h e aviso de evento novo).

| Campo | Tipo |
|-------|------|
| `id` | UUID |
| `event_id` | UUID → `events` |
| `church_id` | UUID → `churches` |
| `send_at` | timestamptz — quando disparar |
| `type` | `'reminder_24h'` \| `'reminder_1h'` \| `'event_created'` |
| `sent_at` | timestamptz nullable — preenchido após envio |

Storage: `church-logos`, `event-covers`, `weekly-messages`

## Fora do MVP

Áudio/player, mapa, chat, streaming, QR check-in (fase 2).

## Regras para IA (Cursor)

1. Multi-tenancy via `church_id`
2. Nunca expor dados de outra igreja
3. RLS em todas as tabelas
4. TypeScript strict, Expo Router, React Query, Zustand só local
5. Arquitetura **feature-based**
6. Não implementar fora do roadmap sem pedido explícito
