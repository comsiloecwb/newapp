import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Clock, XCircle } from 'lucide-react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useInscricaoRealtime } from '@/features/inscricoes/hooks/use-inscricao-realtime';

const SERIF = 'PlayfairDisplay_500Medium';

export function InscricaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useChurchTheme();
  const { data: inscricao, isLoading } = useInscricaoRealtime(id);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Inscrição' }} />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <View style={styles.content}>
          {isLoading || !inscricao ? (
            <ActivityIndicator color={theme.accent} />
          ) : inscricao.status === 'pago' ? (
            <>
              <View style={[styles.iconWrap, { backgroundColor: '#16A34A20' }]}>
                <CheckCircle2 size={40} color="#16A34A" strokeWidth={1.8} />
              </View>
              <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>
                Inscrição confirmada! ✓
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Pagamento confirmado. Nos vemos no evento!
              </Text>
              <Pressable
                style={[styles.btn, { backgroundColor: theme.text }]}
                onPress={() => router.replace(`/event/${inscricao.evento_id}` as never)}
              >
                <Text style={[styles.btnText, { color: theme.background }]}>Ver evento</Text>
              </Pressable>
            </>
          ) : inscricao.status === 'cancelado' ? (
            <>
              <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
                <XCircle size={40} color="#DC2626" strokeWidth={1.8} />
              </View>
              <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>
                Inscrição cancelada
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Essa inscrição não foi confirmada. Você pode tentar novamente.
              </Text>
              <Pressable
                style={[styles.btn, { backgroundColor: theme.text }]}
                onPress={() => router.replace(`/event/${inscricao.evento_id}` as never)}
              >
                <Text style={[styles.btnText, { color: theme.background }]}>Tentar novamente</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[styles.iconWrap, { backgroundColor: theme.elevated }]}>
                <Clock size={40} color={theme.textMuted} strokeWidth={1.8} />
              </View>
              <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>
                Aguardando confirmação de pagamento...
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Assim que o pagamento for confirmado, sua inscrição é liberada automaticamente.
                Você pode fechar esta tela — avisamos quando estiver pronto.
              </Text>
              <ActivityIndicator color={theme.accent} style={{ marginTop: 8 }} />
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 22, textAlign: 'center', lineHeight: 28 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  btn: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 15, marginTop: 8 },
  btnText: { fontSize: 15, fontWeight: '600' },
});
