import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.authPrompt}>
          <View style={styles.logoCircle}>
            <Ionicons name="diamond" size={40} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Lumina</Text>
          <Text style={styles.authSubtext}>Locații curate pentru nopți de neuitat</Text>
          <TouchableOpacity testID="profile-login-btn" style={styles.primaryBtn} onPress={() => router.push('/auth')}>
            <Text style={styles.primaryBtnText}>Autentifică-te</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="profile-register-btn" style={styles.secondaryBtn} onPress={() => router.push('/auth')}>
            <Text style={styles.secondaryBtnText}>Creează cont</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert('Deconectare', 'Ești sigur că vrei să te deconectezi?', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Da', onPress: logout },
    ]);
  };

  const menuItems = [
    ...(user.role === 'owner' ? [
      { icon: 'business', label: 'Dashboard Proprietar', route: '/owner/dashboard', testId: 'owner-dashboard-btn' },
      { icon: 'add-circle', label: 'Adaugă Locație', route: '/owner/add-venue', testId: 'add-venue-btn' },
    ] : []),
    { icon: 'calendar', label: 'Rezervările Mele', route: '/(tabs)/bookings', testId: 'my-bookings-btn' },
    { icon: 'heart', label: 'Favorite', route: null, testId: 'favorites-btn' },
    { icon: 'notifications', label: 'Notificări', route: null, testId: 'notifications-btn' },
    { icon: 'help-circle', label: 'Ajutor', route: null, testId: 'help-btn' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard} testID="user-profile-card">
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user.role === 'owner' ? 'Proprietar' : 'Utilizator'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              testID={item.testId}
              style={styles.menuItem}
              onPress={() => item.route ? router.push(item.route as any) : Alert.alert('În curând', 'Această funcție va fi disponibilă în curând.')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity testID="logout-btn" style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Deconectare</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary },
  // Auth prompt
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surfaceHighlight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary,
  },
  appName: { ...typography.display, color: colors.textPrimary },
  authSubtext: { ...typography.bodyLg, color: colors.textSecondary, textAlign: 'center' },
  primaryBtn: {
    width: '100%', backgroundColor: colors.primary, paddingVertical: 16,
    borderRadius: radius.full, alignItems: 'center', marginTop: spacing.md,
  },
  primaryBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
  secondaryBtn: {
    width: '100%', borderWidth: 1, borderColor: colors.primary, paddingVertical: 16,
    borderRadius: radius.full, alignItems: 'center',
  },
  secondaryBtnText: { ...typography.bodyLg, color: colors.primary, fontWeight: '600' },
  // User Card
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.lg,
    marginTop: spacing.md, backgroundColor: colors.surface, padding: spacing.lg,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.background },
  userInfo: { flex: 1 },
  userName: { ...typography.h3, color: colors.textPrimary },
  userEmail: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start', marginTop: 6, backgroundColor: colors.primary + '20',
    paddingHorizontal: 10, paddingVertical: 2, borderRadius: radius.full,
  },
  roleText: { ...typography.caption, color: colors.primary },
  // Menu
  menuSection: { marginTop: spacing.lg, marginHorizontal: spacing.lg },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { ...typography.bodyLg, color: colors.textPrimary },
  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginTop: spacing.xl, paddingVertical: 14,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.error + '40',
  },
  logoutText: { ...typography.bodyLg, color: colors.error, fontWeight: '600' },
});
