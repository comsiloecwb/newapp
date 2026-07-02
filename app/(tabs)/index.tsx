import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Calendar, ChevronRight, Copy, Heart, X } from 'lucide-react-native';
import { router } from 'expo-router';

import { generatePixPayload } from '@/lib/pix';
import { useLatestWeeklyMessage } from '@/features/weekly-message/hooks/use-weekly-message';
import { useUpcomingEvents } from '@/features/events/hooks/use-events';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useNotificationsSheetStore } from '@/stores/notifications-sheet-store';

const GOLD = '#C9A84C';
const DARK_BG = '#0A1628';
const SERIF = 'PlayfairDisplay_400Regular';
const SERIF_MED = 'PlayfairDisplay_500Medium';
const PIX_KEY = 'siloe@appigreja.com';   // ← chave PIX da igreja
const PIX_NAME = 'Igreja Siloe';          // ← nome da igreja (max 25 chars)
const PIX_CITY = 'Sao Paulo';             // ← cidade (max 15 chars)
const AMOUNTS = ['50', '100', '200', '500'];

const MOCK_EVENTS = [
  { id: 'm1', title: 'Culto de Domingo', start_at: new Date(Date.now() + 86400000).toISOString(), location: 'Templo Principal' },
  { id: 'm2', title: 'Reunião de Oração', start_at: new Date(Date.now() + 3 * 86400000).toISOString(), location: 'Sala 3' },
  { id: 'm3', title: 'Louvor & Adoração', start_at: new Date(Date.now() + 5 * 86400000).toISOString(), location: 'Templo Principal' },
];

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function HomeScreen() {
  const theme = useChurchTheme();
  const profile = useAuthStore((s) => s.profile);
  const church = useAuthStore((s) => s.church);
  const { data: message, isLoading: messageLoading } = useLatestWeeklyMessage();
  const { data: events, isLoading: eventsLoading } = useUpcomingEvents(3);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const openNotifications = useNotificationsSheetStore((s) => s.open);
  const insets = useSafeAreaInsets();
  const [pixOpen, setPixOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const amountRef = useRef<TextInput>(null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const firstName = useMemo(() => {
    const name = profile?.name ?? '';
    return name.split(' ')[0] || church?.name || 'Bem-vindo';
  }, [profile?.name, church?.name]);

  const displayEvents = events?.length ? events : MOCK_EVENTS;

  async function copyPix() {
    const amountFormatted = amount ? parseFloat(amount).toFixed(2) : undefined;
    const payload = generatePixPayload({
      key: PIX_KEY,
      name: PIX_NAME,
      city: PIX_CITY,
      amount: amountFormatted,
    });
    await Clipboard.setStringAsync(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Dark header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTop}>
            <Text style={styles.churchName}>
              {(church?.name ?? 'Igreja Siloé').toUpperCase()}
            </Text>
            <Pressable onPress={openNotifications} style={styles.bellWrap} hitSlop={8}>
              <Bell size={20} color="rgba(255,255,255,0.75)" strokeWidth={1.6} />
              {unreadCount > 0 && (
                <View style={[styles.bellBadge, { backgroundColor: theme.goldText }]}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <Text style={[styles.greeting, { fontFamily: SERIF }]}>
            {greeting}, {firstName} ✦
          </Text>

          {/* Palavra do Dia */}
          <View style={styles.palavraWrap}>
            <Text style={styles.palavraLabel}>📖  PALAVRA DO DIA</Text>
            {messageLoading ? (
              <ActivityIndicator color={GOLD} style={{ marginTop: 16 }} />
            ) : message ? (
              <>
                <Text style={[styles.verse, { fontFamily: SERIF }]}>{message.title}</Text>
                <View style={styles.goldLine} />
                <Text style={styles.reflection} numberOfLines={4}>{message.content}</Text>
              </>
            ) : (
              <Text style={[styles.verse, { fontFamily: SERIF }]}>
                "Porque eu sei os planos que tenho para vocês..."
              </Text>
            )}
          </View>
        </View>

        {/* Card Dízimo */}
        <View style={styles.section}>
          <Pressable style={styles.titheCard} onPress={() => setPixOpen(true)}>
            <View style={styles.titheLeft}>
              <Heart size={18} color={GOLD} fill={GOLD} strokeWidth={0} />
              <View>
                <Text style={[styles.titheTitle, { fontFamily: SERIF_MED }]}>Dízimo & Oferta</Text>
                <Text style={styles.titheSub}>Contribua com sua igreja via PIX</Text>
              </View>
            </View>
            <ChevronRight size={16} color={GOLD} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Próximos eventos */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: SERIF_MED }]}>
              Próximos Eventos
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/calendar')} hitSlop={8}>
              <Text style={[styles.seeAll, { color: theme.goldText }]}>Ver todos</Text>
            </Pressable>
          </View>

          {eventsLoading ? (
            <ActivityIndicator color={theme.goldText} style={{ marginTop: 12 }} />
          ) : (
            displayEvents.map((event) => (
              <Pressable
                key={event.id}
                style={[styles.eventCard, { backgroundColor: theme.surface }]}
                onPress={() => router.push(`/event/${event.id}` as never)}
              >
                <View style={[styles.eventDateBadge, { backgroundColor: DARK_BG }]}>
                  <Calendar size={14} color={GOLD} strokeWidth={1.6} />
                  <Text style={styles.eventDateText}>{formatEventDate(event.start_at)}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                  {event.location && (
                    <Text style={[styles.eventLocation, { color: theme.textMuted }]} numberOfLines={1}>
                      {event.location}
                    </Text>
                  )}
                </View>
                <ChevronRight size={16} color={theme.textMuted} strokeWidth={1.6} />
              </Pressable>
            ))
          )}
        </View>

      </ScrollView>

      {/* Modal PIX */}
      <Modal visible={pixOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPixOpen(false)}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: SERIF_MED }]}>
              Dízimo & Oferta
            </Text>
            <Pressable onPress={() => setPixOpen(false)} hitSlop={8}>
              <X size={22} color={theme.textMuted} strokeWidth={1.6} />
            </Pressable>
          </View>

          <Text style={[styles.modalSub, { color: theme.textMuted }]}>
            Escolha um valor ou transfira o que estiver no seu coração.
          </Text>

          {/* Sugestões de valor */}
          <View style={styles.amountGrid}>
            {AMOUNTS.map((val) => {
              const selected = amount === val;
              return (
                <Pressable
                  key={val}
                  style={[styles.amountChip, { borderColor: selected ? theme.goldText : theme.elevated, backgroundColor: selected ? GOLD + '18' : 'transparent' }]}
                  onPress={() => setAmount(val)}
                >
                  <Text style={[styles.amountText, { color: selected ? theme.goldText : theme.text }]}>R$ {val}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Valor personalizado */}
          <Pressable
            style={[styles.amountInputWrap, { backgroundColor: theme.surface, borderColor: amount && !AMOUNTS.includes(amount) ? theme.goldText : theme.elevated }]}
            onPress={() => amountRef.current?.focus()}
          >
            <Text style={[styles.amountPrefix, { color: theme.textMuted }]}>R$</Text>
            <TextInput
              ref={amountRef}
              style={[styles.amountInput, { color: theme.text }]}
              placeholder="Outro valor"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9.,]/g, ''))}
            />
          </Pressable>

          {/* Copiar payload */}
          <Pressable style={[styles.copyBtn, { backgroundColor: copied ? theme.goldText : DARK_BG }]} onPress={copyPix}>
            <Copy size={16} color="#fff" strokeWidth={2} />
            <Text style={styles.copyText}>
              {copied
                ? 'Copiado! Cole no seu banco ✓'
                : amount
                  ? `Copiar PIX · R$ ${parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : 'Copiar código PIX'}
            </Text>
          </Pressable>

          <Text style={[styles.pixNote, { color: theme.textMuted }]}>
            {amount
              ? 'O valor já estará incluído. Abra seu banco → PIX → Copia e Cola e cole o código.'
              : 'Selecione ou digite um valor antes de copiar para incluí-lo automaticamente.'}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  header: {
    backgroundColor: DARK_BG,
    paddingHorizontal: 22,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  churchName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
  },
  bellWrap: { padding: 4 },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  greeting: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '300',
    letterSpacing: 0.2,
    marginBottom: 22,
  },
  palavraWrap: { gap: 10 },
  palavraLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  verse: { color: '#FFFFFF', fontSize: 20, lineHeight: 30 },
  goldLine: { height: 1, width: 36, backgroundColor: GOLD },
  reflection: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 20 },

  section: { paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 18, letterSpacing: 0.2 },
  seeAll: { fontSize: 13, fontWeight: '600' },

  // Tithe card
  titheCard: {
    backgroundColor: DARK_BG,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titheLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titheTitle: { color: '#fff', fontSize: 15 },
  titheSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },

  // Event cards
  eventCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  eventDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  eventDateText: { color: GOLD, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  eventLocation: { fontSize: 12, marginTop: 2 },

  // Modal
  modal: { flex: 1, padding: 24, gap: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22 },
  modalSub: { fontSize: 14, lineHeight: 21, marginTop: -8 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amountChip: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  amountText: { fontSize: 14, fontWeight: '600' },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
    gap: 6,
  },
  amountPrefix: { fontSize: 16, fontWeight: '600' },
  amountInput: { flex: 1, fontSize: 16, paddingVertical: 12 },
  pixBox: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pixLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  pixKey: { fontSize: 15, fontWeight: '500' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  copyText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  pixNote: { fontSize: 13, lineHeight: 19 },
});
