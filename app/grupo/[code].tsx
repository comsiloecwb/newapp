import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useJoinGroup } from '@/features/devotional/hooks/use-groups';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const DARK_BG = '#0A1628';
const SERIF = 'PlayfairDisplay_500Medium';

export default function JoinGroupScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const theme = useChurchTheme();
  const { mutate: joinGroup, isPending } = useJoinGroup();
  const [groupName, setGroupName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    if (!isSupabaseConfigured) {
      setGroupName('Grupo (preview)');
      return;
    }
    supabase
      .from('study_groups')
      .select('name')
      .eq('invite_code', code.toUpperCase())
      .single()
      .then(({ data }) => {
        if (data) setGroupName(data.name);
        else setNotFound(true);
      });
  }, [code]);

  function handleJoin() {
    joinGroup(code, {
      onSuccess: (group) => {
        router.replace(`/devocional/grupo/${group.id}` as never);
      },
      onError: (err) => Alert.alert('Erro', err.message),
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Entrar no grupo',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        {!groupName && !notFound ? (
          <ActivityIndicator color={theme.accent} />
        ) : notFound ? (
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>Grupo não encontrado</Text>
            <Text style={[styles.sub, { color: theme.textMuted }]}>
              O código "{code}" não corresponde a nenhum grupo.
            </Text>
            <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: theme.surface }]}>
              <Text style={[styles.btnText, { color: theme.text }]}>Voltar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={[styles.iconWrap, { backgroundColor: DARK_BG }]}>
              <Users size={36} color="#C9A84C" strokeWidth={1.4} />
            </View>
            <Text style={[styles.invite, { color: theme.textMuted }]}>Você foi convidado para</Text>
            <Text style={[styles.groupName, { color: theme.text, fontFamily: SERIF }]}>{groupName}</Text>
            <Text style={[styles.code, { color: theme.textMuted }]}>Código: {code?.toUpperCase()}</Text>

            <Pressable
              style={[styles.btn, { backgroundColor: theme.text }, isPending && styles.disabled]}
              onPress={handleJoin}
              disabled={isPending}
            >
              <Text style={[styles.btnText, { color: theme.background }]}>
                {isPending ? 'Entrando...' : 'Entrar no grupo'}
              </Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancelar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  content: { width: '100%', alignItems: 'center', gap: 12 },
  iconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  invite: { fontSize: 14 },
  groupName: { fontSize: 28, textAlign: 'center', lineHeight: 34 },
  code: { fontSize: 13, marginBottom: 8 },
  btn: { width: '100%', borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  btnText: { fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  cancelBtn: { marginTop: 4 },
  cancelText: { fontSize: 14 },
  title: { fontSize: 22, fontWeight: '600' },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
