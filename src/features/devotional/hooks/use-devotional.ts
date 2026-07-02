import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { GroupDevotional, GroupDevotionalDay } from '@/types/database';

const DAILY_PLAN_ID = 'devocional-diario';

// ── Daily devotional progress ─────────────────────────────────────────────────

export function useDailyProgress() {
  const userId = useAuthStore((s) => s.profile?.id);
  return useQuery({
    queryKey: ['devotional-daily-progress', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<number[]> => {
      if (!isSupabaseConfigured) return [1];
      const { data, error } = await supabase
        .from('reading_progress')
        .select('day_number')
        .eq('user_id', userId!)
        .eq('plan_id', DAILY_PLAN_ID);
      if (error) throw error;
      return (data ?? []).map((r: { day_number: number }) => r.day_number);
    },
  });
}

export function useMarkDailyRead() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.profile?.id);
  return useMutation({
    mutationFn: async (dayNumber: number) => {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.from('reading_progress').upsert(
        { user_id: userId!, plan_id: DAILY_PLAN_ID, day_number: dayNumber },
        { onConflict: 'user_id,plan_id,day_number' },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devotional-daily-progress'] }),
  });
}

// ── Group devotionals ─────────────────────────────────────────────────────────

const MOCK_GROUP_DEVOTIONALS: GroupDevotional[] = [
  {
    id: 'gd-mock-1',
    church_id: '',
    title: 'Semana Santa',
    description: '7 dias meditando na Paixão e Ressurreição de Cristo',
    total_days: 7,
    published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gd-mock-2',
    church_id: '',
    title: 'Fundamentos da Fé',
    description: '30 dias percorrendo as grandes verdades da Bíblia',
    total_days: 30,
    published: true,
    created_at: new Date().toISOString(),
  },
];

export function useGroupDevotionals() {
  const churchId = useAuthStore((s) => s.church?.id);
  return useQuery({
    queryKey: ['group-devotionals', churchId],
    enabled: Boolean(churchId),
    queryFn: async (): Promise<GroupDevotional[]> => {
      if (!isSupabaseConfigured) return MOCK_GROUP_DEVOTIONALS;
      const { data, error } = await supabase
        .from('group_devotionals')
        .select('*')
        .eq('church_id', churchId!)
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as GroupDevotional[];
    },
  });
}

export function useGroupDevotionalDays(devotionalId: string) {
  return useQuery({
    queryKey: ['group-devotional-days', devotionalId],
    enabled: Boolean(devotionalId),
    queryFn: async (): Promise<GroupDevotionalDay[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('group_devotional_days')
        .select('*')
        .eq('devotional_id', devotionalId)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return (data ?? []) as GroupDevotionalDay[];
    },
  });
}

export function useGroupProgress(devotionalId: string) {
  const userId = useAuthStore((s) => s.profile?.id);
  return useQuery({
    queryKey: ['group-devotional-progress', devotionalId, userId],
    enabled: Boolean(devotionalId && userId),
    queryFn: async (): Promise<number[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('reading_progress')
        .select('day_number')
        .eq('user_id', userId!)
        .eq('plan_id', devotionalId);
      if (error) throw error;
      return (data ?? []).map((r: { day_number: number }) => r.day_number);
    },
  });
}

export function useMarkGroupDay(devotionalId: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.profile?.id);
  return useMutation({
    mutationFn: async (dayNumber: number) => {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.from('reading_progress').upsert(
        { user_id: userId!, plan_id: devotionalId, day_number: dayNumber },
        { onConflict: 'user_id,plan_id,day_number' },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['group-devotional-progress', devotionalId] }),
  });
}
