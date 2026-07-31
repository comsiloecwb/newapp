import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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
import { Stack } from 'expo-router';
import { Lock, Plus, Trash2, Users, X } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useAuthStore } from '@/stores/auth-store';
import {
  usePedidosOracao,
  useSubmitPedido,
  useDeletePedido,
  type PedidoRow,
} from '@/features/oracao/hooks/use-pedidos-oracao';

const DARK_BG = '#0A1628';
const SERIF = 'PlayfairDisplay_500Medium';

type Visibility = 'community' | 'leaders';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

function PrayerCard({
  pedido,
  isOwn,
  onDelete,
  theme,
}: {
  pedido: PedidoRow;
  isOwn: boolean;
  onDelete: () => void;
  theme: ReturnType<typeof useChurchTheme>;
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{pedido.texto}</Text>
        <View style={styles.cardMeta}>
          {pedido.is_lideranca_only && (
            <Lock size={11} color={theme.textMuted} strokeWidth={1.6} style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.cardAuthor, { color: theme.textMuted }]}>
            {pedido.is_anonymous ? 'Anônimo' : (pedido.nome_autor ?? 'Membro')} · {timeAgo(pedido.created_at)}
          </Text>
        </View>
      </View>
      {isOwn && (
        <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
          <Trash2 size={16} color={theme.textMuted} strokeWidth={1.6} />
        </Pressable>
      )}
    </View>
  );
}

export default function OracaoScreen() {
  const theme = useChurchTheme();
  const userId = useAuthStore((s) => s.user?.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('community');

  const { data: pedidos, isLoading } = usePedidosOracao();
  const { mutate: submit, isPending: submitting } = useSubmitPedido();
  const { mutate: deletePedido } = useDeletePedido();

  function closeModal() {
    setModalOpen(false);
    setText('');
    setVisibility('community');
  }

  function submitPrayer() {
    if (!text.trim()) return;
    submit(
      {
        texto: text.trim(),
        is_lideranca_only: visibility === 'leaders',
      },
      {
        onSuccess: closeModal,
        onError: (e: any) => Alert.alert('Erro', e?.message ?? String(e)),
      }
    );
  }

  const handleDelete = useCallback(
    (pedido: PedidoRow) => {
      Alert.alert('Excluir pedido', 'Deseja remover este pedido de oração?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () =>
            deletePedido(pedido.id, {
              onError: (e: any) => Alert.alert('Erro', e?.message),
            }),
        },
      ]);
    },
    [deletePedido]
  );

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
            <Pressable style={[styles.addBtn, { borderColor: theme.goldText }]} onPress={() => setModalOpen(true)}>
              <Plus size={13} color={theme.goldText} strokeWidth={2.5} />
              <Text style={[styles.addBtnText, { color: theme.goldText }]}>Pedir</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
          ) : !pedidos?.length ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Nenhum pedido ainda.{'\n'}Seja o primeiro a compartilhar.
              </Text>
            </View>
          ) : (
            pedidos.map((p) => (
              <PrayerCard
                key={p.id}
                pedido={p}
                isOwn={p.user_id === userId}
                onDelete={() => handleDelete(p)}
                theme={theme}
              />
            ))
          )}

        </ScrollView>
      </SafeAreaView>

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: SERIF }]}>Novo Pedido</Text>
            <Pressable onPress={closeModal} hitSlop={8}>
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
              style={[styles.optionBtn, { borderColor: visibility === 'community' ? theme.goldText : theme.elevated, backgroundColor: visibility === 'community' ? theme.goldText + '15' : 'transparent' }]}
              onPress={() => setVisibility('community')}
            >
              <Users size={15} color={visibility === 'community' ? theme.goldText : theme.textMuted} strokeWidth={1.6} />
              <Text style={[styles.optionBtnText, { color: visibility === 'community' ? theme.goldText : theme.textMuted }]}>Comunidade</Text>
            </Pressable>
            <Pressable
              style={[styles.optionBtn, { borderColor: visibility === 'leaders' ? theme.goldText : theme.elevated, backgroundColor: visibility === 'leaders' ? theme.goldText + '15' : 'transparent' }]}
              onPress={() => setVisibility('leaders')}
            >
              <Lock size={15} color={visibility === 'leaders' ? theme.goldText : theme.textMuted} strokeWidth={1.6} />
              <Text style={[styles.optionBtnText, { color: visibility === 'leaders' ? theme.goldText : theme.textMuted }]}>Só liderança</Text>
            </Pressable>
          </View>

          {visibility === 'leaders' && (
            <View style={[styles.infoBox, { backgroundColor: theme.surface }]}>
              <Lock size={13} color={theme.textMuted} strokeWidth={1.6} style={{ marginTop: 2 }} />
              <Text style={[styles.infoText, { color: theme.textMuted }]}>
                Apenas pastores e líderes verão este pedido.
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.submitBtn, { backgroundColor: text.trim() && !submitting ? DARK_BG : theme.elevated }]}
            onPress={submitPrayer}
            disabled={!text.trim() || submitting}
          >
            <Text style={[styles.submitText, { color: text.trim() && !submitting ? '#fff' : theme.textMuted }]}>
              {submitting ? 'Enviando...' : 'Enviar Pedido'}
            </Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sub: { flex: 1, fontSize: 13, lineHeight: 19 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { fontSize: 13, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 21 },

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
  deleteBtn: { padding: 4 },

  modal: { flex: 1, padding: 24, gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, minHeight: 120 },
  optionLabel: { fontSize: 14, fontWeight: '600', marginBottom: -4 },
  optionRow: { flexDirection: 'row', gap: 12 },
  optionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1.5, borderRadius: 10, paddingVertical: 12 },
  optionBtnText: { fontSize: 13, fontWeight: '600' },
  infoBox: { borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  submitBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 15, fontWeight: '600' },
});
