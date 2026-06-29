import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { queryClient } from '@/lib/query-client';
import { ChurchThemeProvider } from '@/theme/ChurchThemeProvider';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChurchThemeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="event/[id]"
            options={{ headerShown: true, title: 'Evento', presentation: 'card' }}
          />
        </Stack>
      </ChurchThemeProvider>
    </QueryClientProvider>
  );
}