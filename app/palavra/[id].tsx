import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { MOCK_PALAVRAS } from '../comunidade/palavras';

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
  const palavra = MOCK_PALAVRAS.find((p) => p.id === id);

  if (!palavra) return null;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: palavra.reference,
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 15 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Cabeçalho da palavra */}
          <View style={[styles.hero, { backgroundColor: DARK_BG }]}>
            <Text style={[styles.reference, { color: GOLD }]}>{palavra.reference}</Text>
            <Text style={[styles.title, { fontFamily: SERIF }]}>{palavra.title}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.metaChip, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                <Text style={styles.metaText}>{palavra.preacher}</Text>
              </View>
              <View style={[styles.metaChip, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                <Text style={styles.metaText}>{formatDate(palavra.date)}</Text>
              </View>
            </View>
          </View>

          {/* Resumo */}
          <View style={[styles.summaryBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.summaryLabel, { color: theme.goldText }]}>RESUMO</Text>
            <Text style={[styles.summaryText, { color: theme.text, fontFamily: SERIF_REG }]}>
              {palavra.summary}
            </Text>
          </View>

          {/* Conteúdo completo */}
          <Text style={[styles.content, { color: theme.text }]}>
            {palavra.content}
          </Text>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 60, gap: 0 },

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

  summaryBox: {
    margin: 20,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  summaryLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  summaryText: { fontSize: 15, lineHeight: 23 },

  content: { fontSize: 15, lineHeight: 26, paddingHorizontal: 20, paddingBottom: 20 },
});
