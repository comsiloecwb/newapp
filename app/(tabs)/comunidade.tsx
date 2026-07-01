import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const SERIF = 'PlayfairDisplay_500Medium';
const SERIF_REG = 'PlayfairDisplay_400Regular';

const SECTIONS = [
  {
    key: 'palavras',
    title: 'Palavras',
    subtitle: 'Biblioteca de sermões e mensagens da igreja',
    bg: '#160A2E',
    route: '/comunidade/palavras',
  },
  {
    key: 'oracao',
    title: 'Mural de Oração',
    subtitle: 'Compartilhe pedidos com a comunidade e liderança',
    bg: '#0A1628',
    route: '/comunidade/oracao',
  },
  {
    key: 'doacoes',
    title: 'Ação Social',
    subtitle: 'Instituto beneficente da igreja',
    bg: '#1C0F07',
    route: '/comunidade/doacoes',
  },
  {
    key: 'fotos',
    title: 'Fotos da Semana',
    subtitle: 'Momentos do culto e eventos',
    bg: '#071A10',
    route: '/comunidade/fotos',
  },
] as const;

export default function ComunidadeScreen() {
  const theme = useChurchTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={[styles.heading, { color: theme.text, fontFamily: SERIF }]}>Comunidade</Text>
        <Text style={[styles.sub, { color: theme.textMuted, fontFamily: SERIF_REG }]}>
          Conecte-se, ore e sirva junto com a igreja.
        </Text>

        {SECTIONS.map((s) => (
          <Pressable
            key={s.key}
            style={({ pressed }) => [styles.card, { backgroundColor: s.bg, opacity: pressed ? 0.88 : 1 }]}
            onPress={() => router.push(s.route as never)}
          >
            <Text style={[styles.cardTitle, { fontFamily: SERIF }]}>{s.title}</Text>
            <Text style={styles.cardSub}>{s.subtitle}</Text>
          </Pressable>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },

  heading: { fontSize: 26, marginBottom: 2 },
  sub: { fontSize: 14, lineHeight: 20, marginBottom: 4 },

  card: {
    borderRadius: 18,
    height: 150,
    padding: 24,
    justifyContent: 'flex-end',
  },
  cardTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 28 },
  cardSub: { color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 18, marginTop: 4 },
});
