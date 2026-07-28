import type { Tenant, User, Palavra, InAppNotification, Evento } from '@/types/database';

export const MOCK_CHURCH: Tenant = {
  id: '00000000-0000-4000-8000-000000000001',
  nome: 'Igreja Exemplo',
  slug: 'igreja-exemplo',
  logo_url: null,
  primary_color: '#1E3A5F',
  secondary_color: '#4A90D9',
  ativo: true,
  created_at: new Date().toISOString(),
};

export const MOCK_PROFILE: User = {
  id: '00000000-0000-4000-8000-000000000099',
  tenant_id: MOCK_CHURCH.id,
  role: 'admin',
  is_lider: false,
  nome: 'Dev Preview',
  email: 'dev@igreja.local',
  telefone: null,
  push_token: null,
  notify_new_events: true,
  notify_event_reminders: true,
  created_at: new Date().toISOString(),
};

export const MOCK_WEEKLY_MESSAGE: Palavra = {
  id: '1',
  tenant_id: MOCK_CHURCH.id,
  titulo: 'Fé que move montanhas',
  texto: 'Mensagem de exemplo do culto de domingo. Conecte o Supabase para carregar conteúdo real.',
  pregador: null,
  versiculo: null,
  data: new Date().toISOString().slice(0, 10),
  published: true,
  created_at: new Date().toISOString(),
};

const inDays = (n: number, hour = 19) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const MOCK_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    user_id: MOCK_PROFILE.id,
    tenant_id: MOCK_CHURCH.id,
    type: 'event_created',
    title: 'Novo evento: Culto de domingo',
    body: 'Celebração semanal',
    reference_id: 'evt-1',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: MOCK_PROFILE.id,
    tenant_id: MOCK_CHURCH.id,
    type: 'new_message',
    title: 'Nova palavra: Fé que move montanhas',
    body: 'Mensagem de exemplo do culto de domingo.',
    reference_id: '1',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const MOCK_EVENTS: Evento[] = [
  {
    id: 'evt-1',
    tenant_id: MOCK_CHURCH.id,
    titulo: 'Culto de domingo',
    descricao: 'Celebração semanal',
    cover_image_url: null,
    start_at: inDays(3),
    end_at: inDays(3, 21),
    location: 'Templo principal',
    rede: 'todos',
    is_paid: false,
    price_cents: null,
    vagas_total: null,
    vagas_alerta: null,
    published: true,
    created_by: null,
  },
  {
    id: 'evt-2',
    tenant_id: MOCK_CHURCH.id,
    titulo: 'Retiro jovem',
    descricao: 'Evento pago de exemplo',
    cover_image_url: null,
    start_at: inDays(14),
    end_at: inDays(14, 22),
    location: 'Sítio',
    rede: 'jovem',
    is_paid: true,
    price_cents: 5000,
    vagas_total: 40,
    vagas_alerta: 5,
    published: true,
    created_by: null,
  },
];
