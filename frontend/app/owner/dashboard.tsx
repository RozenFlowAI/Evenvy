import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
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

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  responded: colors.success,
  rejected: colors.error,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'În așteptare',
  responded: 'Răspuns',
  rejected: 'Refuzat',
};

const PROMOTION_PACKAGES = [
  { id: 'bronze', name: 'Pachet Bronze', days: 7, price: 49, desc: 'Poziție îmbunătățită în rezultate', badge: null },
  { id: 'silver', name: 'Pachet Silver', days: 14, price: 89, desc: 'Top în căutări + badge "Promovat"', badge: 'Promovat' },
  { id: 'gold', name: 'Pachet Gold', days: 30, price: 149, desc: 'Banner pe homepage + toate beneficiile', badge: 'Top Promovat' },
];

export default function OwnerDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'quotes' | 'venues'>('quotes');
  const [promoteModal, setPromoteModal] = useState<{ visible: boolean; venueId: string | null }>({ visible: false, venueId: null });
  const [promoting, setPromoting] = useState(false);

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

  const purchasePromotion = async (packageId: string) => {
    if (!token || !promoteModal.venueId) return;
    setPromoting(true);
    try {
      await apiCall(`/venues/${promoteModal.venueId}/promote`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ venue_id: promoteModal.venueId, package: packageId }),
      });
      Alert.alert('Succes!', 'Promovarea a fost activată cu succes.');
      setPromoteModal({ visible: false, venueId: null });
      loadData();
    } catch (e: any) {
      Alert.alert('Eroare', e.message);
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator testID="owner-loading" size="large" color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity testID="owner-back-btn" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity testID="add-venue-btn-dashboard" onPress={() => router.push('/owner/add-venue')}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
              <Text style={styles.statNumber}>{stats.total_venues}</Text>
              <Text style={styles.statLabel}>Locații</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.info + '15' }]}>
              <Text style={styles.statNumber}>{stats.total_quotes}</Text>
              <Text style={styles.statLabel}>Cereri totale</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
              <Text style={styles.statNumber}>{stats.pending_quotes}</Text>
              <Text style={styles.statLabel}>În așteptare</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
              <Text style={styles.statNumber}>{stats.total_views}</Text>
              <Text style={styles.statLabel}>Vizualizări</Text>
            </View>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            testID="tab-quotes"
            style={[styles.tab, activeTab === 'quotes' && styles.tabActive]}
            onPress={() => setActiveTab('quotes')}
          >
            <Text style={[styles.tabText, activeTab === 'quotes' && styles.tabTextActive]}>
              Cereri de ofertă
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="tab-venues"
            style={[styles.tab, activeTab === 'venues' && styles.tabActive]}
            onPress={() => setActiveTab('venues')}
          >
            <Text style={[styles.tabText, activeTab === 'venues' && styles.tabTextActive]}>
              Locațiile mele
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'quotes' ? (
          <View style={styles.listSection}>
            {quotes.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>Nicio cerere de ofertă</Text>
                <Text style={styles.emptySubtext}>Cererile clienților vor apărea aici</Text>
              </View>
            ) : (
              quotes.map((quote) => (
                <View key={quote.id} style={styles.quoteCard} testID={`owner-quote-${quote.id}`}>
                  <View style={styles.quoteHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quoterName}>{quote.client_name}</Text>
                      <View style={styles.loyaltyRow}>
                        <LoyaltyBadge tierId={quote.client_loyalty_tier} size="small" />
                        {quote.client_discount > 0 && (
                          <Text style={styles.discountText}>-{quote.client_discount}%</Text>
                        )}
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[quote.status] + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[quote.status] }]}>
                        {STATUS_LABELS[quote.status]}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.quoteVenue}>{quote.venue_name}</Text>
                  
                  <View style={styles.quoteDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={14} color={colors.textTertiary} />
                      <Text style={styles.detailText}>{quote.event_date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="people" size={14} color={colors.textTertiary} />
                      <Text style={styles.detailText}>{quote.guest_count} invitați</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="pricetag" size={14} color={colors.textTertiary} />
                      <Text style={styles.detailText}>{quote.event_type}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.contactInfo}>
                    <Ionicons name="mail" size={14} color={colors.primary} />
                    <Text style={styles.contactText}>{quote.client_email}</Text>
                    {quote.client_phone && (
                      <>
                        <Ionicons name="call" size={14} color={colors.primary} style={{ marginLeft: spacing.md }} />
                        <Text style={styles.contactText}>{quote.client_phone}</Text>
                      </>
                    )}
                  </View>
                  
                  {quote.message ? (
                    <Text style={styles.quoteMessage}>"{quote.message}"</Text>
                  ) : null}
                  
                  {quote.status === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        testID={`respond-quote-${quote.id}`}
                        style={styles.respondBtn}
                        onPress={() => updateQuoteStatus(quote.id, 'responded')}
                      >
                        <Ionicons name="checkmark" size={16} color={colors.background} />
                        <Text style={styles.respondBtnText}>Am răspuns</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        testID={`reject-quote-${quote.id}`}
                        style={styles.rejectBtn}
                        onPress={() => updateQuoteStatus(quote.id, 'rejected')}
                      >
                        <Ionicons name="close" size={16} color={colors.error} />
                        <Text style={styles.rejectBtnText}>Refuză</Text>
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
                <Ionicons name="business-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>Nicio locație adăugată</Text>
                <TouchableOpacity
                  style={styles.addVenueBtn}
                  onPress={() => router.push('/owner/add-venue')}
                >
                  <Text style={styles.addVenueBtnText}>Adaugă prima ta locație</Text>
                </TouchableOpacity>
              </View>
            ) : (
              venues.map((venue) => (
                <View key={venue.id} style={styles.venueCard} testID={`owner-venue-${venue.id}`}>
                  <TouchableOpacity
                    style={styles.venueMain}
                    onPress={() => router.push(`/venue/${venue.id}`)}
                  >
                    <Text style={styles.venueCardName}>{venue.name}</Text>
                    <Text style={styles.venueCardCity}>{venue.city}</Text>
                    <View style={styles.venueStats}>
                      <View style={styles.venueStat}>
                        <Ionicons name="star" size={12} color={colors.primary} />
                        <Text style={styles.venueStatText}>{venue.avg_rating || '—'}</Text>
                      </View>
                      <View style={styles.venueStat}>
                        <Ionicons name="chatbubble" size={12} color={colors.textTertiary} />
                        <Text style={styles.venueStatText}>{venue.quote_count} cereri</Text>
                      </View>
                    </View>
                    {venue.active_promotion && (
                      <View style={styles.activePromo}>
                        <Ionicons name="flash" size={12} color={colors.warning} />
                        <Text style={styles.activePromoText}>{venue.active_promotion.name} activ</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.promoteBtn}
                    onPress={() => setPromoteModal({ visible: true, venueId: venue.id })}
                  >
                    <Ionicons name="rocket" size={18} color={colors.primary} />
                    <Text style={styles.promoteBtnText}>Promovează</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Promotion Modal */}
      <Modal visible={promoteModal.visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pachete de promovare</Text>
              <TouchableOpacity onPress={() => setPromoteModal({ visible: false, venueId: null })}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Crește vizibilitatea locației tale și primește mai multe cereri de ofertă.
            </Text>
            {PROMOTION_PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => purchasePromotion(pkg.id)}
                disabled={promoting}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    {pkg.badge && (
                      <View style={[styles.packageBadge, { backgroundColor: pkg.id === 'gold' ? colors.error : colors.warning }]}>
                        <Text style={styles.packageBadgeText}>{pkg.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.packageDesc}>{pkg.desc}</Text>
                  <Text style={styles.packageDays}>{pkg.days} zile</Text>
                </View>
                <View style={styles.packagePrice}>
                  <Text style={styles.priceValue}>€{pkg.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  statNumber: { ...typography.h1, color: colors.textPrimary },
  statLabel: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.background, fontWeight: '700' },
  listSection: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  empty: { alignItems: 'center', paddingTop: 40, gap: spacing.sm },
  emptyText: { ...typography.h3, color: colors.textSecondary },
  emptySubtext: { ...typography.bodySm, color: colors.textTertiary },
  addVenueBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  addVenueBtnText: { ...typography.bodySm, color: colors.background, fontWeight: '700' },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  quoterName: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '700' },
  loyaltyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  discountText: { ...typography.caption, color: colors.success, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  statusText: { ...typography.caption, textTransform: 'capitalize' },
  quoteVenue: { ...typography.bodySm, color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  quoteDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { ...typography.bodySm, color: colors.textTertiary },
  contactInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, flexWrap: 'wrap' },
  contactText: { ...typography.bodySm, color: colors.textSecondary },
  quoteMessage: { ...typography.bodySm, color: colors.textSecondary, fontStyle: 'italic', marginTop: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  respondBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  respondBtnText: { ...typography.bodySm, color: colors.background, fontWeight: '700' },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  rejectBtnText: { ...typography.bodySm, color: colors.error, fontWeight: '600' },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  venueMain: { flex: 1 },
  venueCardName: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '600' },
  venueCardCity: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  venueStats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  venueStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  venueStatText: { ...typography.bodySm, color: colors.textTertiary },
  activePromo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  activePromoText: { ...typography.caption, color: colors.warning, textTransform: 'none' },
  promoteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: radius.lg,
  },
  promoteBtnText: { ...typography.caption, color: colors.primary, textTransform: 'none' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: { ...typography.h2, color: colors.textPrimary },
  modalDesc: { ...typography.bodySm, color: colors.textSecondary, marginBottom: spacing.lg },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packageHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  packageName: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '700' },
  packageBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  packageBadgeText: { ...typography.caption, color: '#fff', textTransform: 'none', fontSize: 10 },
  packageDesc: { ...typography.bodySm, color: colors.textSecondary, marginTop: 4 },
  packageDays: { ...typography.caption, color: colors.textTertiary, marginTop: 4, textTransform: 'none' },
  packagePrice: { alignItems: 'center' },
  priceValue: { ...typography.h2, color: colors.primary },
});
