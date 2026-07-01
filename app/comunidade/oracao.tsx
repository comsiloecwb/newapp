import { useCallback, useState } from 'react';
import {
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
import { Stack } from 'expo-router';
import { Heart, Lock, Plus, Users, X } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const GOLD = '#C9A84C';
const DARK_BG = '#0A1628';
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

export default function OracaoScreen() {
  const theme = useChurchTheme();
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
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mural de Oração',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <View style={styles.topRow}>
            <Text style={[styles.sub, { color: theme.textMuted }]}>
              Compartilhe com a comunidade ou só com a liderança.
            </Text>
            <Pressable style={[styles.addBtn, { borderColor: GOLD }]} onPress={() => setModalOpen(true)}>
              <Plus size={13} color={GOLD} strokeWidth={2.5} />
              <Text style={[styles.addBtnText, { color: GOLD }]}>Pedir</Text>
            </Pressable>
          </View>

          {prayers.map((p) => (
            <PrayerCard key={p.id} prayer={p} onToggle={toggleLike} theme={theme} />
          ))}

        </ScrollView>
      </SafeAreaView>

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
              <Lock size={13} color={theme.textMuted} strokeWidth={1.6} style={{ marginTop: 2 }} />
              <Text style={[styles.infoText, { color: theme.textMuted }]}>
                Apenas pastores e líderes verão este pedido.
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
    </>
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
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sub: { flex: 1, fontSize: 13, lineHeight: 19 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { fontSize: 13, fontWeight: '600' },

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
  infoBox: { borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  submitBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 15, fontWeight: '600' },
});
