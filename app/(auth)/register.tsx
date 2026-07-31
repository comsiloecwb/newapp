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
  View,
} from 'react-native';
import { router } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

const SERIF = 'PlayfairDisplay_500Medium';
const BG = '#FDFCF8';
const SURFACE = '#F5F0E8';
const TEXT = '#1C1917';
const MUTED = '#9C8C7A';
const ACCENT = '#C9954A';
const ERROR = '#DC2626';

export default function RegisterScreen() {
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const CHURCH_ID = process.env.EXPO_PUBLIC_CHURCH_ID!;

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome obrigatório';
    if (!email.trim()) e.email = 'E-mail obrigatório';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);

    try {
      // 1. Cria usuário no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: 'appigreja://auth/callback',
        },
      });

      if (signUpError || !authData.user) {
        Alert.alert('Erro', signUpError?.message ?? 'Erro ao criar conta');
        return;
      }

      // Confirmação de email ativa: sem sessão ainda — perfil criado no callback
      if (!authData.session) {
        Alert.alert(
          'Verifique seu e-mail',
          `Enviamos um link de confirmação para ${email.trim()}. Clique nele para acessar o app.`,
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
        );
        return;
      }

      // Confirmação desativada: sessão já disponível — cria perfil agora
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          tenant_id: CHURCH_ID,
          role: 'visitor',
          is_lider: false,
          nome: name.trim(),
          email: email.trim().toLowerCase(),
          notify_new_events: true,
          notify_event_reminders: true,
        })
        .select()
        .single();

      if (!newUser) {
        router.replace('/(auth)/login');
        return;
      }

      const { data: tenant } = await supabase
        .from('tenants').select('*').eq('id', CHURCH_ID).single();

      if (tenant) {
        setSession(newUser, tenant);
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: BG }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[styles.backBtn, { color: MUTED }]}>← Voltar</Text>
          </Pressable>
          <Text style={[styles.title, { color: TEXT, fontFamily: SERIF }]}>Criar conta</Text>
          <Text style={[styles.subtitle, { color: MUTED }]}>
            Crie sua conta para acessar o app da sua igreja
          </Text>
        </View>

        {/* Campos */}
        <View style={styles.form}>
          <Field
            label="Nome completo"
            value={name}
            onChangeText={setName}
            placeholder="Ana Oliveira"
            autoCapitalize="words"
            error={errors.name}
          />
          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="ana@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Field
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={errors.password}
          />
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: TEXT }, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: BG }]}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.loginLink}>
          <Text style={[styles.loginLinkText, { color: MUTED }]}>
            Já tem conta?{'  '}
            <Text style={{ color: ACCENT }}>Fazer login</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  error,
  hint,
  ...inputProps
}: {
  label: string;
  error?: string;
  hint?: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: MUTED }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: SURFACE, color: TEXT },
          !!error && { borderWidth: 1, borderColor: ERROR + '60' },
        ]}
        placeholderTextColor={MUTED}
        {...inputProps}
      />
      {error ? (
        <Text style={[styles.fieldMsg, { color: ERROR }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.fieldMsg, { color: MUTED }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  header: { marginBottom: 32, gap: 8 },
  backBtn: { fontSize: 14, marginBottom: 4 },
  title: { fontSize: 32, lineHeight: 38 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  form: { gap: 16, marginBottom: 28 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  input: { borderRadius: 12, padding: 15, fontSize: 15 },
  fieldMsg: { fontSize: 12 },
  button: { borderRadius: 13, padding: 17, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 15, fontWeight: '600' },
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14 },
});
