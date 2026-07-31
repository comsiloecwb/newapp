export type UserRole = 'superadmin' | 'admin' | 'member' | 'visitor';
export type MembershipStatus = 'pendente' | 'aprovado' | 'negado';
export type CelulaStatus = 'pendente' | 'aprovado' | 'rejeitado';
export type InscricaoStatus = 'pendente' | 'pago' | 'cancelado';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type NotificationType = 'event_created' | 'new_message' | 'event_reminder' | 'announcement';
export type RedeType = 'todos' | 'homens' | 'mulheres' | 'jovem' | 'casais' | 'kids';

export interface Tenant {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  ativo: boolean;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  role: UserRole;
  is_lider: boolean;
  nome: string;
  email: string;
  telefone: string | null;
  push_token: string | null;
  notify_new_events: boolean;
  notify_event_reminders: boolean;
  created_at: string;
}

export interface Filho {
  id: string;
  user_id: string;
  nome: string;
  data_nascimento: string;
  created_at: string;
}

export interface MembershipRequest {
  id: string;
  user_id: string;
  tenant_id: string;
  status: MembershipStatus;
  created_at: string;
}

export interface UserLider {
  user_id: string;
  lider_id: string;
  created_at: string;
}

export interface Evento {
  id: string;
  tenant_id: string;
  titulo: string;
  descricao: string;
  cover_image_url: string | null;
  start_at: string;
  end_at: string;
  location: string;
  rede: RedeType;
  is_paid: boolean;
  price_cents: number | null;
  vagas_total: number | null;
  vagas_alerta: number | null;
  published: boolean;
  created_by: string | null;
}

export interface Inscricao {
  id: string;
  tenant_id: string;
  user_id: string;
  evento_id: string;
  status: InscricaoStatus;
  payment_id: string | null;
  checked_in_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  user_id: string;
  evento_id: string;
  stripe_session_id: string;
  amount_cents: number;
  status: PaymentStatus;
}

export interface Celula {
  id: string;
  tenant_id: string;
  nome: string;
  lider_id: string | null;
  endereco_completo: string | null;
  bairro: string | null;
  dia_semana: string | null;
  horario: string | null;
  contato_telefone: string | null;
}

export interface MembroCelula {
  id: string;
  celula_id: string;
  user_id: string;
  status: CelulaStatus;
  created_at: string;
}

export interface PedidoOracao {
  id: string;
  tenant_id: string;
  user_id: string;
  texto: string;
  is_lideranca_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface Palavra {
  id: string;
  tenant_id: string;
  pregador: string | null;
  data: string;
  titulo: string;
  versiculo: string | null;
  texto: string;
  published: boolean;
  created_at: string;
}

export interface Grupo {
  id: string;
  tenant_id: string;
  nome: string;
  invite_code: string;
  created_by: string | null;
  created_at: string;
}

export interface MembroGrupo {
  grupo_id: string;
  user_id: string;
  role: 'admin' | 'membro';
  joined_at: string;
}

export interface MensagemGrupo {
  id: string;
  grupo_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  tenant_id: string;
  type: NotificationType;
  title: string;
  body: string;
  reference_id: string | null;
  read: boolean;
  created_at: string;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  plan_id: string;
  day_number: number;
  completed_at: string;
}

export interface StudyGroup {
  id: string;
  tenant_id: string | null;
  created_by: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_at: string;
}

export interface StudyGroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface GroupDayCompletion {
  group_id: string;
  user_id: string;
  day_number: number;
  completed_at: string;
}

// Legacy aliases para compatibilidade temporária
export type Church = Tenant;
export type Profile = User;
export type Event = Evento;
export type Registration = Inscricao;
export type WeeklyMessage = Palavra;
