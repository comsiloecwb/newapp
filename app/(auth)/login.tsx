import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { MOCK_CHURCH, MOCK_PROFILE } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export default function LoginScreen() {
  const theme = useChurchTheme();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!isSupabaseConfigured) {
      Alert.alert('Supabase', 'Configure EXPO_PUBLIC_SUPABASE_URL e ANON_KEY no .env');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Erro', error.message);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.primary }]}>App Igreja</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Entre com sua conta da igreja
        </Text>
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
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Entrando…' : 'Entrar'}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/register' as any)} style={styles.link}>
          <Text style={{ color: theme.secondary }}>Criar conta</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setSession(MOCK_PROFILE, MOCK_CHURCH);
            router.replace('/(tabs)');
          }}
          style={styles.devLink}
        >
          <Text style={{ color: theme.textMuted, fontSize: 13 }}>Modo preview (sem Supabase)</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
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
  link: { marginTop: 16, alignItems: 'center' },
  devLink: { marginTop: 24, alignItems: 'center', padding: 12 },
});