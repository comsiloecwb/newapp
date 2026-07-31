import { useQuery } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// Mesma lógica de agregação de use-eventos.ts, para um único evento.
export function useVagasRestantes(eventoId: string | undefined, vagasTotal: number | null | undefined) {
  return useQuery({
    queryKey: ['vagas-restantes', eventoId],
    enabled: Boolean(eventoId) && vagasTotal != null && isSupabaseConfigured,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('inscricoes')
        .select('id', { count: 'exact', head: true })
        .eq('evento_id', eventoId!)
        .neq('status', 'cancelado');
      if (error) throw error;
      return Math.max(vagasTotal! - (count ?? 0), 0);
    },
  });
}
