# PROJECT MEMORY — App de Igreja

> Este documento é a memória de projeto. Sempre que iniciar uma sessão no Cursor ou Claude, cole este arquivo como contexto. Ele contém decisões de arquitetura, backlog priorizado, hierarquia de roles, roadmap de sprints e regras de negócio críticas.

---

## 1. Visão geral

Aplicativo mobile para gestão de igrejas, com:
- App mobile em **React Native**
- Backend e banco de dados em **Supabase** (auth + RLS + edge functions)
- Painel CMS web em **Next.js** (a ser construído do zero)
- 2 desenvolvedores no time

---

## 2. Stack técnico

| Camada | Tecnologia |
|---|---|
| App mobile | React Native |
| Backend / DB | Supabase (PostgreSQL + RLS + Edge Functions) |
| CMS web | Next.js (novo, do zero) |
| Auth | Supabase Auth |
| Pagamentos | A definir (Stripe / Pagar.me — webhook necessário no Sprint 3) |

---

## 3. Hierarquia de roles

São 5 perfis no sistema. O campo no banco é `users.role` + `users.is_lider`.

### 3.1 Superadmin
- **Quem:** Israel, Welly e Rafa (donos do app)
- **Acesso:** irrestrito, cross-tenant (acessa qualquer igreja)
- **Interface:** painel separado em `/superadmin/*` no CMS
- **Pode:**
  - Criar / suspender tenants (igrejas)
  - Acessar qualquer igreja no modo admin
  - Gerenciar planos e billing
  - Ver logs e métricas globais
  - Promover / rebaixar admins
  - Deletar dados permanentemente
  - Forçar aprovação de membros

### 3.2 Admin
- **Quem:** administradores de cada igreja (um ou mais por tenant)
- **Acesso:** restrito ao próprio tenant
- **Interface:** painel em `/admin/*` no CMS
- **Pode:**
  - Aprovar / negar solicitações de membro (com checkbox individual ou "selecionar todos")
  - Cadastrar tag `is_lider = true` em usuários
  - Aprovar membros de células
  - Ver pedidos de oração marcados como "só liderança"
  - Criar / editar eventos (com configuração de vagas restantes)
  - Importar Palavra (pregador, data, título, versículo, texto)
  - Criar e editar células
  - Gerenciar grupos e notificações segmentadas
- **Não pode:** acessar outras igrejas, alterar planos, ver logs globais, promover outros admins

### 3.3 Liderança (tag, não role separado)
- **Implementação:** `users.role = 'member'` + `users.is_lider = true`
- **A tag é atribuída pelo admin** — não pelo próprio usuário
- **Acesso extra vs membro comum:**
  - Ver pedidos de oração "só liderança"
  - Ser cadastrado como líder de célula ou grupo (só usuários com `is_lider = true` aparecem no select de líder no CMS)
  - Receber notificações específicas de liderança

### 3.4 Membro
- **Quem:** usuário aprovado pelo admin
- **Pode:**
  - Ver agenda completa com filtros de rede
  - Confirmar inscrição em eventos (apenas após pagamento)
  - Ver grupos nos quais está adicionado
  - Acessar endereço completo de células (após aprovação na célula)
  - Criar, editar e excluir próprios pedidos de oração
  - Informar líder(es) no perfil
  - Cadastrar filho(s)
  - Solicitar membrar-se a células

### 3.5 Visitante
- **Quem:** usuário cadastrado mas ainda não aprovado
- **Pode:**
  - Ver lista de células (somente bairro, sem endereço completo)
  - Ver eventos públicos na agenda
  - Solicitar "membrar-se à igreja"
  - Ver devocional
- **Não pode:** confirmar eventos, acessar grupos, ver pedidos de oração, ver endereço de células, ver palavra completa

---

## 4. Regras de negócio críticas

### Auth e multi-tenant
- Todo usuário pertence a um `tenant_id` (a igreja)
- RLS no Supabase deve isolar dados por tenant em todas as tabelas
- Superadmin bypassa RLS (service role key apenas no painel `/superadmin`)
- Admin acessa apenas dados do próprio `tenant_id`

### Células
- Tabela `celulas` + tabela `membros_celula` com campo `status` (pendente / aprovado / rejeitado)
- Visitantes e membros não aprovados na célula: veem apenas `bairro` (nunca `endereco_completo`)
- Após aprovação na célula: membro acessa endereço completo e recebe notificações da célula
- Somente usuários com `is_lider = true` podem ser selecionados como líder ao criar uma célula no CMS

### Agenda / Eventos
- Evento tem campo `rede` (Todos / Homens / Mulheres / Jovem / Casais / Kids) — usado para filtro em abas no app
- Evento tem campos `vagas_total` e `vagas_alerta` (a partir de quantas vagas exibe "X vagas restantes")
- Inscrição só é liberada após confirmação de pagamento (webhook do gateway → atualiza `inscricoes.status = 'pago'`)
- App exibe badge de confirmado em eventos próximos e passados para o usuário logado

