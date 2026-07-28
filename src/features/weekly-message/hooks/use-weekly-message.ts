import { useQuery } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { MOCK_WEEKLY_MESSAGE } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';
import type { WeeklyMessage } from '@/types/database';

export function useLatestWeeklyMessage() {
  const tenantId = useAuthStore((s) => s.tenant?.id);

  return useQuery({
    queryKey: ['weekly-message', 'latest', tenantId],
    enabled: Boolean(tenantId),
    queryFn: async (): Promise<WeeklyMessage | null> => {
      if (!isSupabaseConfigured) return MOCK_WEEKLY_MESSAGE;
      const { data, error } = await supabase
        .from('palavras')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('published', true)
        .order('data', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as WeeklyMessage | null;
    },
  });
}
