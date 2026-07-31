import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Registration } from '@/types/database';

const QUERY_KEY = 'inscricao';

export function useInscricaoRealtime(inscricaoId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, inscricaoId],
    enabled: Boolean(inscricaoId) && isSupabaseConfigured,
    queryFn: async (): Promise<Registration> => {
      const { data, error } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('id', inscricaoId!)
        .single();
      if (error) throw error;
      return data as Registration;
    },
  });

  // Escuta mudanças de status (webhook do Stripe ou admin confirmando manualmente no CMS)
  useEffect(() => {
    if (!isSupabaseConfigured || !inscricaoId) return;

    const channel = supabase
      .channel(`inscricao:${inscricaoId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inscricoes',
          filter: `id=eq.${inscricaoId}`,
        },
        (payload) => {
          queryClient.setQueryData([QUERY_KEY, inscricaoId], payload.new as Registration);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [inscricaoId, queryClient]);

  return query;
}
