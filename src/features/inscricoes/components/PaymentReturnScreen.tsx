import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

// Fallback para quando o navegador do Stripe fecha o app e volta via deep link
// (appigreja://payment-success ou payment-cancel) em vez do app já estar em foreground
// na tela de inscrição (o fluxo principal já navega pra lá antes de abrir o Stripe).
export function PaymentReturnScreen() {
  const { evento_id } = useLocalSearchParams<{ evento_id?: string }>();
  const theme = useChurchTheme();
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    async function redirecionar() {
      if (!evento_id || !userId || !isSupabaseConfigured) {
        router.replace('/(tabs)');
        return;
      }

      const { data: inscricao } = await supabase
        .from('inscricoes')
        .select('id')
        .eq('evento_id', evento_id)
        .eq('user_id', userId)
        .neq('status', 'cancelado')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      router.replace(
        inscricao ? (`/inscricao/${inscricao.id}` as never) : (`/event/${evento_id}` as never),
      );
    }
    void redirecionar();
  }, [evento_id, userId]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}
