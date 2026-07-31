import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Celula, MembroCelula } from '@/types/database';

export function useCelulas() {
  return useQuery({
    queryKey: ['celulas'],
    enabled: isSupabaseConfigured,
    queryFn: async (): Promise<Celula[]> => {
      const { data, error } = await supabase
        .from('celulas')
        .select('id, tenant_id, nome, lider_id, endereco_completo, bairro, dia_semana, horario, contato_telefone')
        .order('nome');
      if (error) throw error;
      return (data ?? []) as Celula[];
    },
  });
}

export function useMinhaMembresia() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['membros_celula', userId],
    enabled: Boolean(userId) && isSupabaseConfigured,
    queryFn: async (): Promise<MembroCelula[]> => {
      const { data, error } = await supabase
        .from('membros_celula')
        .select('id, celula_id, user_id, status, created_at')
        .eq('user_id', userId!);
      if (error) throw error;
      return (data ?? []) as MembroCelula[];
    },
  });
}

export function useSolicitarEntrada() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: async (celulaId: string) => {
      if (!userId) throw new Error('Não autenticado');
      const { error } = await supabase
        .from('membros_celula')
        .insert({ celula_id: celulaId, user_id: userId, status: 'pendente' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['membros_celula'] }),
  });
}

export function useSairDaCelula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (membroId: string) => {
      const { error } = await supabase
        .from('membros_celula')
        .delete()
        .eq('id', membroId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['membros_celula'] }),
  });
}
