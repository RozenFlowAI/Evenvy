import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import LoyaltyProgress from '../../src/components/LoyaltyProgress';
import LoyaltyBadge from '../../src/components/LoyaltyBadge';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, themeName, toggleTheme, isDark } = useTheme();
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.radius;

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={styles.authPrompt}>
          <View style={[styles.logoCircle, { backgroundColor: c.surfaceHighlight, borderColor: c.primary }]}>
            <Ionicons name="diamond" size={40} color={c.primary} />
          </View>
          <Text style={[styles.appName, { color: c.textPrimary }]}>Evenvy</Text>
          <Text style={[styles.authSubtext, { color: c.textSecondary }]}>Marketplace-ul nr. 1 pentru locații de evenimente din România</Text>
          <TouchableOpacity testID="profile-login-btn" style={[styles.primaryBtn, { backgroundColor: c.primary }]} onPress={() => router.push('/auth')}>
            <Text style={styles.primaryBtnText}>Autentifică-te</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="profile-register-btn" style={[styles.secondaryBtn, { borderColor: c.primary }]} onPress={() => router.push('/auth')}>
            <Text style={[styles.secondaryBtnText, { color: c.primary }]}>Creează cont</Text>
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
    { icon: 'chatbubble-ellipses', label: 'Cererile Mele', route: '/(tabs)/bookings', testId: 'my-quotes-btn' },
    { icon: 'heart', label: 'Favorite', route: null, testId: 'favorites-btn' },
    { icon: 'notifications', label: 'Notificări', route: null, testId: 'notifications-btn' },
    { icon: 'help-circle', label: 'Ajutor', route: null, testId: 'help-btn' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.textPrimary }]}>Profil</Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.border }]} testID="user-profile-card">
          <View style={[styles.avatarCircle, { backgroundColor: c.primary }]}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: c.textPrimary }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: c.textSecondary }]}>{user.email}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.roleBadge, user.role === 'owner' ? { backgroundColor: c.primary + '20' } : { backgroundColor: c.surfaceHighlight }]}>
                <Ionicons 
                  name={user.role === 'owner' ? 'business' : 'person'} 
                  size={12} 
                  color={user.role === 'owner' ? c.primary : c.textSecondary} 
                />
                <Text style={[styles.roleText, user.role === 'owner' ? { color: c.primary } : { color: c.textSecondary }]}>
                  {user.role === 'owner' ? 'Proprietar' : 'Utilizator'}
                </Text>
              </View>
              {user.loyalty_tier && user.role === 'client' && (
                <LoyaltyBadge tierId={user.loyalty_tier.id} size="small" />
              )}
            </View>
          </View>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.themeSection, { marginHorizontal: s.lg }]}>
          <View style={[styles.themeCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.themeInfo}>
              <View style={[styles.themeIconWrap, { backgroundColor: isDark ? c.primary + '20' : c.surfaceHighlight }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? c.primary : '#F59E0B'} />
              </View>
              <View>
                <Text style={[styles.themeLabel, { color: c.textPrimary }]}>Temă aplicație</Text>
                <Text style={[styles.themeValue, { color: c.textSecondary }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E2E8F0', true: c.primary + '60' }}
              thumbColor={isDark ? c.primary : '#fff'}
            />
          </View>
        </View>

        {/* Loyalty Progress - Only for clients */}
        {user.role === 'client' && user.loyalty_tier && (
          <View style={[styles.loyaltySection, { marginHorizontal: s.lg }]}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Programul tău de loialitate</Text>
            <LoyaltyProgress
              currentTier={user.loyalty_tier}
              totalRequests={user.total_requests || 0}
            />
            <View style={[styles.loyaltyBenefits, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[styles.benefitsTitle, { color: c.textSecondary }]}>Beneficii nivel {user.loyalty_tier.name}:</Text>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={c.success} />
                <Text style={[styles.benefitText, { color: c.textSecondary }]}>
                  {user.loyalty_tier.discount > 0 
                    ? `${user.loyalty_tier.discount}% reducere la toate locațiile partenere`
                    : 'Acces la toate locațiile din platformă'}
                </Text>
              </View>
              {user.loyalty_tier.id !== 'bronze' && (
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={c.success} />
                  <Text style={[styles.benefitText, { color: c.textSecondary }]}>Badge de loialitate vizibil proprietarilor</Text>
                </View>
              )}
              {(user.loyalty_tier.id === 'aur' || user.loyalty_tier.id === 'platina') && (
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={c.success} />
                  <Text style={[styles.benefitText, { color: c.textSecondary }]}>Răspuns prioritar de la proprietari</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={[styles.menuSection, { marginHorizontal: s.lg }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              testID={item.testId}
              style={[styles.menuItem, { borderBottomColor: c.border }]}
              onPress={() => item.route 
                ? router.push(item.route as any) 
                : Alert.alert('În curând', 'Această funcție va fi disponibilă în curând.')}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrap, { backgroundColor: c.surfaceHighlight }]}>
                  <Ionicons name={item.icon as any} size={20} color={c.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: c.textPrimary }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Owner promo */}
        {user.role === 'client' && (
          <View style={[styles.ownerPromo, { backgroundColor: c.surface, borderColor: c.primary + '40', marginHorizontal: s.lg }]}>
            <Ionicons name="business" size={24} color={c.primary} />
            <View style={{ flex: 1, marginLeft: s.md }}>
              <Text style={[styles.ownerPromoTitle, { color: c.textPrimary }]}>Ai o locație de evenimente?</Text>
              <Text style={[styles.ownerPromoText, { color: c.textSecondary }]}>Înregistrează-te ca proprietar și începe să primești cereri de ofertă.</Text>
            </View>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity testID="logout-btn" style={[styles.logoutBtn, { borderColor: c.error + '40', marginHorizontal: s.lg }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={c.error} />
          <Text style={[styles.logoutText, { color: c.error }]}>Deconectare</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '700' },
  // Auth prompt
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  appName: { fontSize: 32, fontWeight: '700' },
  authSubtext: { fontSize: 16, textAlign: 'center' },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    width: '100%',
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 24,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '600' },
  userEmail: { fontSize: 14, marginTop: 2 },
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleText: { fontSize: 12 },
  // Theme section
  themeSection: { marginTop: 20 },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  themeLabel: { fontSize: 15, fontWeight: '600' },
  themeValue: { fontSize: 13, marginTop: 2 },
  // Loyalty Section
  loyaltySection: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  loyaltyBenefits: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  benefitsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  benefitText: { fontSize: 14, flex: 1 },
  // Menu
  menuSection: { marginTop: 24 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 16 },
  // Owner promo
  ownerPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  ownerPromoTitle: { fontSize: 15, fontWeight: '600' },
  ownerPromoText: { fontSize: 13, marginTop: 2 },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
});
