import { Tabs } from 'expo-router';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export default function TabsLayout() {
  const theme = useChurchTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendário', tabBarLabel: 'Calendário' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarLabel: 'Perfil' }} />
    </Tabs>
  );
}
