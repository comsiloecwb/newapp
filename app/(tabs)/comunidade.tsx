import { useState, useCallback } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Lock, Plus, Users, X } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const GOLD = '#C9A84C';
const DARK_BG = '#0A1628';
const SERIF = 'PlayfairDisplay_500Medium';
const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 52) / 3;

type Tab = 'oracao' | 'doacoes' | 'fotos';
type Visibility = 'community' | 'leaders';
type Prayer = {
  id: string;
  title: string;
  author: string | null;
  time: string;
  likes: number;
  liked: boolean;
  visibility: Visibility;
};

const MOCK_PRAYERS: Prayer[] = [
  { id: 'p1', title: 'Oração pela saúde da minha mãe', author: 'Ana Clara M.', time: 'há 2h', likes: 14, liked: false, visibility: 'community' },
  { id: 'p2', title: 'Sabedoria para uma decisão profissional importante', author: null, time: 'há 5h', likes: 7, liked: false, visibility: 'community' },
  { id: 'p3', title: 'Restauração do meu casamento', author: 'Pedro Lima', time: 'há 1 dia', likes: 23, liked: true, visibility: 'community' },
];

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

// Placeholders coloridos para fotos (substituir por imagens reais depois)
const PHOTO_COLORS = [
  '#2C3E50', '#8B4513', '#1A3A4A', '#3D2B1F',
  '#2E4057', '#4A2040', '#1B3A2D', '#3A2010',
  '#1E3A5F', '#3B1F2B', '#2A3D1F', '#1F2A3D',
];

const MOCK_PHOTOS = PHOTO_COLORS.map((color, i) => ({
  id: `ph${i}`,
  color,
  label: i === 0 ? 'Culto Dom.' : i === 1 ? 'Louvor' : i === 2 ? 'EBD' : '',
}));

const TABS: { key: Tab; label: string }[] = [
  { key: 'oracao', label: '🙏 Oração' },
  { key: 'doacoes', label: '❤️ Doações' },
  { key: 'fotos', label: '📷 Fotos' },
];

