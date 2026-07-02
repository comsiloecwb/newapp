export type UserRole = 'admin' | 'editor' | 'member';
export type RegistrationStatus = 'confirmed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type ScheduledNotificationType = 'reminder_24h' | 'reminder_1h' | 'event_created';
export type InAppNotificationType = 'event_created' | 'new_message' | 'event_reminder' | 'announcement';

export interface Church {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

export interface Profile {
  id: string;
  church_id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string | null;
  notify_new_events: boolean;
  notify_event_reminders: boolean;
}

export interface WeeklyMessage {
  id: string;
  church_id: string;
  title: string;
  content: string;
  image_url: string | null;
  preached_at: string;
  published: boolean;
}

export interface Event {
  id: string;
  church_id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  start_at: string;
  end_at: string;
  location: string;
  is_paid: boolean;
  price_cents: number | null;
  capacity: number | null;
  published: boolean;
}

export interface Registration {
  id: string;
  church_id: string;
  user_id: string;
  event_id: string;
  status: RegistrationStatus;
  payment_id: string | null;
  checked_in_at: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  event_id: string;
  stripe_session_id: string;
  amount_cents: number;
  status: PaymentStatus;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  church_id: string;
  type: InAppNotificationType;
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

export interface ScheduledNotification {
  id: string;
  event_id: string;
  church_id: string;
  send_at: string;
  type: ScheduledNotificationType;
  sent_at: string | null;
}
