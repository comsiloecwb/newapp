import { useQuery } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { MOCK_WEEKLY_MESSAGE } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';
import type { WeeklyMessage } from '@/types/database';

export function useLatestWeeklyMessage() {
  const churchId = useAuthStore((s) => s.church?.id);

  return useQuery({
    queryKey: ['weekly-message', 'latest', churchId],
    enabled: Boolean(churchId),
    queryFn: async (): Promise<WeeklyMessage | null> => {
      if (!isSupabaseConfigured) return MOCK_WEEKLY_MESSAGE;
      const { data, error } = await supabase
        .from('weekly_messages')
        .select('*')
        .eq('church_id', churchId!)
        .eq('published', true)
        .order('preached_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as WeeklyMessage | null;
    },
  });
}