### Mural de oração
- Pedido tem campo `is_lideranca_only boolean`
- Se `true`: não aparece na aba Comunidade para membros comuns, apenas para liderança e admin
- Usuário pode editar/excluir apenas os próprios pedidos
- Ícone de reação: "mão orando" (amém), não coração

### Liderança
- Regra hard: admin só consegue cadastrar alguém como líder (de célula, grupo, etc.) se o usuário tiver `is_lider = true`
- O campo `is_lider` só pode ser atribuído por admin ou superadmin

### Aprovação de membros
- Fluxo: visitante solicita → cai na fila do CMS → admin aprova/nega → role atualiza automaticamente
- Admin pode selecionar múltiplos e aprovar/negar em lote

---

## 5. Backlog priorizado

### ✅ Pronto para deploy imediato
- **2 · Dízimos** — OK, sem pendências

### 🔴 Alta prioridade (Sprint 1 e 2)
- **8 · Gestão de Usuários**
  - 8.1 Área de aprovação com checkbox (individual e "selecionar todos"), ações: aprovar / negar
  - 8.2 Cadastrar tag liderança — somente usuários com tag podem ser líder
- **7 · Membros**
  - 7.1 Solicitar "membrar-se à igreja"
  - 7.2 Preencher líder(es) no perfil
  - 7.3 Cadastro de filho(s)
- **5 · Grupos** — exibir apenas grupos nos quais o usuário está adicionado
- **3.5 · Agenda** — inscrição bloqueada até pagamento confirmado

### 🟡 Média prioridade (Sprint 3, 4 e 5)
- **3 · Tela Agenda**
  - 3.1 Filtro em abas por Rede (Todos / Homens / Mulheres / Jovem / Casais / Kids)
  - 3.2 Sinalizar eventos confirmados em Eventos Próximos
  - 3.3 Sinalizar eventos que o usuário foi em Eventos Passados
  - 3.4 Parametrizar alerta de vagas restantes na criação do evento
- **6.3 · Células (novo menu em Comunidade)**
  - 6.3.1 Admin cria célula: nome, líder (só `is_lider`), endereço, dia, horário, contato
  - 6.3.2 Visitante vê só bairro; membro aprovado vê endereço completo
  - 6.3.3 Solicitar participar da célula
  - 6.3.4 Após aprovação: endereço completo + notificações
- **6.2 · Mural de Oração**
  - 6.2.1 Editar/excluir próprio pedido
  - 6.2.2 Pedidos "só liderança" invisíveis na aba Comunidade
  - 6.2.3 Ícone: mão orando no lugar do coração
- **6.1 · Palavra**
  - 6.1.1 Admin importa palavra: pregador, data, título, versículo, texto

### 🔵 Baixa prioridade (Sprint 6)
- **1 · Central de Notificações (sino)** — abas: Todos / Eventos / Louvor
- **4 · Devocional** — exibir endereço do texto junto ao bloco do versículo

---

## 6. Roadmap de sprints

Duração total estimada: **12 semanas (3 meses)** com 2 devs trabalhando em paralelo.

---

### FASE 1 — Fundação (Sprints 1–3, ~6 semanas)

#### Sprint 1 — Roles, auth e estrutura multi-tenant (2 semanas)
**Dev 1 (DB/Backend):**
- Tabela `users` com campos: `role` (superadmin | admin | member | visitor), `is_lider boolean`, `tenant_id`
- RLS policies por role em todas as tabelas
- Tabela de aprovações de membros (`membership_requests`)
- Middleware de autorização por role nas edge functions

**Dev 2 (CMS):**
- Setup Next.js + autenticação superadmin (service role)
- Tela de login separada: superadmin vs admin
- Layout base: sidebar, header, rotas protegidas por role
- Listagem de igrejas/tenants (superadmin)

> ⚠️ Sprint bloqueante — nenhuma outra feature pode ser construída antes desse estar completo.

---

#### Sprint 2 — Gestão de usuários + aprovação de membros (2 semanas)
**Dev 1 (App):**
- Tela "Solicitar ser membro" (visitante)
- Tela de perfil: informar líder(es)
- Cadastro de filho(s)
- Grupos: exibir apenas grupos do usuário

**Dev 2 (CMS):**
- Fila de aprovação com checkbox (aprovar / negar individual e em lote)
- Atribuir tag `is_lider` ao usuário
- Listagem de membros com filtros

---

#### Sprint 3 — Agenda completa + pagamento/inscrição (2 semanas)
**Dev 1 (App):**
- Filtro por Rede em abas na tela de agenda
- Badge "confirmado" em eventos próximos e passados
- Bloquear inscrição até pagamento confirmado
- Exibir "X vagas restantes" dinamicamente

**Dev 2 (CMS + API):**
- Criação de evento: campo `rede` + campo `vagas_alerta`
- Visualizar inscritos por evento
- Webhook de pagamento → atualiza `inscricoes.status` → libera inscrição

