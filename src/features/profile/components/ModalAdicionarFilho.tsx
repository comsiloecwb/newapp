import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { X } from 'lucide-react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import type { Filho } from '@/types/database';

const SERIF = 'PlayfairDisplay_500Medium';

interface Props {
  visible: boolean;
  filho: Filho | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (nome: string, dataNascimentoIso: string) => void;
}

function toDateOnlyIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function ModalAdicionarFilho({ visible, filho, isSaving, onClose, onSave }: Props) {
  const theme = useChurchTheme();
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setNome(filho?.nome ?? '');
      setDataNascimento(filho ? new Date(`${filho.data_nascimento}T00:00:00`) : null);
      setShowPicker(false);
    }
  }, [visible, filho]);

  function handleDateChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selected) setDataNascimento(selected);
    } else if (selected) {
      setDataNascimento(selected);
    }
  }

  function handleSave() {
    if (!nome.trim() || !dataNascimento) return;
    onSave(nome.trim(), toDateOnlyIso(dataNascimento));
  }

  const canSave = Boolean(nome.trim() && dataNascimento) && !isSaving;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modal, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>
            {filho ? 'Editar filho' : 'Adicionar filho'}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={22} color={theme.textMuted} strokeWidth={1.6} />
          </Pressable>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Nome completo</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.surface, color: theme.text, borderColor: theme.elevated },
          ]}
          placeholder="Nome do filho"
          placeholderTextColor={theme.textMuted}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={[styles.label, { color: theme.text }]}>Data de nascimento</Text>
        <Pressable
          style={[
            styles.input,
            styles.dateInput,
            { backgroundColor: theme.surface, borderColor: theme.elevated },
          ]}
          onPress={() => setShowPicker(true)}
        >
          <Text style={{ color: dataNascimento ? theme.text : theme.textMuted, fontSize: 15 }}>
            {dataNascimento ? dataNascimento.toLocaleDateString('pt-BR') : 'Selecionar data'}
          </Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={dataNascimento ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {showPicker && Platform.OS === 'ios' && (
          <Pressable
            style={[styles.doneBtn, { backgroundColor: theme.elevated }]}
            onPress={() => setShowPicker(false)}
          >
            <Text style={[styles.doneBtnText, { color: theme.text }]}>Concluído</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.saveBtn, { backgroundColor: theme.text }, !canSave && styles.disabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={[styles.saveBtnText, { color: theme.background }]}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, padding: 24, gap: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: -6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  dateInput: { justifyContent: 'center' },
  doneBtn: { borderRadius: 10, padding: 10, alignItems: 'center' },
  doneBtnText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
