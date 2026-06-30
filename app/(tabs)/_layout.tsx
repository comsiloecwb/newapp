import { Bell, Calendar, Home, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useNotificationsStore } from '@/stores/notifications-store';
import { useNotificationsSheetStore } from '@/stores/notifications-sheet-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { NotificationsSheet } from '@/features/notifications/components/NotificationsSheet';

function BellButton() {
  const theme = useChurchTheme();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const open = useNotificationsSheetStore((s) => s.open);

  return (
    <Pressable onPress={open} style={styles.bellButton} hitSlop={8}>
      <Bell size={23} color={theme.text} strokeWidth={1.8} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function TabsLayout() {
  const theme = useChurchTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarStyle: { backgroundColor: theme.surface },
          headerRight: () => <BellButton />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendário',
            tabBarLabel: 'Calendário',
            tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
        <Tabs.Screen name="notifications" options={{ href: null }} />
      </Tabs>
      <NotificationsSheet />
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    marginRight: 16,
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
