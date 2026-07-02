import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ChevronRight, Users } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { getTodayDevotional } from '@/lib/devotionals';
import { useDailyProgress, useMarkDailyRead, useGroupDevotionals } from '@/features/devotional/hooks/use-devotional';

const DARK_BG = '#0A1628';
const GREEN = '#16A34A';
const SERIF = 'PlayfairDisplay_500Medium';

type Tab = 'hoje' | 'grupo';

export default function DevocionalScreen() {
  const theme = useChurchTheme();
  const [tab, setTab] = useState<Tab>('hoje');
  const today = getTodayDevotional();
  const todayDayOfMonth = new Date().getDate();

  const { data: dailyDone = [] } = useDailyProgress();
  const { mutate: markRead, isPending: marking } = useMarkDailyRead();
  const { data: groupDevotionals = [], isLoading: groupLoading } = useGroupDevotionals();

  const isReadToday = dailyDone.includes(todayDayOfMonth);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Devocional',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>

        {/* Tabs */}
        <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.elevated }]}>
          {(['hoje', 'grupo'] as Tab[]).map((t) => (
            <Pressable key={t} style={styles.tabBtn} onPress={() => setTab(t)}>
              <Text style={[styles.tabLabel, { color: tab === t ? theme.text : theme.textMuted }]}>
                {t === 'hoje' ? 'Hoje' : 'Em Grupo'}
              </Text>
              {tab === t && <View style={[styles.tabUnderline, { backgroundColor: theme.goldText }]} />}
            </Pressable>
          ))}
        </View>

        {tab === 'hoje' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            {/* Date label */}
            <Text style={[styles.dateLabel, { color: theme.textMuted }]}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
            </Text>

            {/* Hero card */}
            <View style={[styles.heroCard, { backgroundColor: DARK_BG }]}>
              <Text style={[styles.heroTitle, { fontFamily: SERIF }]}>{today.title}</Text>
              <Text style={styles.heroPassage}>{today.passage}</Text>
            </View>

            {/* Verse */}
            <View style={[styles.verseCard, { backgroundColor: theme.surface }]}>
              <View style={[styles.verseLine, { backgroundColor: theme.goldText }]} />
              <Text style={[styles.verseText, { color: theme.text, fontFamily: SERIF }]}>
                {today.verse}
              </Text>
            </View>

            {/* Reflection */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>REFLEXÃO</Text>
              <Text style={[styles.bodyText, { color: theme.text }]}>{today.reflection}</Text>
            </View>

            {/* Prayer */}
            <View style={[styles.prayerCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ORAÇÃO</Text>
              <Text style={[styles.bodyText, { color: theme.text }]}>{today.prayer}</Text>
            </View>

            {/* CTA */}
            {isReadToday ? (
              <View style={[styles.doneRow, { backgroundColor: `${GREEN}18` }]}>
                <Text style={[styles.doneText, { color: GREEN }]}>✓  Devocional concluído hoje</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.doneBtn, marking && styles.disabled]}
                onPress={() => markRead(todayDayOfMonth)}
                disabled={marking}
              >
                <Text style={styles.doneBtnText}>{marking ? 'Salvando...' : 'Marcar como lido'}</Text>
              </Pressable>
            )}

          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={[styles.dateLabel, { color: theme.textMuted }]}>
              DEVOCIONAIS DA IGREJA
            </Text>

            {groupLoading ? (
              <ActivityIndicator style={{ marginTop: 32 }} color={theme.accent} />
            ) : groupDevotionals.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: theme.surface }]}>
                <Users size={32} color={theme.textMuted} strokeWidth={1.4} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  Nenhum devocional em grupo disponível ainda.
                </Text>
              </View>
            ) : (
              groupDevotionals.map((d) => (
                <Pressable
                  key={d.id}
                  style={[styles.groupCard, { backgroundColor: theme.surface }]}
                  onPress={() => router.push(`/devocional/${d.id}` as never)}
                >
                  <View style={[styles.groupIconWrap, { backgroundColor: DARK_BG }]}>
                    <BookOpen size={20} color="#C9A84C" strokeWidth={1.6} />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={[styles.groupTitle, { color: theme.text }]}>{d.title}</Text>
                    {d.description && (
                      <Text style={[styles.groupDesc, { color: theme.textMuted }]} numberOfLines={2}>
                        {d.description}
                      </Text>
                    )}
                    <Text style={[styles.groupMeta, { color: theme.goldText }]}>
                      {d.total_days} dias
                    </Text>
                  </View>
                  <ChevronRight size={16} color={theme.textMuted} strokeWidth={1.6} />
                </Pressable>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, position: 'relative' },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  tabUnderline: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2, borderRadius: 1 },

  scroll: { padding: 20, paddingBottom: 48, gap: 16 },
  dateLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  heroCard: { borderRadius: 16, padding: 24, gap: 8 },
  heroTitle: { fontSize: 28, color: '#fff', lineHeight: 34 },
  heroPassage: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

  verseCard: { borderRadius: 14, padding: 20, flexDirection: 'row', gap: 14 },
  verseLine: { width: 3, borderRadius: 2 },
  verseText: { flex: 1, fontSize: 16, lineHeight: 26, fontStyle: 'italic' },

  section: { gap: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  bodyText: { fontSize: 15, lineHeight: 26 },

  prayerCard: { borderRadius: 14, padding: 20, gap: 8 },

  doneBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  doneRow: { borderRadius: 14, padding: 18, alignItems: 'center' },
  doneText: { fontSize: 14, fontWeight: '600' },

  emptyBox: { borderRadius: 16, padding: 32, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  groupCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  groupIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  groupInfo: { flex: 1, gap: 3 },
  groupTitle: { fontSize: 15, fontWeight: '600' },
  groupDesc: { fontSize: 13, lineHeight: 18 },
  groupMeta: { fontSize: 12, fontWeight: '600' },
});
