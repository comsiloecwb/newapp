import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import Svg, { Path } from 'react-native-svg';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { MOCK_CHURCH, MOCK_PROFILE } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';

WebBrowser.maybeCompleteAuthSession();

const SERIF_MEDIUM = 'PlayfairDisplay_500Medium';
const BG = '#FDFCF8';
const SURFACE = '#F5F0E8';
const ELEVATED = '#EDE8DF';
const TEXT = '#1C1917';
const MUTED = '#6E5E50';
const ACCENT = '#C9954A';

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(MOCK_PROFILE, MOCK_CHURCH);
      router.replace('/(tabs)');
    }
  }, [setSession]);

  async function loadProfileAndNavigate(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    if (profileError || !profile) {
      Alert.alert('Erro', `Perfil não encontrado (${profileError?.code})`);
      return;
    }
    const { data: church, error: churchError } = await supabase
      .from('churches').select('*').eq('id', profile.church_id).single();
    if (churchError || !church) {
      Alert.alert('Erro', 'Igreja não encontrada');
      return;
    }
    setSession(profile, church);
    router.replace('/(tabs)');
  }

  async function handleLogin() {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { Alert.alert('Erro', signInError.message); return; }
      const userId = signInData.user?.id;
      if (!userId) { Alert.alert('Erro', 'Sessão inválida'); return; }
      await loadProfileAndNavigate(userId);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!isSupabaseConfigured) return;
    setGoogleLoading(true);
    try {
      const redirectTo = Linking.createURL('/auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) {
        Alert.alert('Erro', error?.message ?? 'Não foi possível iniciar o login com Google');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return;

      // Supabase retorna tokens no hash da URL de redirect
      const fragment = result.url.split('#')[1] ?? '';
      const params = Object.fromEntries(new URLSearchParams(fragment));

      if (!params.access_token || !params.refresh_token) {
        Alert.alert('Erro', 'Resposta do Google inválida. Tente novamente.');
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (sessionError) { Alert.alert('Erro', sessionError.message); return; }

      const userId = sessionData.session?.user?.id;
      if (!userId) { Alert.alert('Erro', 'Sessão inválida'); return; }

      await loadProfileAndNavigate(userId);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: BG }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.logoArea}>
          <Text style={[styles.star, { color: TEXT }]}>✦</Text>
          <Text style={[styles.appName, { color: TEXT, fontFamily: SERIF_MEDIUM }]}>App Igreja</Text>
          <Text style={[styles.tagline, { color: MUTED }]}>Entre com sua conta da igreja</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: TEXT, backgroundColor: SURFACE }]}
            placeholder="E-mail"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { color: TEXT, backgroundColor: SURFACE, marginBottom: 24 }]}
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
            {loading
              ? <ActivityIndicator size="small" color={BG} />
              : <Text style={[styles.buttonText, { color: BG }]}>Entrar</Text>
            }
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: ELEVATED }]} />
            <Text style={[styles.dividerText, { color: MUTED }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: ELEVATED }]} />
          </View>

          <Pressable
            style={[styles.googleBtn, { backgroundColor: SURFACE, borderColor: ELEVATED }]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={TEXT} />
            ) : (
              <>
                <GoogleLogo size={18} />
                <Text style={[styles.googleBtnText, { color: TEXT }]}>Continuar com Google</Text>
              </>
            )}
          </Pressable>

          <Pressable onPress={() => router.push('/register' as never)} style={styles.link}>
            <Text style={[styles.linkText, { color: MUTED }]}>Criar conta</Text>
          </Pressable>
        </View>

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
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logoArea: { alignItems: 'center', marginBottom: 48, gap: 10 },
  star: { fontSize: 32 },
  appName: { fontSize: 34 },
  tagline: { fontSize: 14, textAlign: 'center' },
  form: { gap: 0 },
  input: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: { fontSize: 15, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 15,
    gap: 10,
    minHeight: 52,
  },
  googleBtnText: { fontSize: 15, fontWeight: '500' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14 },
  devLink: { marginTop: 48, alignItems: 'center' },
  devText: { fontSize: 13 },
});
