import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export default function RegisterScreen() {
  const theme = useChurchTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!isSupabaseConfigured) {
      Alert.alert('Supabase', 'Configure EXPO_PUBLIC_SUPABASE_URL e ANON_KEY no .env');
      return;
    }
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso', 'Verifique seu e-mail para confirmar o cadastro.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.title, { color: theme.primary }]}>Criar conta</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Cadastre-se para acessar sua igreja
      </Text>

      <TextInput
        style={[styles.input, { borderColor: theme.textMuted, color: theme.text }]}
        placeholder="Nome completo"
        placeholderTextColor={theme.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.textMuted, color: theme.text }]}
        placeholder="E-mail"
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.textMuted, color: theme.text }]}
        placeholder="Senha"
        placeholderTextColor={theme.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Cadastrando…' : 'Criar conta'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={styles.link}>
        <Text style={{ color: theme.secondary }}>Já tenho conta — Entrar</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: { borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 24, alignItems: 'center' },
});