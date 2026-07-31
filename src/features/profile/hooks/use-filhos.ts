import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Filho } from '@/types/database';

export const MAX_FILHOS = 10;

export function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade -= 1;
  return Math.max(idade, 0);
}

export function useFilhos() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: ['filhos', userId],
    enabled: Boolean(userId) && isSupabaseConfigured,
    queryFn: async (): Promise<Filho[]> => {
      const { data, error } = await supabase
        .from('filhos')
        .select('*')
        .eq('user_id', userId!)
        .order('data_nascimento', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Filho[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['filhos', userId] });

  const addFilho = useMutation({
    mutationFn: async ({ nome, dataNascimento }: { nome: string; dataNascimento: string }) => {
      if (!userId) throw new Error('Não autenticado');
      if ((query.data?.length ?? 0) >= MAX_FILHOS) {
        throw new Error(`Limite máximo de ${MAX_FILHOS} filhos por usuário atingido.`);
      }
      const { error } = await supabase
        .from('filhos')
        .insert({ user_id: userId, nome, data_nascimento: dataNascimento });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: Error) => Alert.alert('Erro', err.message),
  });

  const updateFilho = useMutation({
    mutationFn: async ({
      id,
      nome,
      dataNascimento,
    }: {
      id: string;
      nome: string;
      dataNascimento: string;
    }) => {
      const { error } = await supabase
        .from('filhos')
        .update({ nome, data_nascimento: dataNascimento })
        .eq('id', id)
        .eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: Error) => Alert.alert('Erro', err.message),
  });

  const deleteFilho = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('filhos').delete().eq('id', id).eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: Error) => Alert.alert('Erro', err.message),
  });

  return {
    filhos: query.data ?? [],
    isLoading: query.isLoading,
    addFilho: addFilho.mutate,
    updateFilho: updateFilho.mutate,
    deleteFilho: deleteFilho.mutate,
    isSaving: addFilho.isPending || updateFilho.isPending || deleteFilho.isPending,
  };
}
