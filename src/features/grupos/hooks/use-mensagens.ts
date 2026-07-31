import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

export type MensagemGrupoRow = {
  id: string;
  grupo_id: string;
  user_id: string;
  text: string;
  created_at: string;
};

export function useMensagens(grupoId: string | undefined) {
  return useQuery({
    queryKey: ['mensagens', grupoId],
    enabled: Boolean(grupoId) && isSupabaseConfigured,
    queryFn: async (): Promise<MensagemGrupoRow[]> => {
      const { data, error } = await supabase
        .from('mensagens_grupo')
        .select('id, grupo_id, user_id, text, created_at')
        .eq('grupo_id', grupoId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as MensagemGrupoRow[];
    },
  });
}

export function useSendMensagem(grupoId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!userId) throw new Error('Não autenticado');
      const { error } = await supabase
        .from('mensagens_grupo')
        .insert({ grupo_id: grupoId, user_id: userId, text: text.trim() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mensagens', grupoId] }),
  });
}

export function useMensagensRealtime(grupoId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!grupoId || !isSupabaseConfigured) return;
    const channel = supabase
      .channel(`mensagens-grupo-${grupoId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens_grupo', filter: `grupo_id=eq.${grupoId}` },
        () => qc.invalidateQueries({ queryKey: ['mensagens', grupoId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [grupoId, qc]);
}
