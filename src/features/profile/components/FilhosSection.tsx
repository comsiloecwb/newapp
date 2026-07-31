import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Pencil, Plus, Trash2 } from 'lucide-react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { calcularIdade, MAX_FILHOS, useFilhos } from '@/features/profile/hooks/use-filhos';
import { ModalAdicionarFilho } from '@/features/profile/components/ModalAdicionarFilho';
import type { Filho } from '@/types/database';

export function FilhosSection() {
  const theme = useChurchTheme();
  const { filhos, isLoading, addFilho, updateFilho, deleteFilho, isSaving } = useFilhos();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFilho, setEditingFilho] = useState<Filho | null>(null);

  const atingiuLimite = filhos.length >= MAX_FILHOS;

  function openAdd() {
    setEditingFilho(null);
    setModalOpen(true);
  }

  function openEdit(filho: Filho) {
    setEditingFilho(filho);
    setModalOpen(true);
  }

  function handleSave(nome: string, dataNascimento: string) {
    if (editingFilho) {
      updateFilho({ id: editingFilho.id, nome, dataNascimento });
    } else {
      addFilho({ nome, dataNascimento });
    }
    setModalOpen(false);
  }

  function confirmDelete(filho: Filho) {
    Alert.alert('Remover filho', `Remover ${filho.nome} da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteFilho(filho.id) },
    ]);
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Meus filhos</Text>
        {!atingiuLimite && (
          <Pressable style={[styles.addBtn, { borderColor: theme.accent }]} onPress={openAdd}>
            <Plus size={13} color={theme.accent} strokeWidth={2.5} />
            <Text style={[styles.addBtnText, { color: theme.accent }]}>Adicionar</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.accent} style={{ marginVertical: 8 }} />
      ) : filhos.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>Nenhum filho cadastrado.</Text>
      ) : (
        <View style={styles.list}>
          {filhos.map((filho) => {
            const idade = calcularIdade(filho.data_nascimento);
            return (
              <Swipeable
                key={filho.id}
                renderRightActions={() => (
                  <Pressable style={styles.deleteAction} onPress={() => confirmDelete(filho)}>
                    <Trash2 size={18} color="#fff" strokeWidth={1.8} />
                  </Pressable>
                )}
              >
                <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.elevated }]}>
                  <View>
                    <Text style={[styles.filhoNome, { color: theme.text }]}>{filho.nome}</Text>
                    <Text style={[styles.filhoIdade, { color: theme.textMuted }]}>
                      {idade} {idade === 1 ? 'ano' : 'anos'}
                    </Text>
                  </View>
                  <Pressable onPress={() => openEdit(filho)} hitSlop={8}>
                    <Pencil size={16} color={theme.textMuted} strokeWidth={1.8} />
                  </Pressable>
                </View>
              </Swipeable>
            );
          })}
        </View>
      )}

      {atingiuLimite && (
        <Text style={[styles.limitText, { color: theme.textMuted }]}>
          Limite máximo de {MAX_FILHOS} filhos atingido.
        </Text>
      )}

      <ModalAdicionarFilho
        visible={modalOpen}
        filho={editingFilho}
        isSaving={isSaving}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
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
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  filhoNome: { fontSize: 14, fontWeight: '500' },
  filhoIdade: { fontSize: 12, marginTop: 2 },
  deleteAction: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    borderRadius: 12,
    marginLeft: 8,
  },
  limitText: { fontSize: 12, textAlign: 'center' },
});
