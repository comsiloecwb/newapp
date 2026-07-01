import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ChevronRight, Gift, Hand } from 'lucide-react-native';
import { router } from 'expo-router';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const GOLD = '#C9A84C';
const SERIF = 'PlayfairDisplay_500Medium';
const { width } = Dimensions.get('window');
const HALF = (width - 20 * 2 - 10) / 2;

const SECTIONS = [
  {
    key: 'oracao',
    title: 'Mural de Oração',
    subtitle: 'Compartilhe pedidos com a comunidade e liderança',
    icon: Hand,
    bg: '#0A1628',
    accent: GOLD,
    route: '/comunidade/oracao',
    featured: true,
  },
  {
    key: 'doacoes',
    title: 'Ação Social',
    subtitle: 'Instituto beneficente da igreja',
    icon: Gift,
    bg: '#1C0F07',
    accent: '#D4845A',
    route: '/comunidade/doacoes',
    featured: false,
  },
  {
    key: 'fotos',
    title: 'Fotos da Semana',
    subtitle: 'Momentos do culto e eventos',
    icon: Camera,
    bg: '#071A10',
    accent: '#5B9E6E',
    route: '/comunidade/fotos',
    featured: false,
  },
] as const;

export default function ComunidadeScreen() {
  const theme = useChurchTheme();

  const featured = SECTIONS[0];
  const rest = SECTIONS.slice(1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={[styles.heading, { color: theme.text, fontFamily: SERIF }]}>Comunidade</Text>
        <Text style={[styles.sub, { color: theme.textMuted }]}>
          Conecte-se, ore e sirva junto com a igreja.
        </Text>

        {/* Card em destaque — full width */}
        <SectionCard section={featured} style={styles.featuredCard} />

        {/* Grid 2 colunas */}
        <View style={styles.row}>
          {rest.map((s) => (
            <SectionCard key={s.key} section={s} style={[styles.halfCard, { width: HALF }]} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

type Section = typeof SECTIONS[number];

function SectionCard({ section: s, style }: { section: Section; style?: object | object[] }) {
  const Icon = s.icon;
  return (
    <Pressable
      style={({ pressed }) => [styles.card, style, { backgroundColor: s.bg, opacity: pressed ? 0.88 : 1 }]}
      onPress={() => router.push(s.route as never)}
    >
      {/* Ícone decorativo de fundo */}
      <Icon
        size={100}
        color={s.accent}
        strokeWidth={0.6}
        style={styles.bgIcon}
      />

      <View style={styles.cardInner}>
        {/* Badge de ícone */}
        <View style={[styles.iconBadge, { backgroundColor: s.accent + '22' }]}>
          <Icon size={18} color={s.accent} strokeWidth={1.8} />
        </View>

        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { fontFamily: 'PlayfairDisplay_500Medium' }]}>{s.title}</Text>
          <Text style={styles.cardSub} numberOfLines={2}>{s.subtitle}</Text>
        </View>

        <ChevronRight size={16} color="rgba(255,255,255,0.35)" strokeWidth={1.8} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 10 },

  heading: { fontSize: 26, marginBottom: 2 },
  sub: { fontSize: 14, lineHeight: 20, marginBottom: 6 },

  card: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredCard: {
    height: 150,
  },
  halfCard: {
    height: 160,
  },
  bgIcon: {
    position: 'absolute',
    right: -18,
    bottom: -18,
    opacity: 0.10,
  },
  cardInner: {
    flex: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { color: '#FFFFFF', fontSize: 15, lineHeight: 20 },
  cardSub: { color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 17 },

  row: { flexDirection: 'row', gap: 10 },
});
