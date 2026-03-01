import '../global.css';

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StatusBar, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/common/LoadingScreen';

SplashScreen.preventAutoHideAsync();

export function RootLayoutNav() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      switch (role) {
        case 'student':
          router.replace('/(student)');
          break;
        case 'coach':
          router.replace('/(coach)');
          break;
        case 'manager':
          router.replace('/(manager)');
          break;
        case 'admin':
          router.replace('/(admin)');
          break;
        default:
          router.replace('/(auth)/login');
      }
    }
  }, [user, role, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0F1A' }}>
        <LoadingScreen />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(coach)" />
      <Stack.Screen name="(manager)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F1A' }}>
        <View className="flex-1 bg-brand-background" style={{ backgroundColor: '#0F0F1A' }}>
          <QueryProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </QueryProvider>
        </View>
      </GestureHandlerRootView>
    </>
  );
}
