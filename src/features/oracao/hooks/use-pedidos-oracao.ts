import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

export type PedidoRow = {
  id: string;
  user_id: string;
  texto: string;
  is_lideranca_only: boolean;
  is_anonymous: boolean;
  nome_autor: string | null;
  created_at: string;
};

export function usePedidosOracao() {
  const user = useAuthStore((s) => s.user);
  const isLider = user?.is_lider || user?.role === 'superadmin' || user?.role === 'admin';

  return useQuery({
    queryKey: ['pedidos_oracao'],
    enabled: isSupabaseConfigured,
    queryFn: async (): Promise<PedidoRow[]> => {
      let query = supabase
        .from('pedidos_oracao')
        .select('id, user_id, texto, is_lideranca_only, is_anonymous, nome_autor, created_at')
        .order('created_at', { ascending: false });

      if (!isLider) {
        query = query.eq('is_lideranca_only', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as PedidoRow[];
    },
  });
}

export function useSubmitPedido() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenant?.id);

  return useMutation({
    mutationFn: async ({
      texto,
      is_lideranca_only,
    }: {
      texto: string;
      is_lideranca_only: boolean;
    }) => {
      if (!user || !tenantId) throw new Error('Não autenticado');
      const { error } = await supabase.from('pedidos_oracao').insert({
        tenant_id: tenantId,
        user_id: user.id,
        texto,
        is_lideranca_only,
        is_anonymous: false,
        nome_autor: user.nome,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos_oracao'] }),
  });
}

export function useDeletePedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pedidos_oracao').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos_oracao'] }),
  });
}
