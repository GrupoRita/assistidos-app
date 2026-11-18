import { Fraunces_400Regular_Italic, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/toast';
import { AuthProvider, useAuth } from '@/lib/auth';
import { colors, fonts } from '@/lib/theme';

void SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { ready, token } = useAuth();
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    Fraunces_400Regular_Italic,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });
  const loaded = ready && fontsLoaded;

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.nfc,
        headerTitleStyle: { fontFamily: fonts.bold, color: colors.foreground },
        headerBackTitle: 'Voltar',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="assistidos" options={{ title: 'Assistidos cadastrados' }} />
        <Stack.Screen name="relatorio" options={{ title: 'Relatório' }} />
        <Stack.Screen name="assistido/novo" options={{ title: 'Novo assistido' }} />
        <Stack.Screen name="assistido/[id]/index" options={{ title: 'Assistido' }} />
        <Stack.Screen name="assistido/[id]/editar" options={{ title: 'Alterar dados' }} />
        <Stack.Screen name="servico/[id]" options={{ title: 'Serviço', presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <RootStack />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
