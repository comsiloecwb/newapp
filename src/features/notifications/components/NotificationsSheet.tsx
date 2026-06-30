import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';

import { useNotificationsSheetStore } from '@/stores/notifications-sheet-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '../hooks/use-notifications';
import type { InAppNotification } from '@/types/database';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72;
const DISMISS_THRESHOLD = 80;

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

export function NotificationsSheet() {
  const theme = useChurchTheme();
  const { isOpen, close } = useNotificationsSheetStore();
  const { data, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 8 && gs.dy > 0,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.8) {
          close();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  function handlePress(notification: InAppNotification) {
    if (!notification.read) markAsRead(notification.id);
    if (notification.reference_id) {
      if (notification.type === 'event_created' || notification.type === 'event_reminder') {
        close();
        router.push(`/event/${notification.reference_id}` as never);
      }
    }
  }

  const hasUnread = data?.some((n) => !n.read);
  const dividerColor = theme.textMuted + '30';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      {/* Full-screen container with dark overlay */}
      <View style={styles.overlay}>
        {/* Backdrop — tap to close */}
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              paddingBottom: insets.bottom + 8,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle area — drag to dismiss */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: dividerColor }]} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Notificações</Text>
              {hasUnread && (
                <Pressable onPress={() => markAllAsRead()} disabled={markingAll}>
                  <Text style={[styles.markAllText, { color: theme.primary }]}>
                    {markingAll ? 'Marcando...' : 'Marcar todas como lidas'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.item,
                    { backgroundColor: item.read ? theme.surface : theme.primary + '18' },
                  ]}
                  onPress={() => handlePress(item)}
                >
                  <Text style={styles.itemIcon}>{TYPE_ICON[item.type]}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: theme.text },
                        !item.read && { fontWeight: '700' },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.itemBody, { color: theme.textMuted }]}
                      numberOfLines={2}
                    >
                      {item.body}
                    </Text>
                    <Text style={[styles.itemTime, { color: theme.textMuted }]}>
                      {timeAgo(item.created_at)}
                    </Text>
                  </View>
                  {!item.read && (
                    <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                  )}
                </Pressable>
              )}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: dividerColor }]} />
              )}
              contentContainerStyle={!data?.length ? styles.emptyContainer : undefined}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Bell size={48} color={theme.textMuted} strokeWidth={1.5} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    Nenhuma notificação ainda
                  </Text>
                </View>
              }
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleArea: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  itemIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemBody: {
    fontSize: 13,
  },
  itemTime: {
    fontSize: 12,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
  },
});
