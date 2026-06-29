import type { Church, Event, Profile, WeeklyMessage } from '@/types/database';

export const MOCK_CHURCH: Church = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Igreja Exemplo',
  slug: 'igreja-exemplo',
  logo_url: null,
  primary_color: '#1E3A5F',
  secondary_color: '#4A90D9',
};

export const MOCK_PROFILE: Profile = {
  id: '00000000-0000-4000-8000-000000000099',
  church_id: MOCK_CHURCH.id,
  role: 'editor',
  name: 'Dev Preview',
  email: 'dev@igreja.local',
  phone: null,
  notify_new_events: true,
  notify_event_reminders: true,
};

export const MOCK_WEEKLY_MESSAGE: WeeklyMessage = {
  id: '1',
  church_id: MOCK_CHURCH.id,
  title: 'Fé que move montanhas',
  content:
    'Mensagem de exemplo do culto de domingo. Conecte o Supabase para carregar conteúdo real.',
  image_url: null,
  preached_at: new Date().toISOString().slice(0, 10),
  published: true,
};

const inDays = (n: number, hour = 19) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    church_id: MOCK_CHURCH.id,
    title: 'Culto de domingo',
    description: 'Celebração semanal',
    cover_image_url: null,
    start_at: inDays(3),
    end_at: inDays(3, 21),
    location: 'Templo principal',
    is_paid: false,
    price_cents: null,
    capacity: null,
    published: true,
  },
  {
    id: 'evt-2',
    church_id: MOCK_CHURCH.id,
    title: 'Retiro jovem',
    description: 'Evento pago de exemplo',
    cover_image_url: null,
    start_at: inDays(14),
    end_at: inDays(14, 22),
    location: 'Sítio',
    is_paid: true,
    price_cents: 5000,
    capacity: 40,
    published: true,
  },
];
