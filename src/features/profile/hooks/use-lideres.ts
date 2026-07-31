import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types/database';

export type LiderOption = Pick<User, 'id' | 'nome' | 'email'>;

export function useLideresDisponiveis(search: string) {
  const tenantId = useAuthStore((s) => s.tenant?.id);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['lideres-disponiveis', tenantId, search],
    enabled: Boolean(tenantId) && isSupabaseConfigured,
    queryFn: async (): Promise<LiderOption[]> => {
      let q = supabase
        .from('users')
        .select('id, nome, email')
        .eq('tenant_id', tenantId!)
        .eq('is_lider', true)
        .neq('id', userId!)
        .order('nome', { ascending: true });

      if (search.trim()) q = q.ilike('nome', `%${search.trim()}%`);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as LiderOption[];
    },
  });
}

export function useMeusLideres() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: ['meus-lideres', userId],
    enabled: Boolean(userId) && isSupabaseConfigured,
    queryFn: async (): Promise<LiderOption[]> => {
      const { data: links, error } = await supabase
        .from('user_lideres')
        .select('lider_id')
        .eq('user_id', userId!);
      if (error) throw error;

      const liderIds = (links ?? []).map((l) => l.lider_id as string);
      if (liderIds.length === 0) return [];

      const { data: lideres, error: lideresError } = await supabase
        .from('users')
        .select('id, nome, email')
        .in('id', liderIds);
      if (lideresError) throw lideresError;
      return (lideres ?? []) as LiderOption[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['meus-lideres', userId] });

  const addLider = useMutation({
    mutationFn: async (liderId: string) => {
      if (!userId) throw new Error('Não autenticado');
      const { error } = await supabase
        .from('user_lideres')
        .insert({ user_id: userId, lider_id: liderId });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: Error) => Alert.alert('Erro', err.message),
  });

  const removeLider = useMutation({
    mutationFn: async (liderId: string) => {
      if (!userId) throw new Error('Não autenticado');
      const { error } = await supabase
        .from('user_lideres')
        .delete()
        .eq('user_id', userId)
        .eq('lider_id', liderId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: Error) => Alert.alert('Erro', err.message),
  });

  return {
    lideres: query.data ?? [],
    isLoading: query.isLoading,
    addLider: addLider.mutate,
    removeLider: removeLider.mutate,
    isSaving: addLider.isPending || removeLider.isPending,
  };
}
