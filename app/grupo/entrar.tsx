import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useJoinGroup } from '@/features/devotional/hooks/use-groups';

const DARK_BG = '#0A1628';
const SERIF = 'PlayfairDisplay_500Medium';

export default function EntrarGrupoScreen() {
  const theme = useChurchTheme();
  const [code, setCode] = useState('');
  const { mutate: joinGroup, isPending } = useJoinGroup();

  function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) { Alert.alert('Digite o código completo (6 caracteres)'); return; }
    joinGroup(trimmed, {
      onSuccess: (group) => router.replace(`/devocional/grupo/${group.id}` as never),
      onError: (err) => Alert.alert('Erro', err.message),
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Entrar com código',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>
            Código do grupo
          </Text>
          <Text style={[styles.sub, { color: theme.textMuted }]}>
            Peça o código de 6 caracteres para quem criou o grupo.
          </Text>

          <TextInput
            style={[styles.codeInput, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder="ABC123"
            placeholderTextColor={theme.textMuted}
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            autoCapitalize="characters"
            maxLength={6}
            autoFocus
          />

          <Pressable
            style={[styles.btn, { backgroundColor: theme.text }, isPending && styles.disabled]}
            onPress={handleJoin}
            disabled={isPending}
          >
            <Text style={[styles.btnText, { color: theme.background }]}>
              {isPending ? 'Procurando...' : 'Entrar no grupo'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 28, justifyContent: 'center', gap: 14 },
  title: { fontSize: 26 },
  sub: { fontSize: 14, lineHeight: 22 },
  codeInput: {
    borderRadius: 14,
    padding: 18,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    marginVertical: 12,
  },
  btn: { borderRadius: 14, padding: 17, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
