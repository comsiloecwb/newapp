import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useCreateGrupo } from '@/features/grupos/hooks/use-grupos';

export default function NovoGrupoRoute() {
  const theme = useChurchTheme();
  const [nome, setNome] = useState('');
  const { mutate: createGrupo, isPending } = useCreateGrupo();

  function handleCreate() {
    if (!nome.trim()) return;
    createGrupo(nome.trim(), {
      onSuccess: (grupo) => router.replace(`/comunidade/grupos/${grupo.id}` as never),
      onError: (e) => Alert.alert('Erro', e.message),
    });
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Novo grupo' }} />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.flex} edges={['bottom']}>
          <View style={styles.content}>
            <Text style={[styles.label, { color: theme.textMuted }]}>NOME DO GRUPO</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.elevated }]}
              placeholder="Ex: Jovens, Família Silva, Amigos..."
              placeholderTextColor={theme.textMuted}
              value={nome}
              onChangeText={setNome}
              autoFocus
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <Pressable
              onPress={handleCreate}
              disabled={!nome.trim() || isPending}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: theme.accent, opacity: !nome.trim() || isPending || pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.btnText}>{isPending ? 'Criando...' : 'Criar grupo'}</Text>
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
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
