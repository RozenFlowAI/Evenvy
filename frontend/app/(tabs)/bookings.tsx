import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, authHeaders, EVENT_TYPE_LABELS } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

type Quote = {
  id: string; venue_name: string; venue_image: string; venue_city: string;
  event_type: string; event_date: string; guest_count: number;
  status: string; created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'În așteptare', color: colors.warning },
  responded: { label: 'Răspuns primit', color: colors.success },
  rejected: { label: 'Refuzat', color: colors.error },
};

export default function BookingsScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuotes = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const data = await apiCall('/quotes/mine', { headers: authHeaders(token) });
      setQuotes(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.authPrompt}>
          <Ionicons name="chatbubble-ellipses-outline" size={56} color={colors.textTertiary} />
          <Text style={styles.authTitle}>Cererile Tale</Text>
          <Text style={styles.authSubtext}>Autentifică-te pentru a vedea cererile de ofertă trimise</Text>
          <TouchableOpacity testID="bookings-login-btn" style={styles.loginBtn} onPress={() => router.push('/auth')}>
            <Text style={styles.loginBtnText}>Autentifică-te</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderQuote = ({ item }: { item: Quote }) => {
    const st = STATUS_MAP[item.status] || STATUS_MAP.pending;
    return (
      <TouchableOpacity testID={`quote-${item.id}`} style={styles.card} activeOpacity={0.9}>
        {item.venue_image ? (
          <Image source={{ uri: item.venue_image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, { backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="image-outline" size={24} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{item.venue_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: st.color + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: st.color }]} />
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>{EVENT_TYPE_LABELS[item.event_type] || item.event_type}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.event_date}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.guest_count} pers.</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cererile Mele</Text>
        <Text style={styles.subtitle}>{quotes.length} cereri trimise</Text>
      </View>
      {loading ? (
        <ActivityIndicator testID="bookings-loading" size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          testID="quotes-list"
          data={quotes}
          keyExtractor={(item) => item.id}
          renderItem={renderQuote}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadQuotes(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Nicio cerere trimisă</Text>
              <Text style={styles.emptySubtext}>Explorează locații și trimite prima cerere de ofertă</Text>
              <TouchableOpacity testID="explore-btn" style={styles.exploreBtn} onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.exploreBtnText}>Explorează locații</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  card: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg,
    overflow: 'hidden', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardImage: { width: 90, height: 100 },
  cardInfo: { flex: 1, padding: spacing.md, justifyContent: 'center', gap: 4 },
  cardName: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '600' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  metaText: { ...typography.caption, color: colors.textTertiary, textTransform: 'none' },
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  authTitle: { ...typography.h1, color: colors.textPrimary },
  authSubtext: { ...typography.bodyLg, color: colors.textSecondary, textAlign: 'center' },
  loginBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 14,
    borderRadius: radius.full, marginTop: spacing.md,
  },
  loginBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyText: { ...typography.h3, color: colors.textSecondary },
  emptySubtext: { ...typography.bodySm, color: colors.textTertiary, textAlign: 'center' },
  exploreBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 12,
    borderRadius: radius.full, marginTop: spacing.md,
  },
  exploreBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
});
