import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Grupo, User } from '@/types/database';

export type GrupoMembro = Pick<User, 'id' | 'nome' | 'email'>;

export function useGrupos() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['grupos', userId],
    enabled: Boolean(userId) && isSupabaseConfigured,
    queryFn: async (): Promise<Grupo[]> => {
      const { data, error } = await supabase.from('grupos').select('*').order('nome', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Grupo[];
    },
  });
}

export function useGrupo(id: string | undefined) {
  return useQuery({
    queryKey: ['grupo', id],
    enabled: Boolean(id) && isSupabaseConfigured,
    queryFn: async (): Promise<Grupo | null> => {
      const { data, error } = await supabase.from('grupos').select('*').eq('id', id!).single();
      if (error) throw error;
      return data as Grupo;
    },
  });
}

export function useGrupoMembros(id: string | undefined) {
  return useQuery({
    queryKey: ['grupo-membros', id],
    enabled: Boolean(id) && isSupabaseConfigured,
    queryFn: async (): Promise<GrupoMembro[]> => {
      const { data: links, error } = await supabase
        .from('membros_grupo')
        .select('user_id')
        .eq('grupo_id', id!);
      if (error) throw error;

      const userIds = (links ?? []).map((l) => l.user_id as string);
      if (userIds.length === 0) return [];

      const { data: membros, error: membrosError } = await supabase
        .from('users')
        .select('id, nome, email')
        .in('id', userIds);
      if (membrosError) throw membrosError;
      return (membros ?? []) as GrupoMembro[];
    },
  });
}

export function useCreateGrupo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nome: string): Promise<Grupo> => {
      const { data, error } = await supabase.rpc('create_grupo', { p_nome: nome });
      if (error) throw error;
      return data as Grupo;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grupos'] }),
  });
}

export function useJoinGrupo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inviteCode: string): Promise<Grupo> => {
      const { data, error } = await supabase.rpc('join_grupo_by_invite_code', { p_invite_code: inviteCode });
      if (error) throw error;
      return data as Grupo;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grupos'] }),
  });
}

export function useLeaveGrupo(grupoId: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Não autenticado');
      const { error } = await supabase
        .from('membros_grupo')
        .delete()
        .eq('grupo_id', grupoId)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grupos'] }),
  });
}
