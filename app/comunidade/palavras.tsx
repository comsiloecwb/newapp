import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { usePalavras } from '@/features/palavras/hooks/use-palavras';

const DARK_BG = '#160A2E';
const SERIF = 'PlayfairDisplay_500Medium';

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function PalavrasScreen() {
  const theme = useChurchTheme();
  const { data: palavras, isLoading } = usePalavras();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Palavras',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {isLoading ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
          ) : !palavras || palavras.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              Nenhuma mensagem disponível.
            </Text>
          ) : (
            <>
              <Text style={[styles.intro, { color: theme.textMuted }]}>
                {palavras.length} {palavras.length === 1 ? 'mensagem disponível' : 'mensagens disponíveis'}
              </Text>

              {palavras.map((p) => (
                <Pressable
                  key={p.id}
                  style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => router.push(`/palavra/${p.id}` as never)}
                >
                  <View style={styles.cardMain}>
                    {p.versiculo && (
                      <Text style={[styles.reference, { color: theme.goldText }]}>{p.versiculo}</Text>
                    )}
                    <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]} numberOfLines={2}>
                      {p.titulo}
                    </Text>
                    <Text style={[styles.meta, { color: theme.textMuted }]}>
                      {p.pregador ? `${p.pregador}  ·  ` : ''}{formatDate(p.data)}
                    </Text>
                    <Text style={[styles.summary, { color: theme.textMuted }]} numberOfLines={3}>
                      {p.texto}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.textMuted} strokeWidth={1.6} style={{ flexShrink: 0 }} />
                </Pressable>
              ))}
            </>
          )}

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },

  intro: { fontSize: 13, marginBottom: 4 },
  empty: { fontSize: 14, textAlign: 'center', marginTop: 40 },

  card: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardMain: { flex: 1, gap: 5 },
  reference: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  title: { fontSize: 17, lineHeight: 23 },
  meta: { fontSize: 12 },
  summary: { fontSize: 13, lineHeight: 19, marginTop: 2 },
});
