import { useQuery } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Grupo, User } from '@/types/database';

export type GrupoMembro = Pick<User, 'id' | 'nome' | 'email'>;

// A visibilidade é garantida pela RLS (grupos.select filtra por membros_grupo.user_id = auth.uid()),
// então a query no cliente é um select simples — não há como (nem necessidade de) repetir o filtro aqui.
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
