import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '@/features/notifications/hooks/use-notifications';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import type { InAppNotification } from '@/types/database';

const TYPE_ICON: Record<InAppNotification['type'], string> = {
  event_created: '📅',
  new_message: '📖',
  event_reminder: '⏰',
  announcement: '📢',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

function NotificationItem({
  item,
  onPress,
}: {
  item: InAppNotification;
  onPress: (n: InAppNotification) => void;
}) {
  const theme = useChurchTheme();

  return (
    <Pressable
      style={[
        styles.item,
        { backgroundColor: item.read ? theme.surface : theme.primary + '18' },
      ]}
      onPress={() => onPress(item)}
    >
      <Text style={styles.icon}>{TYPE_ICON[item.type]}</Text>
      <View style={styles.itemBody}>
        <Text style={[styles.itemTitle, { color: theme.text }, !item.read && styles.unread]}>
          {item.title}
        </Text>
        <Text style={[styles.itemBody2, { color: theme.textMuted }]} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={[styles.time, { color: theme.textMuted }]}>{timeAgo(item.created_at)}</Text>
      </View>
      {!item.read && (
        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
      )}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const theme = useChurchTheme();
  const { data, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();

  function handlePress(notification: InAppNotification) {
    if (!notification.read) markAsRead(notification.id);

    if (notification.reference_id) {
      if (notification.type === 'event_created' || notification.type === 'event_reminder') {
        router.push(`/event/${notification.reference_id}`);
      }
    }
  }

  const hasUnread = data?.some((n) => !n.read);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      {hasUnread && (
        <Pressable
          style={[styles.markAll, { borderBottomColor: theme.elevated }]}
          onPress={() => markAllAsRead()}
          disabled={markingAll}
        >
          <Text style={[styles.markAllText, { color: theme.primary }]}>
            {markingAll ? 'Marcando...' : 'Marcar todas como lidas'}
          </Text>
        </Pressable>
      )}

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationItem item={item} onPress={handlePress} />}
          contentContainerStyle={!data?.length && styles.emptyContainer}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyIcon]}>🔔</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Nenhuma notificação ainda
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.elevated }]} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: 40 },
  markAll: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  markAllText: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  item: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 },
  icon: { fontSize: 24, marginTop: 2 },
  itemBody: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 14, fontWeight: '500' },
  unread: { fontWeight: '700' },
  itemBody2: { fontSize: 13 },
  time: { fontSize: 12, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16 },
});
