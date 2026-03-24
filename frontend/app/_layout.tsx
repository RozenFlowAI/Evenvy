import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { colors } from '../src/constants/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { loading } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure everything is mounted
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && appReady) {
      // Hide splash screen
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading, appReady]);

  // Show a loading indicator while auth is loading
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
