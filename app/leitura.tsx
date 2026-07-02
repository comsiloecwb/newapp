import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, CheckCircle2 } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useReadingProgress, useCompleteDay } from '@/features/reading/hooks/use-reading';
import { FUNDAMENTOS_30 } from '@/lib/reading-plans';

const DARK_BG = '#0A1628';
const GREEN = '#16A34A';
const SERIF = 'PlayfairDisplay_500Medium';

export default function LeituraScreen() {
  const theme = useChurchTheme();
  const plan = FUNDAMENTOS_30;

  const { data: completedDays = [], isLoading } = useReadingProgress(plan.id);
  const { mutate: completeDay, isPending: completing } = useCompleteDay(plan.id);

  const completedSet = new Set(completedDays);
  const doneCount = completedDays.length;
  const progress = doneCount / plan.totalDays;

  // Current day = first incomplete day; capped at totalDays
  const currentDayNum = Math.min(doneCount + 1, plan.totalDays);
  const currentDay = plan.days[currentDayNum - 1];
  const todayDone = completedSet.has(currentDayNum);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Plano de Leitura',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Plan header */}
          <View style={[styles.planHeader, { backgroundColor: DARK_BG }]}>
            <Text style={[styles.planTitle, { fontFamily: SERIF }]}>{plan.title}</Text>
            <Text style={styles.planSub}>{plan.subtitle}</Text>

            <View style={styles.progressRow}>
              <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{doneCount}/{plan.totalDays}</Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={theme.accent} />
          ) : (
            <>
              {/* Today card */}
              <View style={styles.todaySection}>
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
                  {todayDone ? 'LEITURA CONCLUÍDA' : 'LEITURA DE HOJE'}
                </Text>

                <View style={[styles.todayCard, { backgroundColor: theme.surface }]}>
                  <View style={styles.todayTop}>
                    <View style={[styles.dayBadge, { backgroundColor: DARK_BG }]}>
                      <Text style={styles.dayBadgeText}>DIA {currentDayNum}</Text>
                    </View>
                    {todayDone && (
                      <CheckCircle2 size={20} color={GREEN} strokeWidth={1.8} />
                    )}
                  </View>

                  <Text style={[styles.todayTitle, { color: theme.text, fontFamily: SERIF }]}>
                    {currentDay.title}
                  </Text>
                  <Text style={[styles.todayTheme, { color: theme.textMuted }]}>
                    {currentDay.theme}
                  </Text>

                  <View style={[styles.passagesDivider, { backgroundColor: theme.elevated }]} />

                  {currentDay.passages.map((p) => (
                    <View key={p} style={styles.passageRow}>
                      <BookOpen size={14} color={theme.goldText} strokeWidth={1.6} />
                      <Text style={[styles.passage, { color: theme.text }]}>{p}</Text>
                    </View>
                  ))}

                  {!todayDone && (
                    <Pressable
                      style={[styles.doneBtn, completing && styles.doneBtnDisabled]}
                      onPress={() => completeDay(currentDayNum)}
                      disabled={completing}
                    >
                      <Text style={styles.doneBtnText}>
                        {completing ? 'Salvando...' : 'Marcar como lida'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Days grid */}
              <View style={styles.gridSection}>
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>TODOS OS DIAS</Text>
                <View style={styles.grid}>
                  {plan.days.map((d) => {
                    const done = completedSet.has(d.day);
                    const isCurrent = d.day === currentDayNum;
                    return (
                      <Pressable
                        key={d.day}
                        style={[
                          styles.gridCell,
                          { backgroundColor: done ? GREEN : isCurrent ? DARK_BG : theme.surface },
                          isCurrent && !done && styles.gridCellCurrent,
                        ]}
                        onPress={() => !done && completeDay(d.day)}
                        disabled={done || completing}
                      >
                        <Text style={[
                          styles.gridNum,
                          { color: done || isCurrent ? '#fff' : theme.textMuted },
                        ]}>
                          {done ? '✓' : d.day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 48 },

  planHeader: {
    padding: 24,
    paddingTop: 28,
    gap: 6,
  },
  planTitle: { fontSize: 24, color: '#fff' },
  planSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 3 },
  progressLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', width: 40, textAlign: 'right' },

  todaySection: { padding: 20, gap: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  todayCard: { borderRadius: 16, padding: 20, gap: 10 },
  todayTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  dayBadgeText: { color: '#C9A84C', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  todayTitle: { fontSize: 24, lineHeight: 30 },
  todayTheme: { fontSize: 14, lineHeight: 20 },
  passagesDivider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  passageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  passage: { fontSize: 15, fontWeight: '500' },

  doneBtn: {
    marginTop: 8,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneBtnDisabled: { opacity: 0.6 },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  gridSection: { paddingHorizontal: 20, gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellCurrent: { borderWidth: 2, borderColor: '#C9A84C' },
  gridNum: { fontSize: 13, fontWeight: '600' },
});
