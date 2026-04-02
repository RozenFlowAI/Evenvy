import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';

console.log('TabLayout loaded');

function TabIcon({ name, color, size }: { name: React.ComponentProps<typeof Ionicons>['name']; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  console.log('TabLayout rendering');
  const { theme } = useTheme();
  const c = theme.colors;
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Descoperă',
          tabBarIcon: ({ color, size }) => <TabIcon name="compass" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Caută',
          tabBarIcon: ({ color, size }) => <TabIcon name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Rezervări',
          tabBarIcon: ({ color, size }) => <TabIcon name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <TabIcon name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
