import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

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
