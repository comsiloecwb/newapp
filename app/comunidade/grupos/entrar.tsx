import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useJoinGrupo } from '@/features/grupos/hooks/use-grupos';

export default function EntrarGrupoRoute() {
  const theme = useChurchTheme();
  const [code, setCode] = useState('');
  const { mutate: joinGrupo, isPending } = useJoinGrupo();

  function handleJoin() {
    if (code.length < 6) return;
    joinGrupo(code.trim(), {
      onSuccess: (grupo) => router.replace(`/comunidade/grupos/${grupo.id}` as never),
      onError: () => Alert.alert('Código inválido', 'Verifique o código e tente novamente.'),
    });
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Entrar em grupo' }} />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.flex} edges={['bottom']}>
          <View style={styles.content}>
            <Text style={[styles.label, { color: theme.textMuted }]}>CÓDIGO DE CONVITE</Text>
            <TextInput
              style={[styles.codeInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.elevated }]}
              placeholder="ABC123"
              placeholderTextColor={theme.textMuted}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              autoFocus
              autoCapitalize="characters"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleJoin}
            />
            <Text style={[styles.hint, { color: theme.textMuted }]}>
              Peça o código de 6 caracteres para quem criou o grupo
            </Text>
            <Pressable
              onPress={handleJoin}
              disabled={code.length < 6 || isPending}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: theme.accent, opacity: code.length < 6 || isPending || pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.btnText}>{isPending ? 'Entrando...' : 'Entrar no grupo'}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, gap: 12 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  codeInput: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 28, fontWeight: '700', letterSpacing: 10, textAlign: 'center',
  },
  hint: { fontSize: 13, textAlign: 'center' },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
