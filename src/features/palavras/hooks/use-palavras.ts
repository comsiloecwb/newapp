import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Palavra } from '@/types/database';

export function usePalavras() {
  const tenantId = useAuthStore((s) => s.tenant?.id);

  return useQuery({
    queryKey: ['palavras', tenantId],
    enabled: Boolean(tenantId),
    queryFn: async (): Promise<Palavra[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('palavras')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('published', true)
        .order('data', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Palavra[];
    },
  });
}

export function usePalavra(id: string) {
  return useQuery({
    queryKey: ['palavra', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Palavra | null> => {
      if (!isSupabaseConfigured) return null;
      const { data, error } = await supabase
        .from('palavras')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Palavra | null;
    },
  });
}
