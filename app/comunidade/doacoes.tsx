import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const GOLD = '#C9A84C';
const DARK_BG = '#1C0F07';
const SERIF = 'PlayfairDisplay_500Medium';

const MOCK_DONATIONS = [
  {
    id: 'd1',
    title: 'Cestas Básicas',
    description: 'O instituto está coletando cestas básicas para 40 famílias em situação de vulnerabilidade neste mês.',
    needed: '40 cestas',
    collected: 18,
    total: 40,
    how: 'Entregue na secretaria de seg a sex, das 9h às 17h.',
    tag: 'Alimentos',
  },
  {
    id: 'd2',
    title: 'Roupas de Inverno',
    description: 'Campanha do agasalho — aceitamos roupas em bom estado para adultos e crianças.',
    needed: 'Roupas em bom estado',
    collected: 0,
    total: 0,
    how: 'Deixe na caixa de coleta na entrada do templo.',
    tag: 'Vestuário',
  },
  {
    id: 'd3',
    title: 'Creche Comunidade',
    description: 'A creche beneficente precisa de fraldas tamanho M e G para as crianças atendidas.',
    needed: 'Fraldas M e G',
    collected: 0,
    total: 0,
    how: 'Entregue diretamente na creche (Rua das Flores, 120).',
    tag: 'Crianças',
  },
];

export default function DoacoesScreen() {
  const theme = useChurchTheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Ação Social',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <Text style={[styles.sub, { color: theme.textMuted }]}>
            Veja o que a igreja está precisando e como você pode ajudar.
          </Text>

          {MOCK_DONATIONS.map((d) => (
            <View key={d.id} style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.cardTop}>
                <View style={[styles.tag, { backgroundColor: GOLD + '20' }]}>
                  <Text style={[styles.tagText, { color: theme.goldText }]}>{d.tag}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text, fontFamily: SERIF }]}>{d.title}</Text>
              </View>

              <Text style={[styles.cardDesc, { color: theme.textMuted }]}>{d.description}</Text>

              {d.total > 0 && (
                <>
                  <View style={[styles.progressBg, { backgroundColor: theme.elevated }]}>
                    <View style={[styles.progressFill, { backgroundColor: theme.goldText, width: `${(d.collected / d.total) * 100}%` }]} />
                  </View>
                  <Text style={[styles.progressLabel, { color: theme.textMuted }]}>{d.collected} de {d.total} coletadas</Text>
                </>
              )}

              <View style={[styles.howBox, { backgroundColor: DARK_BG }]}>
                <MapPin size={12} color="rgba(255,255,255,0.6)" strokeWidth={1.6} style={{ marginTop: 2 }} />
                <Text style={styles.howText}>{d.how}</Text>
              </View>
            </View>
          ))}

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },

  sub: { fontSize: 13, lineHeight: 19, marginBottom: 4 },

  card: {
    borderRadius: 14, padding: 16, gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardTop: { gap: 6 },
  tag: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle: { fontSize: 17 },
  cardDesc: { fontSize: 13, lineHeight: 20 },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 12, marginTop: -4 },
  howBox: { borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  howText: { flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19 },
});
