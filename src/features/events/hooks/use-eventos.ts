import { useQuery } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Evento, RedeType } from '@/types/database';

export type AgendaModo = 'proximos' | 'passados';

export interface EventoAgenda extends Evento {
  vagasRestantes: number | null;
  confirmado: boolean;
}

type EventoComInscricaoPropria = Evento & { inscricoes: { status: string }[] | null };

// Cache por aba: mesma queryKey (tenant + rede + modo) fica servida do cache do React Query
// por STALE_TIME sem refetch — voltar para uma aba/seção já visitada na sessão é instantâneo.
const STALE_TIME = 5 * 60 * 1000;
const LIMITE_PASSADOS = 20;

export function useEventos(rede: RedeType, modo: AgendaModo = 'proximos') {
  const tenantId = useAuthStore((s) => s.tenant?.id);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['eventos', 'agenda', modo, tenantId, rede, userId],
    enabled: Boolean(tenantId) && Boolean(userId) && isSupabaseConfigured,
    staleTime: STALE_TIME,
    queryFn: async (): Promise<EventoAgenda[]> => {
      const hoje = new Date().toISOString();

      // Left join com inscricoes filtrado para a inscrição do próprio usuário (se houver) —
      // eventos sem inscrição do usuário continuam aparecendo, só vêm com inscricoes: [].
      let query = supabase
        .from('eventos')
        .select('*, inscricoes!left(status)')
        .eq('tenant_id', tenantId!)
        .eq('published', true)
        .eq('inscricoes.user_id', userId!);

      if (rede !== 'todos') {
        query = query.in('rede', [rede, 'todos']);
      }

      query =
        modo === 'proximos'
          ? query.gte('start_at', hoje).order('start_at', { ascending: true })
          : query
              .lt('start_at', hoje)
              .order('start_at', { ascending: false })
              .limit(LIMITE_PASSADOS);

      const { data, error } = await query;
      if (error) throw error;
      const eventos = (data ?? []) as EventoComInscricaoPropria[];

      const eventosComCapacidade = eventos.filter((e) => e.vagas_total != null);
      const countByEvento = new Map<string, number>();
      if (eventosComCapacidade.length > 0) {
        const { data: inscricoes, error: inscricoesError } = await supabase
          .from('inscricoes')
          .select('evento_id')
          .in('evento_id', eventosComCapacidade.map((e) => e.id))
          .neq('status', 'cancelado');
        if (inscricoesError) throw inscricoesError;
        (inscricoes ?? []).forEach((i) => {
          countByEvento.set(i.evento_id, (countByEvento.get(i.evento_id) ?? 0) + 1);
        });
      }

      return eventos.map(({ inscricoes, ...evento }) => ({
        ...evento,
        vagasRestantes:
          evento.vagas_total != null
            ? Math.max(evento.vagas_total - (countByEvento.get(evento.id) ?? 0), 0)
            : null,
        confirmado: (inscricoes ?? []).some((i) => i.status === 'pago'),
      }));
    },
  });
}
