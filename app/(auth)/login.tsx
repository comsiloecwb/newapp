import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { MOCK_CHURCH, MOCK_PROFILE } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';

const SERIF_MEDIUM = 'PlayfairDisplay_500Medium';
const BG = '#FDFCF8';
const SURFACE = '#F5F0E8';
const TEXT = '#1C1917';
const MUTED = '#9C8C7A';
const ACCENT = '#C9954A';

export default function LoginScreen() {
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(MOCK_PROFILE, MOCK_CHURCH);
      router.replace('/(tabs)');
    }
  }, [setSession]);

  async function handleLogin() {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Erro', error.message);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: BG }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo mark */}
        <View style={styles.logoArea}>
          <Text style={[styles.star, { color: TEXT }]}>✦</Text>
          <Text style={[styles.appName, { color: TEXT, fontFamily: SERIF_MEDIUM }]}>App Igreja</Text>
          <Text style={[styles.tagline, { color: MUTED }]}>Entre com sua conta da igreja</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { borderColor: SURFACE, color: TEXT, backgroundColor: SURFACE }]}
            placeholder="E-mail"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { borderColor: SURFACE, color: TEXT, backgroundColor: SURFACE, marginBottom: 24 }]}
            placeholder="Senha"
            placeholderTextColor={MUTED}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[styles.button, { backgroundColor: TEXT }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: BG }]}>{loading ? 'Entrando…' : 'Entrar'}</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/register' as never)} style={styles.link}>
            <Text style={[styles.linkText, { color: MUTED }]}>Criar conta</Text>
          </Pressable>
        </View>

        {/* Dev shortcut */}
        <Pressable
          onPress={() => {
            setSession(MOCK_PROFILE, MOCK_CHURCH);
            router.replace('/(tabs)');
          }}
          style={styles.devLink}
        >
          <Text style={[styles.devText, { color: ACCENT }]}>Modo preview (sem Supabase)</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28, gap: 0 },
  logoArea: { alignItems: 'center', marginBottom: 48, gap: 10 },
  star: { fontSize: 32 },
  appName: { fontSize: 34 },
  tagline: { fontSize: 14, textAlign: 'center' },
  form: { gap: 0 },
  input: {
    borderWidth: 0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600' },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14 },
  devLink: { marginTop: 48, alignItems: 'center' },
  devText: { fontSize: 13 },
});