> ⚠️ Risco: configuração do webhook de pagamento pode atrasar 3–5 dias. Mapear gateway antes de iniciar.

---

### FASE 2 — Comunidade (Sprints 4–6, ~6 semanas)

#### Sprint 4 — Células (novo módulo) (2 semanas)
**Dev 1 (App):**
- Menu Células dentro de Comunidade
- Lista de células: visitante vê só bairro
- Membro aprovado: endereço completo + notificações da célula
- Botão "Solicitar participar"

**Dev 2 (CMS + DB):**
- Tabela `celulas` + tabela `membros_celula` (status: pendente / aprovado / rejeitado)
- CMS: criar célula com select de líder (somente `is_lider = true`)
- CMS: aprovar / rejeitar solicitações de participação
- RLS: endereço bloqueado para quem não é membro aprovado na célula

---

#### Sprint 5 — Mural de oração + Palavra (2 semanas)
**Dev 1 (App):**
- Editar / excluir próprio pedido de oração
- Ocultar pedidos `is_lideranca_only` da aba Comunidade para não-líderes
- Ícone de amém (mão orando) no lugar do coração
- Tela Palavra: exibir pregador, data, versículo e texto

**Dev 2 (CMS + DB):**
- Campo `is_lideranca_only boolean` na tabela de pedidos de oração
- CMS: formulário de importação de Palavra
- CMS: visualizar todos os pedidos (incluindo os "só liderança")

---

#### Sprint 6 — Notificações + Devocional + polimento (2 semanas)
**Dev 1 (App):**
- Central de notificações: abas Todos / Eventos / Louvor
- Devocional: endereço do versículo no bloco
- Testes e ajustes pós-QA

**Dev 2 (CMS):**
- Envio de notificação segmentada por tipo (evento / louvor)
- Dashboard básico: total de membros, células ativas, eventos
- Refinamentos gerais e QA final

---

## 7. Estrutura de tabelas sugerida (Supabase)

```sql
tenants (id, nome, slug, ativo, created_at)
users (id, tenant_id, role, is_lider, nome, email, telefone, created_at)
filhos (id, user_id, nome, data_nascimento)
membership_requests (id, user_id, tenant_id, status, created_at)
eventos (id, tenant_id, titulo, descricao, data, rede, vagas_total, vagas_alerta, created_at)
inscricoes (id, evento_id, user_id, status, created_at)
celulas (id, tenant_id, nome, lider_id, endereco_completo, bairro, dia_semana, horario, contato_telefone)
membros_celula (id, celula_id, user_id, status, created_at)
pedidos_oracao (id, tenant_id, user_id, texto, is_lideranca_only, created_at)
palavras (id, tenant_id, pregador, data, titulo, versiculo, texto, created_at)
grupos (id, tenant_id, nome)
membros_grupo (grupo_id, user_id)
```

---

## 8. Decisões de arquitetura

- **RLS é a camada de segurança principal.**
- **Superadmin usa service role key** apenas no CMS `/superadmin` — nunca no app mobile.
- **`is_lider` é uma tag, não um role.**
- **CMS em Next.js** — `/superadmin/*` usa service role, `/admin/*` verifica tenant_id + role admin.
- **Webhook de pagamento** é o único ponto de integração externa crítica.
- **Multi-tenant via `tenant_id`** em todas as tabelas.

---

## 9. O que já está pronto no app mobile

- Login email/senha + Google OAuth ✅
- Devocional diário com grupos ✅
- Eventos com check-in ✅
- Dízimos ✅
- Palavra da semana ✅
- Mural de oração (básico) ✅
- Push notifications (base) ✅

## 10. Divergências entre implementação atual e este plano

| Item | Atual (código) | Planejado |
|---|---|---|
| Tabela de igrejas | `churches` | `tenants` |
| Tabela de usuários | `profiles` | `users` |
| Roles | admin/editor/member | superadmin/admin/member/visitor + is_lider |
| Chave tenant | `church_id` | `tenant_id` |
| Visitante | não existe | role separado com acesso restrito |
| CMS | não existe | Next.js a construir |

> ⚠️ Antes do Sprint 1: decidir se migra o schema atual ou reconstrói do zero no Supabase novo.

---

## 11. Riscos mapeados

| Risco | Impacto | Mitigação |
|---|---|---|
| Gateway de pagamento sem webhook | Bloqueia Sprint 3 | Definir e configurar antes do Sprint 3 iniciar |
| RLS mal configurada | Vazamento de dados entre tenants | Testes de RLS isolados antes de qualquer feature |
| CMS do zero com 2 devs | Atraso nas fases 1 e 2 | Dev 2 focado 100% no CMS nas primeiras 4 sprints |
| Select de líder sem filtro `is_lider` | Admin cadastra líder errado | Validação no backend + RLS, não só no frontend |

---

*Última atualização: julho 2026*