export default function ComunidadeScreen() {
  const theme = useChurchTheme();
  const [activeTab, setActiveTab] = useState<Tab>('oracao');
  const [prayers, setPrayers] = useState<Prayer[]>(MOCK_PRAYERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('community');
  const [anonymous, setAnonymous] = useState(false);

  const toggleLike = useCallback((id: string) => {
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  }, []);

  function submitPrayer() {
    if (!text.trim()) return;
    setPrayers((prev) => [{
      id: Date.now().toString(),
      title: text.trim(),
      author: anonymous ? null : 'Você',
      time: 'agora',
      likes: 0,
      liked: false,
      visibility,
    }, ...prev]);
    setText(''); setVisibility('community'); setAnonymous(false); setModalOpen(false);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>

      {/* Chips de navegação */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.chip, { borderColor: activeTab === t.key ? GOLD : theme.elevated, backgroundColor: activeTab === t.key ? GOLD + '18' : 'transparent' }]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.chipText, { color: activeTab === t.key ? GOLD : theme.textMuted }]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Conteúdo */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── ORAÇÃO ── */}
        {activeTab === 'oracao' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: SERIF }]}>Mural de Oração</Text>
              <Pressable style={[styles.addBtn, { borderColor: GOLD }]} onPress={() => setModalOpen(true)}>
                <Plus size={13} color={GOLD} strokeWidth={2.5} />
                <Text style={[styles.addBtnText, { color: GOLD }]}>Pedir</Text>
              </Pressable>
            </View>
            <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
              Compartilhe com a comunidade ou só com a liderança.
            </Text>
            {prayers.map((p) => (
              <PrayerCard key={p.id} prayer={p} onToggle={toggleLike} theme={theme} />
            ))}
          </>
        )}

        {/* ── DOAÇÕES ── */}
        {activeTab === 'doacoes' && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: SERIF }]}>Instituto Beneficente</Text>
            <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
              Veja o que a igreja está precisando e como você pode ajudar.
            </Text>
            {MOCK_DONATIONS.map((d) => (
              <View key={d.id} style={[styles.donationCard, { backgroundColor: theme.surface }]}>
                <View style={styles.donationTop}>
                  <View style={[styles.tag, { backgroundColor: GOLD + '20' }]}>
                    <Text style={[styles.tagText, { color: GOLD }]}>{d.tag}</Text>
                  </View>
                  <Text style={[styles.donationTitle, { color: theme.text, fontFamily: SERIF }]}>{d.title}</Text>
                </View>
                <Text style={[styles.donationDesc, { color: theme.textMuted }]}>{d.description}</Text>
                {d.total > 0 && (
                  <>
                    <View style={[styles.progressBg, { backgroundColor: theme.elevated }]}>
                      <View style={[styles.progressFill, { backgroundColor: GOLD, width: `${(d.collected / d.total) * 100}%` }]} />
                    </View>
                    <Text style={[styles.progressLabel, { color: theme.textMuted }]}>{d.collected} de {d.total} coletadas</Text>
                  </>
                )}
                <View style={[styles.howBox, { backgroundColor: DARK_BG }]}>
                  <Text style={styles.howText}>📍 {d.how}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── FOTOS ── */}
        {activeTab === 'fotos' && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: SERIF }]}>Fotos da Semana</Text>
            <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
              Momentos do culto e eventos desta semana.
            </Text>
            <View style={styles.photoGrid}>
              {MOCK_PHOTOS.map((p) => (
                <View key={p.id} style={[styles.photoCell, { backgroundColor: p.color }]}>
                  {p.label ? (
                    <Text style={styles.photoLabel}>{p.label}</Text>
                  ) : null}
                </View>
              ))}
            </View>
            <Text style={[styles.photoNote, { color: theme.textMuted }]}>
              As fotos serão carregadas pelo administrador pelo painel web.
            </Text>
          </>
        )}

      </ScrollView>

      {/* Modal pedido de oração */}
      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: SERIF }]}>Novo Pedido</Text>
            <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
              <X size={22} color={theme.textMuted} strokeWidth={1.6} />
            </Pressable>
          </View>

          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.elevated }]}
            placeholder="Descreva seu pedido de oração..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
          />

          <Text style={[styles.optionLabel, { color: theme.text }]}>Quem pode ver?</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionBtn, { borderColor: visibility === 'community' ? GOLD : theme.elevated, backgroundColor: visibility === 'community' ? GOLD + '15' : 'transparent' }]}
              onPress={() => setVisibility('community')}
            >
              <Users size={15} color={visibility === 'community' ? GOLD : theme.textMuted} strokeWidth={1.6} />
              <Text style={[styles.optionBtnText, { color: visibility === 'community' ? GOLD : theme.textMuted }]}>Comunidade</Text>
            </Pressable>
            <Pressable
              style={[styles.optionBtn, { borderColor: visibility === 'leaders' ? GOLD : theme.elevated, backgroundColor: visibility === 'leaders' ? GOLD + '15' : 'transparent' }]}
              onPress={() => setVisibility('leaders')}
            >
              <Lock size={15} color={visibility === 'leaders' ? GOLD : theme.textMuted} strokeWidth={1.6} />
              <Text style={[styles.optionBtnText, { color: visibility === 'leaders' ? GOLD : theme.textMuted }]}>Só liderança</Text>
            </Pressable>
          </View>

          <Pressable style={styles.anonRow} onPress={() => setAnonymous((v) => !v)}>
            <View style={[styles.checkbox, { borderColor: anonymous ? GOLD : theme.elevated, backgroundColor: anonymous ? GOLD : 'transparent' }]}>
              {anonymous && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.anonText, { color: theme.text }]}>Enviar como anônimo</Text>
          </Pressable>

          {visibility === 'leaders' && (
            <View style={[styles.infoBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.infoText, { color: theme.textMuted }]}>
                🔒 Apenas pastores e líderes verão este pedido.
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.submitBtn, { backgroundColor: text.trim() ? DARK_BG : theme.elevated }]}
            onPress={submitPrayer}
            disabled={!text.trim()}
          >
            <Text style={[styles.submitText, { color: text.trim() ? '#fff' : theme.textMuted }]}>Enviar Pedido</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PrayerCard({ prayer, onToggle, theme }: { prayer: Prayer; onToggle: (id: string) => void; theme: ReturnType<typeof useChurchTheme> }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{prayer.title}</Text>
        <View style={styles.cardMeta}>
          {prayer.visibility === 'leaders' && <Lock size={11} color={theme.textMuted} strokeWidth={1.6} style={{ marginRight: 4 }} />}
          <Text style={[styles.cardAuthor, { color: theme.textMuted }]}>{prayer.author ?? 'Anônimo'} · {prayer.time}</Text>
        </View>
      </View>
      <Pressable onPress={() => onToggle(prayer.id)} style={styles.likeBtn} hitSlop={8}>
        <Heart size={17} color={prayer.liked ? GOLD : theme.textMuted} fill={prayer.liked ? GOLD : 'transparent'} strokeWidth={1.6} />
        <Text style={[styles.likeCount, { color: prayer.liked ? GOLD : theme.textMuted }]}>{prayer.likes}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  tabsRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  chipText: { fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20, paddingTop: 12, paddingBottom: 40, gap: 12 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20 },
  sectionSub: { fontSize: 13, lineHeight: 19, marginTop: -4, marginBottom: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { fontSize: 13, fontWeight: '600' },

  // Prayer cards
  card: {
    borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardBody: { flex: 1, gap: 5 },
  cardTitle: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardAuthor: { fontSize: 12 },
  likeBtn: { alignItems: 'center', gap: 3 },
  likeCount: { fontSize: 11, fontWeight: '600' },

  // Donation cards
  donationCard: {
    borderRadius: 14, padding: 16, gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  donationTop: { gap: 6 },
  tag: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  donationTitle: { fontSize: 17 },
  donationDesc: { fontSize: 13, lineHeight: 20 },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 12, marginTop: -4 },
  howBox: { borderRadius: 10, padding: 12 },
  howText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19 },

  // Photo grid
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  photoCell: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  photoNote: { fontSize: 12, textAlign: 'center', marginTop: 4 },

  // Modal
  modal: { flex: 1, padding: 24, gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, minHeight: 120 },
  optionLabel: { fontSize: 14, fontWeight: '600', marginBottom: -4 },
  optionRow: { flexDirection: 'row', gap: 12 },
  optionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1.5, borderRadius: 10, paddingVertical: 12 },
  optionBtnText: { fontSize: 13, fontWeight: '600' },
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  anonText: { fontSize: 14 },
  infoBox: { borderRadius: 10, padding: 12 },
  infoText: { fontSize: 13, lineHeight: 19 },
  submitBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 15, fontWeight: '600' },
});
