import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Copy, Share2 } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useCreateGroup } from '@/features/devotional/hooks/use-groups';
import type { StudyGroup } from '@/types/database';

const DARK_BG = '#0A1628';
const SERIF = 'PlayfairDisplay_500Medium';

export default function CriarGrupoScreen() {
  const theme = useChurchTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [created, setCreated] = useState<StudyGroup | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: createGroup, isPending } = useCreateGroup();

  function handleCreate() {
    if (!name.trim()) { Alert.alert('Informe o nome do grupo'); return; }
    createGroup(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: (group) => setCreated(group),
        onError: (err) => Alert.alert('Erro', err.message),
      },
    );
  }

  async function handleCopy() {
    if (!created) return;
    await Clipboard.setStringAsync(inviteLink(created.invite_code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!created) return;
    await Share.share({
      message: `Entre no nosso grupo de devocional "${created.name}"!\n\nLink: ${inviteLink(created.invite_code)}\nCódigo: ${created.invite_code}`,
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Criar Grupo',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!created ? (
          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.text }]}>Nome do grupo</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Ex: Grupo da Família, Célula 5..."
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={60}
            />

            <Text style={[styles.label, { color: theme.text }]}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Do que trata esse grupo?"
              placeholderTextColor={theme.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />

            <Pressable
              style={[styles.btn, { backgroundColor: theme.text }, isPending && styles.disabled]}
              onPress={handleCreate}
              disabled={isPending}
            >
              <Text style={[styles.btnText, { color: theme.background }]}>
                {isPending ? 'Criando...' : 'Criar grupo'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.success}>
            <Text style={[styles.successTitle, { color: theme.text, fontFamily: SERIF }]}>
              Grupo criado! 🎉
            </Text>
            <Text style={[styles.successSub, { color: theme.textMuted }]}>
              Compartilhe o código ou o link com quem quer convidar.
            </Text>

            <View style={[styles.codeCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.codeLabel, { color: theme.textMuted }]}>CÓDIGO DO GRUPO</Text>
              <Text style={[styles.code, { color: theme.text, fontFamily: SERIF }]}>
                {created.invite_code}
              </Text>
            </View>

            <Pressable
              style={[styles.btn, { backgroundColor: theme.text }]}
              onPress={handleShare}
            >
              <Share2 size={16} color={theme.background} strokeWidth={2} />
              <Text style={[styles.btnText, { color: theme.background }]}>Compartilhar convite</Text>
            </Pressable>

            <Pressable
              style={[styles.outlineBtn, { borderColor: theme.elevated }]}
              onPress={handleCopy}
            >
              <Copy size={15} color={theme.text} strokeWidth={1.8} />
              <Text style={[styles.outlineBtnText, { color: theme.text }]}>
                {copied ? 'Link copiado!' : 'Copiar link'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.goBtn}
              onPress={() => router.replace(`/devocional/grupo/${created.id}` as never)}
            >
              <Text style={[styles.goBtnText, { color: theme.goldText }]}>
                Ir para o grupo →
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

function inviteLink(code: string) {
  return `appigreja://grupo/${code}`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  form: { padding: 24, gap: 8 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  input: { borderRadius: 12, padding: 15, fontSize: 15, marginBottom: 4 },
  inputMulti: { minHeight: 90, paddingTop: 14 },
  btn: { borderRadius: 14, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  btnText: { fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },

  success: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 16 },
  successTitle: { fontSize: 28, textAlign: 'center' },
  successSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  codeCard: { width: '100%', borderRadius: 16, padding: 24, alignItems: 'center', gap: 8, marginVertical: 8 },
  codeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  code: { fontSize: 40, letterSpacing: 8 },
  outlineBtn: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  outlineBtnText: { fontSize: 14, fontWeight: '500' },
  goBtn: { marginTop: 8 },
  goBtnText: { fontSize: 15, fontWeight: '600' },
});
