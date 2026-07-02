import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';

import { queryClient } from '@/lib/query-client';
import { ChurchThemeProvider } from '@/theme/ChurchThemeProvider';

export default function RootLayout() {
  useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ChurchThemeProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="event/[id]"
            options={{ headerShown: true, title: 'Evento', presentation: 'card' }}
          />
          <Stack.Screen name="leitura" options={{ presentation: 'card' }} />
          <Stack.Screen name="comunidade/palavras" options={{ presentation: 'card' }} />
          <Stack.Screen name="comunidade/oracao" options={{ presentation: 'card' }} />
          <Stack.Screen name="comunidade/doacoes" options={{ presentation: 'card' }} />
          <Stack.Screen name="comunidade/fotos" options={{ presentation: 'card' }} />
          <Stack.Screen name="palavra/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </ChurchThemeProvider>
    </QueryClientProvider>
  );
}
