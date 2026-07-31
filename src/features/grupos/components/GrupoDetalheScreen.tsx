import { useCallback, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MoreVertical, Send } from 'lucide-react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useAuthStore } from '@/stores/auth-store';
import { useGrupo, useGrupoMembros, useLeaveGrupo } from '@/features/grupos/hooks/use-grupos';
import {
  useMensagens,
  useSendMensagem,
  useMensagensRealtime,
  type MensagemGrupoRow,
} from '@/features/grupos/hooks/use-mensagens';
import type { Grupo } from '@/types/database';

function GrupoOptionsButton({ grupo, onLeave }: { grupo: Grupo; onLeave: () => void }) {
  const theme = useChurchTheme();

  const handlePress = () => {
    const shareMsg = `Entre no grupo "${grupo.nome}" no app. Código: ${grupo.invite_code}`;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Compartilhar código de convite', 'Sair do grupo'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
          title: grupo.nome,
          message: `Código de convite: ${grupo.invite_code}`,
        },
        (i) => {
          if (i === 1) Share.share({ message: shareMsg });
          if (i === 2) onLeave();
        }
      );
    } else {
      Alert.alert(grupo.nome, `Código: ${grupo.invite_code}`, [
        { text: 'Compartilhar código', onPress: () => Share.share({ message: shareMsg }) },
        { text: 'Sair do grupo', style: 'destructive', onPress: onLeave },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  return (
    <Pressable onPress={handlePress} hitSlop={8} style={{ marginRight: 16 }}>
      <MoreVertical size={20} color={theme.text} strokeWidth={1.8} />
    </Pressable>
  );
}

function MensagemBubble({
  msg,
  isOwn,
  senderName,
}: {
  msg: MensagemGrupoRow;
  isOwn: boolean;
  senderName: string;
}) {
  const theme = useChurchTheme();
  const time = new Date(msg.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <View style={[styles.bubbleWrap, isOwn ? styles.wrapOwn : styles.wrapOther]}>
      {!isOwn && (
        <Text style={[styles.senderName, { color: theme.accent }]}>{senderName}</Text>
      )}
      <View style={[styles.bubble, { backgroundColor: isOwn ? theme.accent : theme.surface }]}>
        <Text style={[styles.msgText, { color: isOwn ? '#fff' : theme.text }]}>{msg.text}</Text>
      </View>
      <Text style={[styles.msgTime, { color: theme.textMuted }]}>{time}</Text>
    </View>
  );
}

export function GrupoDetalheScreen() {
  const rawId = useLocalSearchParams<{ id: string }>().id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const theme = useChurchTheme();
  const userId = useAuthStore((s) => s.user?.id);
  const [text, setText] = useState('');

  const { data: grupo } = useGrupo(id);
  const { data: membros } = useGrupoMembros(id);
  const { data: mensagens, isLoading } = useMensagens(id);
  const { mutate: send, isPending: sending } = useSendMensagem(id ?? '');
  const { mutate: leave } = useLeaveGrupo(id ?? '');
  useMensagensRealtime(id);

  const nameMap = useMemo(() => {
    const map: Record<string, string> = {};
    (membros ?? []).forEach((m) => { map[m.id] = m.nome; });
    return map;
  }, [membros]);

  const handleSend = useCallback(() => {
    if (!text.trim() || sending) return;
    send(text.trim(), {
      onSuccess: () => setText(''),
      onError: (e: any) => Alert.alert('Erro ao enviar', e?.message ?? String(e)),
    });
  }, [text, sending, send]);

  const handleLeave = useCallback(() => {
    Alert.alert('Sair do grupo', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () =>
          leave(undefined, {
            onSuccess: () => router.back(),
            onError: (e: any) => Alert.alert('Erro', e?.message),
          }),
      },
    ]);
  }, [leave]);

  const renderItem = useCallback(
    ({ item }: { item: MensagemGrupoRow }) => (
      <MensagemBubble
        msg={item}
        isOwn={item.user_id === userId}
        senderName={nameMap[item.user_id] ?? 'Membro'}
      />
    ),
    [userId, nameMap]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: grupo?.nome ?? 'Grupo',
          headerRight: () =>
            grupo ? <GrupoOptionsButton grupo={grupo} onLeave={handleLeave} /> : null,
        }}
      />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.accent} />
          </View>
        ) : !mensagens?.length ? (
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Nenhuma mensagem ainda.{'\n'}Seja o primeiro a enviar!
            </Text>
          </View>
        ) : (
          <FlatList
            data={mensagens}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.inputBar,
            { backgroundColor: theme.background, borderTopColor: theme.elevated },
          ]}
        >
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder="Mensagem..."
            placeholderTextColor={theme.textMuted}
            value={text}
            onChangeText={setText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor: theme.accent,
                opacity: !text.trim() || sending || pressed ? 0.5 : 1,
              },
            ]}
          >
            <Send size={18} color="#fff" strokeWidth={2} />
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
  list: { padding: 12, paddingBottom: 8 },
  bubbleWrap: { maxWidth: '80%', marginVertical: 3 },
  wrapOwn: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  wrapOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 11, fontWeight: '700', marginBottom: 2, marginLeft: 2 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  msgText: { fontSize: 15, lineHeight: 20 },
  msgTime: { fontSize: 10, marginTop: 2, marginHorizontal: 2 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
