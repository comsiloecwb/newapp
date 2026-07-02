import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Share2, UserCheck, Users } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { getTodayDevotional } from '@/lib/devotionals';
import {
  useGroup,
  useGroupMembers,
  useGroupDayCompletions,
  useMarkGroupDay,
} from '@/features/devotional/hooks/use-groups';
import { useAuthStore } from '@/stores/auth-store';

const DARK_BG = '#0A1628';
const GREEN = '#16A34A';
const SERIF = 'PlayfairDisplay_500Medium';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useChurchTheme();
  const userId = useAuthStore((s) => s.profile?.id);

  const today = getTodayDevotional();
  const todayDayNum = new Date().getDate();

  const { data: group, isLoading: groupLoading } = useGroup(id);
  const { data: members = [] } = useGroupMembers(id);
  const { data: completions = [] } = useGroupDayCompletions(id, todayDayNum);
  const { mutate: markDay, isPending: marking } = useMarkGroupDay(id);

  const myCompletion = completions.find((c) => c.user_id === userId);
  const completedSet = new Set(completions.map((c) => c.user_id));

  async function handleShare() {
    if (!group) return;
    await Share.share({
      message: `Entre no grupo "${group.name}"!\nLink: appigreja://grupo/${group.invite_code}\nCódigo: ${group.invite_code}`,
    });
  }

  if (groupLoading || !group) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: group.name,
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
          headerRight: () => (
            <Pressable onPress={handleShare} hitSlop={8} style={{ marginRight: 4 }}>
              <Share2 size={20} color="#fff" strokeWidth={1.6} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Invite code strip */}
          <Pressable style={[styles.codeStrip, { backgroundColor: theme.surface }]} onPress={handleShare}>
            <Text style={[styles.codeStripLabel, { color: theme.textMuted }]}>CÓDIGO DE CONVITE</Text>
            <Text style={[styles.codeStripValue, { color: theme.goldText }]}>{group.invite_code}</Text>
            <Share2 size={14} color={theme.textMuted} strokeWidth={1.6} />
          </Pressable>

          {/* Today's devotional */}
          <View style={[styles.devotionalCard, { backgroundColor: DARK_BG }]}>
            <View style={styles.dayChip}>
              <BookOpen size={12} color="#C9A84C" strokeWidth={2} />
              <Text style={styles.dayChipText}>HOJE · DIA {todayDayNum}</Text>
            </View>
            <Text style={[styles.devTitle, { fontFamily: SERIF }]}>{today.title}</Text>
            <Text style={styles.devPassage}>{today.passage}</Text>
          </View>

          <View style={[styles.verseCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.verseLine, { backgroundColor: theme.goldText }]} />
            <Text style={[styles.verseText, { color: theme.text, fontFamily: SERIF }]}>{today.verse}</Text>
          </View>

          <Text style={[styles.reflection, { color: theme.text }]}>{today.reflection}</Text>

          <View style={[styles.prayerCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ORAÇÃO</Text>
            <Text style={[styles.reflection, { color: theme.text }]}>{today.prayer}</Text>
          </View>

          {myCompletion ? (
            <View style={[styles.doneRow, { backgroundColor: `${GREEN}18` }]}>
              <Text style={[styles.doneText, { color: GREEN }]}>✓  Você marcou como lido hoje</Text>
            </View>
          ) : (
            <Pressable
              style={[styles.doneBtn, marking && styles.disabled]}
              onPress={() => markDay(todayDayNum)}
              disabled={marking}
            >
              <Text style={styles.doneBtnText}>{marking ? 'Salvando...' : 'Marcar como lido'}</Text>
            </Pressable>
          )}

          {/* Member progress */}
          <View style={styles.membersSection}>
            <View style={styles.membersHeader}>
              <Users size={15} color={theme.textMuted} strokeWidth={1.6} />
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
                MEMBROS · {members.length}
              </Text>
            </View>

            {members.map((m) => {
              const done = completedSet.has(m.user_id);
              const isMe = m.user_id === userId;
              return (
                <View key={m.user_id} style={[styles.memberRow, { backgroundColor: theme.surface }]}>
                  <View style={[styles.avatar, { backgroundColor: done ? `${GREEN}20` : theme.elevated }]}>
                    {done
                      ? <UserCheck size={16} color={GREEN} strokeWidth={2} />
                      : <Text style={[styles.avatarInitial, { color: theme.textMuted }]}>
                          {m.name.charAt(0).toUpperCase()}
                        </Text>
                    }
                  </View>
                  <Text style={[styles.memberName, { color: theme.text }]}>
                    {m.name}{isMe ? ' (você)' : ''}
                  </Text>
                  {done
                    ? <Text style={[styles.memberStatus, { color: GREEN }]}>✓ Lido</Text>
                    : <Text style={[styles.memberStatus, { color: theme.textMuted }]}>pendente</Text>
                  }
                </View>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 48, gap: 14 },

  codeStrip: { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeStripLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  codeStripValue: { flex: 1, fontSize: 16, fontWeight: '700', letterSpacing: 3 },

  devotionalCard: { borderRadius: 16, padding: 22, gap: 8 },
  dayChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayChipText: { color: '#C9A84C', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  devTitle: { fontSize: 24, color: '#fff', lineHeight: 30 },
  devPassage: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },

  verseCard: { borderRadius: 14, padding: 18, flexDirection: 'row', gap: 12 },
  verseLine: { width: 3, borderRadius: 2 },
  verseText: { flex: 1, fontSize: 15, lineHeight: 24, fontStyle: 'italic' },

  reflection: { fontSize: 15, lineHeight: 25 },
  prayerCard: { borderRadius: 14, padding: 18, gap: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  doneBtn: { backgroundColor: '#16A34A', borderRadius: 14, padding: 17, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  doneRow: { borderRadius: 14, padding: 17, alignItems: 'center' },
  doneText: { fontSize: 14, fontWeight: '600' },

  membersSection: { gap: 8 },
  membersHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 15, fontWeight: '700' },
  memberName: { flex: 1, fontSize: 14, fontWeight: '500' },
  memberStatus: { fontSize: 12, fontWeight: '600' },
});
