'use client';
import { Bell, Calendar, Home, Users2, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { registerPushToken } from '@/lib/push-notifications';

import { useNotificationsStore } from '@/stores/notifications-store';
import { useNotificationsSheetStore } from '@/stores/notifications-sheet-store';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { NotificationsSheet } from '@/features/notifications/components/NotificationsSheet';

const GOLD = '#C9A84C';
const SERIF = 'PlayfairDisplay_500Medium';

function HeaderLeft() {
  const theme = useChurchTheme();
  const church = useAuthStore((s) => s.church);
  return (
    <View style={styles.headerLeft}>
      <Text style={[styles.star, { color: theme.text }]}>✦</Text>
      <Text style={[styles.churchLabel, { color: theme.text, fontFamily: SERIF }]} numberOfLines={1}>
        {church?.name ?? 'App Igreja'}
      </Text>
    </View>
  );
}

function BellButton() {
  const theme = useChurchTheme();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const open = useNotificationsSheetStore((s) => s.open);

  return (
    <Pressable onPress={open} style={styles.bellButton} hitSlop={8}>
      <Bell size={21} color={theme.text} strokeWidth={1.6} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: GOLD }]}>
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
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    if (profile?.id) registerPushToken(profile.id);
  }, [profile?.id]);

  return (
    <>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerLeft: () => <HeaderLeft />,
          headerTitle: () => null,
          headerRight: () => <BellButton />,
          tabBarActiveTintColor: GOLD,
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: '#E0E0E0',
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '600',
            letterSpacing: 0.8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarLabel: 'INÍCIO',
            tabBarIcon: ({ color, size }) => (
              <Home color={color} size={size - 2} strokeWidth={1.6} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            tabBarLabel: 'AGENDA',
            tabBarIcon: ({ color, size }) => (
              <Calendar color={color} size={size - 2} strokeWidth={1.6} />
            ),
          }}
        />
        <Tabs.Screen
          name="comunidade"
          options={{
            tabBarLabel: 'COMUNIDADE',
            tabBarIcon: ({ color, size }) => (
              <Users2 color={color} size={size - 2} strokeWidth={1.6} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'PERFIL',
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size - 2} strokeWidth={1.6} />
            ),
          }}
        />
        {/* Ocultas da tab bar */}
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="celulas" options={{ href: null }} />
        <Tabs.Screen name="social" options={{ href: null }} />
      </Tabs>
      <NotificationsSheet />
    </>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 20,
  },
  star: { fontSize: 17, lineHeight: 22 },
  churchLabel: {
    fontSize: 14,
    letterSpacing: 0.2,
    maxWidth: 200,
  },
  bellButton: { marginRight: 20, padding: 4 },
  badge: {
    position: 'absolute',
    top: -3,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', lineHeight: 12 },
});
