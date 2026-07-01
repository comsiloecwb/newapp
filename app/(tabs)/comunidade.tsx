import { useState, useCallback } from 'react';
import {
  Alert,
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
const SERIF = 'PlayfairDisplay_500Medium';

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

export default function ComunidadeScreen() {
  const theme = useChurchTheme();
  const [prayers, setPrayers] = useState<Prayer[]>(MOCK_PRAYERS);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
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
    const newPrayer: Prayer = {
      id: Date.now().toString(),
      title: text.trim(),
      author: anonymous ? null : 'Você',
      time: 'agora',
      likes: 0,
      liked: false,
      visibility,
    };
    setPrayers((prev) => [newPrayer, ...prev]);
    setText('');
    setVisibility('community');
    setAnonymous(false);
    setModalOpen(false);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>Mural de Oração</Text>
          <Pressable style={[styles.addBtn, { borderColor: GOLD }]} onPress={() => setModalOpen(true)}>
            <Plus size={14} color={GOLD} strokeWidth={2} />
            <Text style={[styles.addBtnText, { color: GOLD }]}>Pedir Oração</Text>
          </Pressable>
        </View>

        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Compartilhe pedidos com a comunidade ou só com a liderança.
        </Text>

        {/* Cards */}
        {prayers.map((prayer) => (
          <PrayerCard key={prayer.id} prayer={prayer} onToggle={toggleLike} theme={theme} />
        ))}

      </ScrollView>

      {/* Modal novo pedido */}
      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: SERIF }]}>Novo Pedido de Oração</Text>
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

          {/* Visibilidade */}
          <Text style={[styles.optionLabel, { color: theme.text }]}>Quem pode ver?</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionBtn, visibility === 'community' && { borderColor: GOLD, backgroundColor: GOLD + '15' }, { borderColor: theme.elevated }]}
              onPress={() => setVisibility('community')}
            >
              <Users size={16} color={visibility === 'community' ? GOLD : theme.textMuted} strokeWidth={1.6} />
              <Text style={[styles.optionBtnText, { color: visibility === 'community' ? GOLD : theme.textMuted }]}>
                Comunidade
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionBtn, visibility === 'leaders' && { borderColor: GOLD, backgroundColor: GOLD + '15' }, { borderColor: theme.elevated }]}
              onPress={() => setVisibility('leaders')}
            >
              <Lock size={16} color={visibility === 'leaders' ? GOLD : theme.textMuted} strokeWidth={1.6} />
              <Text style={[styles.optionBtnText, { color: visibility === 'leaders' ? GOLD : theme.textMuted }]}>
                Só liderança
              </Text>
            </Pressable>
          </View>

          {/* Anonimato */}
          <Pressable style={styles.anonRow} onPress={() => setAnonymous((v) => !v)}>
            <View style={[styles.checkbox, { borderColor: anonymous ? GOLD : theme.elevated, backgroundColor: anonymous ? GOLD : 'transparent' }]}>
              {anonymous && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.anonText, { color: theme.text }]}>Enviar como anônimo</Text>
          </Pressable>

          {visibility === 'leaders' && (
            <View style={[styles.infoBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.infoText, { color: theme.textMuted }]}>
                🔒 Apenas pastores e líderes verão este pedido. Não aparecerá no mural público.
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.submitBtn, { backgroundColor: text.trim() ? '#0A1628' : theme.elevated }]}
            onPress={submitPrayer}
            disabled={!text.trim()}
          >
            <Text style={[styles.submitText, { color: text.trim() ? '#fff' : theme.textMuted }]}>
              Enviar Pedido
            </Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PrayerCard({
  prayer,
  onToggle,
  theme,
}: {
  prayer: Prayer;
  onToggle: (id: string) => void;
  theme: ReturnType<typeof useChurchTheme>;
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{prayer.title}</Text>
        <View style={styles.cardMeta}>
          {prayer.visibility === 'leaders' && (
            <Lock size={11} color={theme.textMuted} strokeWidth={1.6} style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.cardAuthor, { color: theme.textMuted }]}>
            {prayer.author ?? 'Anônimo'} · {prayer.time}
          </Text>
        </View>
      </View>
      <Pressable onPress={() => onToggle(prayer.id)} style={styles.likeBtn} hitSlop={8}>
        <Heart
          size={17}
          color={prayer.liked ? GOLD : theme.textMuted}
          fill={prayer.liked ? GOLD : 'transparent'}
          strokeWidth={1.6}
        />
        <Text style={[styles.likeCount, { color: prayer.liked ? GOLD : theme.textMuted }]}>
          {prayer.likes}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 13, fontWeight: '600' },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: -4, marginBottom: 4 },

  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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

  // Modal
  modal: { flex: 1, padding: 24, gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20 },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 120,
  },
  optionLabel: { fontSize: 14, fontWeight: '600', marginBottom: -4 },
  optionRow: { flexDirection: 'row', gap: 12 },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
  },
  optionBtnText: { fontSize: 13, fontWeight: '600' },
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  anonText: { fontSize: 14 },
  infoBox: { borderRadius: 10, padding: 12 },
  infoText: { fontSize: 13, lineHeight: 19 },
  submitBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: { fontSize: 15, fontWeight: '600' },
});
