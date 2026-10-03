import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { supabase } from '../src/config/supabase';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['THREE.Clock: This module has been deprecated']);

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const segments = useSegments();
  const router = useRouter();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    if (Platform.OS !== 'web') {
      SystemUI.setBackgroundColorAsync('#8B0000');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted.current) {
        setSession(session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted.current) {
        setSession(session);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading || !isMounted.current) return;

    const currentSegment = segments[0] || 'index';

    // 🔥 PERBAIKAN: Masukkan forgot-password dan update-password ke daftar pengecualian
    const isAuthPage = currentSegment === 'login' || currentSegment === 'register' || currentSegment === 'forgot-password' || currentSegment === 'update-password';

    // Gunakan setTimeout kecil untuk memastikan navigasi siap menerima perintah replace
    const timeout = setTimeout(() => {
      if (!session && !isAuthPage && currentSegment !== 'index') {
        router.replace('/login');
      } else if (session && (isAuthPage || currentSegment === 'index')) {
        if (currentSegment !== 'update-password') {
          router.replace('/home');
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#8B0000' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#8B0000' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />

          {/* 🔥 PERBAIKAN: Daftarkan layar baru di sini */}
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="update-password" />

          <Stack.Screen name="home" options={{ gestureEnabled: false }} />
          <Stack.Screen name="scan" />
          <Stack.Screen name="heroes" />
          <Stack.Screen name="hero/[id]" />
          <Stack.Screen name="ar/[id]" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="leaderboard" />
          <Stack.Screen name="dashboard-guru" />
          <Stack.Screen name="guru/kuis" />
          <Stack.Screen name="guru/monitoring" />
          <Stack.Screen name="guru/siswa" />
          <Stack.Screen name="guru/quiz_management" />
          <Stack.Screen name="guide" />
          <Stack.Screen name="about" />
          <Stack.Screen name="qr-codes" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
