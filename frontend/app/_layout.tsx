import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

console.log('RootLayout module loaded');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { loading } = useAuth();

  console.log('RootLayoutNav rendering, loading:', loading);

  useEffect(() => {
    console.log('RootLayoutNav useEffect, loading:', loading);
    if (!loading) {
      // Hide splash screen when auth loading is complete
      console.log('Calling SplashScreen.hideAsync()');
      SplashScreen.hideAsync().then(() => {
        console.log('SplashScreen hidden successfully');
      }).catch((err) => {
        console.error('SplashScreen.hideAsync error:', err);
      });
    }
  }, [loading]);

  // Show nothing while loading (splash screen is visible)
  if (loading) {
    console.log('RootLayoutNav returning null due to loading');
    return null;
  }

  console.log('RootLayoutNav rendering Stack');
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#050505' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="venue/[id]" />
        <Stack.Screen name="booking/[venueId]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="owner/dashboard" />
        <Stack.Screen name="owner/add-venue" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
