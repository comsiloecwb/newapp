import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { usePalavra } from '@/features/palavras/hooks/use-palavras';

const DARK_BG = '#160A2E';
const GOLD = '#C9A84C';
const SERIF = 'PlayfairDisplay_500Medium';
const SERIF_REG = 'PlayfairDisplay_400Regular';

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function PalavraDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useChurchTheme();
  const { data: palavra, isLoading } = usePalavra(id);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: palavra?.versiculo ?? 'Palavra',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 15 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        {isLoading || !palavra ? (
          <ActivityIndicator color={GOLD} style={{ marginTop: 60 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            <View style={[styles.hero, { backgroundColor: DARK_BG }]}>
              {palavra.versiculo && (
                <Text style={[styles.reference, { color: GOLD }]}>{palavra.versiculo}</Text>
              )}
              <Text style={[styles.title, { fontFamily: SERIF }]}>{palavra.titulo}</Text>
              <View style={styles.metaRow}>
                {palavra.pregador && (
                  <View style={[styles.metaChip, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                    <Text style={styles.metaText}>{palavra.pregador}</Text>
                  </View>
                )}
                <View style={[styles.metaChip, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                  <Text style={styles.metaText}>{formatDate(palavra.data)}</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.content, { color: theme.text, fontFamily: SERIF_REG }]}>
              {palavra.texto}
            </Text>

          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 60 },

  hero: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 10,
  },
  reference: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: '#FFFFFF', fontSize: 26, lineHeight: 34 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  metaChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  metaText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '500' },

  content: { fontSize: 15, lineHeight: 26, padding: 20 },
});
