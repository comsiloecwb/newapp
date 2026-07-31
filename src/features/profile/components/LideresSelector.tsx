import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, Plus, Search, User as UserIcon, X } from 'lucide-react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import {
  useLideresDisponiveis,
  useMeusLideres,
  type LiderOption,
} from '@/features/profile/hooks/use-lideres';

const SERIF = 'PlayfairDisplay_500Medium';

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function LideresSelector() {
  const theme = useChurchTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { lideres, isLoading, addLider, removeLider, isSaving } = useMeusLideres();
  const { data: disponiveis, isLoading: loadingDisponiveis } = useLideresDisponiveis(search);

  const selectedIds = new Set(lideres.map((l) => l.id));

  function toggle(lider: LiderOption) {
    if (selectedIds.has(lider.id)) {
      removeLider(lider.id);
    } else {
      addLider(lider.id);
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Meu(s) Líder(es)</Text>
        <Pressable
          style={[styles.addBtn, { borderColor: theme.accent }]}
          onPress={() => setModalOpen(true)}
        >
          <Plus size={13} color={theme.accent} strokeWidth={2.5} />
          <Text style={[styles.addBtnText, { color: theme.accent }]}>Adicionar</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.accent} style={{ marginVertical: 8 }} />
      ) : lideres.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          Você ainda não informou nenhum líder.
        </Text>
      ) : (
        <View style={styles.chipsWrap}>
          {lideres.map((lider) => (
            <View key={lider.id} style={[styles.chip, { backgroundColor: theme.elevated }]}>
              <Text style={[styles.chipText, { color: theme.text }]}>{lider.nome}</Text>
              <Pressable onPress={() => removeLider(lider.id)} hitSlop={8} disabled={isSaving}>
                <X size={13} color={theme.textMuted} strokeWidth={2} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={modalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: SERIF }]}>
              Selecionar líderes
            </Text>
            <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
              <X size={22} color={theme.textMuted} strokeWidth={1.6} />
            </Pressable>
          </View>

          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.elevated }]}>
            <Search size={16} color={theme.textMuted} strokeWidth={1.8} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Buscar líder pelo nome..."
              placeholderTextColor={theme.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {loadingDisponiveis ? (
              <ActivityIndicator color={theme.accent} style={{ marginTop: 24 }} />
            ) : !disponiveis || disponiveis.length === 0 ? (
              <View style={styles.emptyState}>
                <UserIcon size={28} color={theme.textMuted} strokeWidth={1.4} />
                <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
                  Nenhum líder encontrado.
                </Text>
              </View>
            ) : (
              disponiveis.map((lider) => {
                const selected = selectedIds.has(lider.id);
                return (
                  <Pressable
                    key={lider.id}
                    style={[styles.liderRow, { borderColor: theme.elevated }]}
                    onPress={() => toggle(lider)}
                    disabled={isSaving}
                  >
                    <View style={styles.liderInfo}>
                      <View style={[styles.avatar, { backgroundColor: theme.elevated }]}>
                        <Text style={[styles.avatarText, { color: theme.text }]}>
                          {getInitials(lider.nome)}
                        </Text>
                      </View>
                      <View>
                        <Text style={[styles.liderNome, { color: theme.text }]}>{lider.nome}</Text>
                        <Text style={[styles.liderEmail, { color: theme.textMuted }]}>{lider.email}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selected ? theme.accent : theme.elevated,
                          backgroundColor: selected ? theme.accent : 'transparent',
                        },
                      ]}
                    >
                      {selected && <Check size={13} color={theme.background} strokeWidth={3} />}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <Pressable
            style={[styles.doneBtn, { backgroundColor: theme.text }]}
            onPress={() => setModalOpen(false)}
          >
            <Text style={[styles.doneBtnText, { color: theme.background }]}>Concluído</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 18, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 12, fontWeight: '600' },
  emptyText: { fontSize: 13, lineHeight: 19 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { fontSize: 13, fontWeight: '500' },

  modal: { flex: 1, padding: 24, gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  list: { flex: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40 },
  emptyStateText: { fontSize: 13 },
  liderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  liderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '600' },
  liderNome: { fontSize: 14, fontWeight: '500' },
  liderEmail: { fontSize: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  doneBtnText: { fontSize: 15, fontWeight: '600' },
});
