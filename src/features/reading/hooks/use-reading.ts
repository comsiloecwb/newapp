import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { ReadingProgress } from '@/types/database';

const MOCK_COMPLETED_DAYS = [1, 2, 3];

export function useReadingProgress(planId: string) {
  const userId = useAuthStore((s) => s.profile?.id);

  return useQuery({
    queryKey: ['reading-progress', planId, userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<number[]> => {
      if (!isSupabaseConfigured) return MOCK_COMPLETED_DAYS;

      const { data, error } = await supabase
        .from('reading_progress')
        .select('day_number')
        .eq('user_id', userId!)
        .eq('plan_id', planId)
        .order('day_number', { ascending: true });

      if (error) throw error;
      return (data as Pick<ReadingProgress, 'day_number'>[]).map((r) => r.day_number);
    },
  });
}

export function useCompleteDay(planId: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.profile?.id);

  return useMutation({
    mutationFn: async (dayNumber: number) => {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.from('reading_progress').upsert(
        { user_id: userId!, plan_id: planId, day_number: dayNumber },
        { onConflict: 'user_id,plan_id,day_number' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reading-progress', planId] });
    },
  });
}
