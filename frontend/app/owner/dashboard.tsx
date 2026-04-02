import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { apiCall, authHeaders, Quote, Venue, LOYALTY_TIERS } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';
import LoyaltyBadge from '../../src/components/LoyaltyBadge';

type Stats = {
  total_venues: number;
  total_quotes: number;
  pending_quotes: number;
  responded_quotes: number;
  total_views: number;
};

// FREE PERIOD - No paid promotions for 3 months
const FREE_PERIOD_END = new Date('2025-09-01');

export default function OwnerDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  
  const STATUS_COLORS: Record<string, string> = {
    pending: c.warning,
    responded: c.success,
    rejected: c.error,
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: 'În așteptare',
    responded: 'Răspuns',
    rejected: 'Refuzat',
  };
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'quotes' | 'venues'>('quotes');

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const headers = authHeaders(token);
      const [statsData, quotesData, venuesData] = await Promise.all([
        apiCall('/stats/owner', { headers }),
        apiCall('/quotes/owner', { headers }),
        apiCall('/venues/owner/mine', { headers }),
      ]);
      setStats(statsData);
      setQuotes(quotesData);
      setVenues(venuesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    if (!token) return;
    try {
      await apiCall(`/quotes/${quoteId}/status?status=${status}`, {
        method: 'PUT',
        headers: authHeaders(token),
      });
      loadData();
    } catch (e: any) {
      Alert.alert('Eroare', e.message);
    }
  };

  // Format remaining free days
  const getFreeDaysRemaining = () => {
    const now = new Date();
    const diff = FREE_PERIOD_END.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <ActivityIndicator testID="owner-loading" size="large" color={c.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={c.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity testID="owner-back-btn" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={c.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: c.textPrimary }]}>Dashboard</Text>
          <TouchableOpacity testID="add-venue-btn-dashboard" onPress={() => router.push('/owner/add-venue')}>
            <Ionicons name="add-circle" size={28} color={c.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: c.primary + '15' }]}>
              <Text style={[styles.statNumber, { color: c.textPrimary }]}>{stats.total_venues}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>Locații</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: c.info + '15' }]}>
              <Text style={[styles.statNumber, { color: c.textPrimary }]}>{stats.total_quotes}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>Cereri totale</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: c.warning + '15' }]}>
              <Text style={[styles.statNumber, { color: c.textPrimary }]}>{stats.pending_quotes}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>În așteptare</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: c.success + '15' }]}>
              <Text style={[styles.statNumber, { color: c.textPrimary }]}>{stats.total_views}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>Vizualizări</Text>
            </View>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={[styles.tabRow, { backgroundColor: c.surface }]}>
          <TouchableOpacity
            testID="tab-quotes"
            style={[styles.tab, activeTab === 'quotes' && { backgroundColor: c.primary }]}
            onPress={() => setActiveTab('quotes')}
          >
            <Text style={[styles.tabText, { color: c.textSecondary }, activeTab === 'quotes' && { color: c.background, fontWeight: '700' }]}>
              Cereri de ofertă
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="tab-venues"
            style={[styles.tab, activeTab === 'venues' && { backgroundColor: c.primary }]}
            onPress={() => setActiveTab('venues')}
          >
            <Text style={[styles.tabText, { color: c.textSecondary }, activeTab === 'venues' && { color: c.background, fontWeight: '700' }]}>
              Locațiile mele
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'quotes' ? (
          <View style={styles.listSection}>
            {quotes.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={c.textTertiary} />
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nicio cerere de ofertă</Text>
                <Text style={[styles.emptySubtext, { color: c.textTertiary }]}>Cererile clienților vor apărea aici</Text>
              </View>
            ) : (
              quotes.map((quote) => (
                <View key={quote.id} style={[styles.quoteCard, { backgroundColor: c.surface, borderColor: c.border }]} testID={`owner-quote-${quote.id}`}>
                  <View style={styles.quoteHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.quoterName, { color: c.textPrimary }]}>{quote.client_name}</Text>
                      <View style={styles.loyaltyRow}>
                        <LoyaltyBadge tierId={quote.client_loyalty_tier} size="small" />
                        {quote.client_discount > 0 && (
                          <Text style={[styles.discountText, { color: c.success }]}>-{quote.client_discount}%</Text>
                        )}
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[quote.status] + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[quote.status] }]}>
                        {STATUS_LABELS[quote.status]}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.quoteVenue, { color: c.primary }]}>{quote.venue_name}</Text>
                  
                  <View style={styles.quoteDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={14} color={c.textTertiary} />
                      <Text style={[styles.detailText, { color: c.textTertiary }]}>{quote.event_date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="people" size={14} color={c.textTertiary} />
                      <Text style={[styles.detailText, { color: c.textTertiary }]}>{quote.guest_count} invitați</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="pricetag" size={14} color={c.textTertiary} />
                      <Text style={[styles.detailText, { color: c.textTertiary }]}>{quote.event_type}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.contactInfo}>
                    <Ionicons name="mail" size={14} color={c.primary} />
                    <Text style={[styles.contactText, { color: c.textSecondary }]}>{quote.client_email}</Text>
                    {quote.client_phone && (
                      <>
                        <Ionicons name="call" size={14} color={c.primary} style={{ marginLeft: 16 }} />
                        <Text style={[styles.contactText, { color: c.textSecondary }]}>{quote.client_phone}</Text>
                      </>
                    )}
                  </View>
                  
                  {quote.message ? (
                    <Text style={[styles.quoteMessage, { color: c.textSecondary }]}>"{quote.message}"</Text>
                  ) : null}
                  
                  {quote.status === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        testID={`respond-quote-${quote.id}`}
                        style={[styles.respondBtn, { backgroundColor: c.success }]}
                        onPress={() => updateQuoteStatus(quote.id, 'responded')}
                      >
                        <Ionicons name="checkmark" size={16} color={c.background} />
                        <Text style={[styles.respondBtnText, { color: c.background }]}>Am răspuns</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        testID={`reject-quote-${quote.id}`}
                        style={[styles.rejectBtn, { borderColor: c.error }]}
                        onPress={() => updateQuoteStatus(quote.id, 'rejected')}
                      >
                        <Ionicons name="close" size={16} color={c.error} />
                        <Text style={[styles.rejectBtnText, { color: c.error }]}>Refuză</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.listSection}>
            {venues.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="business-outline" size={48} color={c.textTertiary} />
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nicio locație adăugată</Text>
                <TouchableOpacity
                  style={[styles.addVenueBtn, { backgroundColor: c.primary }]}
                  onPress={() => router.push('/owner/add-venue')}
                >
                  <Text style={[styles.addVenueBtnText, { color: c.background }]}>Adaugă prima ta locație</Text>
                </TouchableOpacity>
              </View>
            ) : (
              venues.map((venue) => (
                <View key={venue.id} style={[styles.venueCard, { backgroundColor: c.surface, borderColor: c.border }]} testID={`owner-venue-${venue.id}`}>
                  <TouchableOpacity
                    style={styles.venueMain}
                    onPress={() => router.push(`/venue/${venue.id}`)}
                  >
                    <Text style={[styles.venueCardName, { color: c.textPrimary }]}>{venue.name}</Text>
                    <Text style={[styles.venueCardCity, { color: c.textSecondary }]}>{venue.city}</Text>
                    <View style={styles.venueStats}>
                      <View style={styles.venueStat}>
                        <Ionicons name="star" size={12} color={c.primary} />
                        <Text style={[styles.venueStatText, { color: c.textTertiary }]}>{venue.avg_rating || '—'}</Text>
                      </View>
                      <View style={styles.venueStat}>
                        <Ionicons name="chatbubble" size={12} color={c.textTertiary} />
                        <Text style={[styles.venueStatText, { color: c.textTertiary }]}>{venue.quote_count} cereri</Text>
                      </View>
                    </View>
                    {venue.active_promotion && (
                      <View style={[styles.activePromo, { backgroundColor: c.warning + '20' }]}>
                        <Ionicons name="flash" size={12} color={c.warning} />
                        <Text style={[styles.activePromoText, { color: c.warning }]}>{venue.active_promotion.name} activ</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {/* Free period badge - no paid promotions */}
                  <View style={[styles.freeBadge, { backgroundColor: c.success + '15' }]}>
                    <Ionicons name="gift" size={16} color={c.success} />
                    <Text style={[styles.freeBadgeText, { color: c.success }]}>
                      Gratuit
                    </Text>
                    <Text style={[styles.freeBadgeDays, { color: c.textTertiary }]}>
                      {getFreeDaysRemaining()} zile
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 8,
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: { fontSize: 26, fontWeight: '700' },
  statLabel: { fontSize: 14, marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  listSection: { paddingHorizontal: 24, marginTop: 16 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 14 },
  addVenueBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 16,
  },
  addVenueBtnText: { fontSize: 14, fontWeight: '700' },
  quoteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  quoterName: { fontSize: 16, fontWeight: '700' },
  loyaltyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  discountText: { fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 12, textTransform: 'capitalize' },
  quoteVenue: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  quoteDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 14 },
  contactInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, flexWrap: 'wrap' },
  contactText: { fontSize: 14 },
  quoteMessage: { fontSize: 14, fontStyle: 'italic', marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  respondBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 999,
  },
  respondBtnText: { fontSize: 14, fontWeight: '700' },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 999,
  },
  rejectBtnText: { fontSize: 14, fontWeight: '600' },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  venueMain: { flex: 1 },
  venueCardName: { fontSize: 16, fontWeight: '600' },
  venueCardCity: { fontSize: 14, marginTop: 2 },
  venueStats: { flexDirection: 'row', gap: 16, marginTop: 4 },
  venueStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  venueStatText: { fontSize: 14 },
  activePromo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  activePromoText: { fontSize: 12 },
  // Free period badge
  freeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 2,
  },
  freeBadgeText: { fontSize: 12, fontWeight: '700' },
  freeBadgeDays: { fontSize: 10 },
});
