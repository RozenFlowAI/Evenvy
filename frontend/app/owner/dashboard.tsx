import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, authHeaders } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

type Stats = {
  total_venues: number;
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
};

type Booking = {
  id: string;
  user_name: string;
  user_email: string;
  venue_name: string;
  event_date: string;
  guest_count: number;
  event_type: string;
  message: string;
  status: string;
};

type Venue = {
  id: string;
  name: string;
  location: string;
  status: string;
  avg_rating: number;
  booking_count: number;
  price_per_event: number;
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  confirmed: colors.success,
  rejected: colors.error,
};

export default function OwnerDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'venues'>('bookings');

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const headers = authHeaders(token);
      const [statsData, bookingsData, venuesData] = await Promise.all([
        apiCall('/stats/owner', { headers }),
        apiCall('/bookings/owner', { headers }),
        apiCall('/venues/owner/mine', { headers }),
      ]);
      setStats(statsData);
      setBookings(bookingsData);
      setVenues(venuesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    if (!token) return;
    try {
      await apiCall(`/bookings/${bookingId}/status?status=${status}`, {
        method: 'PUT',
        headers: authHeaders(token),
      });
      loadData();
    } catch (e: any) {
      Alert.alert('Eroare', e.message);
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
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
              <Text style={styles.statNumber}>{stats.total_bookings}</Text>
              <Text style={styles.statLabel}>Total Rezervări</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
              <Text style={styles.statNumber}>{stats.pending_bookings}</Text>
              <Text style={styles.statLabel}>În Așteptare</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
              <Text style={styles.statNumber}>{stats.confirmed_bookings}</Text>
              <Text style={styles.statLabel}>Confirmate</Text>
            </View>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            testID="tab-bookings"
            style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>Rezervări</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="tab-venues"
            style={[styles.tab, activeTab === 'venues' && styles.tabActive]}
            onPress={() => setActiveTab('venues')}
          >
            <Text style={[styles.tabText, activeTab === 'venues' && styles.tabTextActive]}>Locații</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'bookings' ? (
          <View style={styles.listSection}>
            {bookings.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>Nicio rezervare</Text>
              </View>
            ) : (
              bookings.map((booking) => (
                <View key={booking.id} style={styles.bookingCard} testID={`owner-booking-${booking.id}`}>
                  <View style={styles.bookingHeader}>
                    <View>
                      <Text style={styles.bookingVenue}>{booking.venue_name}</Text>
                      <Text style={styles.bookingUser}>{booking.user_name} • {booking.user_email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[booking.status] + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[booking.status] }]}>
                        {booking.status === 'pending' ? 'Așteptare' : booking.status === 'confirmed' ? 'Confirmat' : 'Refuzat'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={14} color={colors.textTertiary} />
                      <Text style={styles.detailText}>{booking.event_date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="people" size={14} color={colors.textTertiary} />
                      <Text style={styles.detailText}>{booking.guest_count} invitați</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="pricetag" size={14} color={colors.textTertiary} />
                      <Text style={styles.detailText}>{booking.event_type}</Text>
                    </View>
                  </View>
                  {booking.message ? (
                    <Text style={styles.bookingMessage}>"{booking.message}"</Text>
                  ) : null}
                  {booking.status === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        testID={`confirm-booking-${booking.id}`}
                        style={styles.confirmBtn}
                        onPress={() => updateBookingStatus(booking.id, 'confirmed')}
                      >
                        <Ionicons name="checkmark" size={16} color={colors.background} />
                        <Text style={styles.confirmBtnText}>Confirmă</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        testID={`reject-booking-${booking.id}`}
                        style={styles.rejectBtn}
                        onPress={() => updateBookingStatus(booking.id, 'rejected')}
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
              </View>
            ) : (
              venues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  testID={`owner-venue-${venue.id}`}
                  style={styles.venueCard}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                >
                  <View style={styles.venueMain}>
                    <Text style={styles.venueCardName}>{venue.name}</Text>
                    <Text style={styles.venueCardLocation}>{venue.location}</Text>
                    <View style={styles.venueStats}>
                      <Text style={styles.venueStat}>
                        <Ionicons name="star" size={12} color={colors.primary} /> {venue.avg_rating}
                      </Text>
                      <Text style={styles.venueStat}>
                        <Ionicons name="calendar" size={12} color={colors.textTertiary} /> {venue.booking_count} rez.
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.venueCardPrice}>{venue.price_per_event} €</Text>
                </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg,
    gap: spacing.sm, marginTop: spacing.md,
  },
  statCard: {
    width: '48%', flexGrow: 1, padding: spacing.md, borderRadius: radius.lg, alignItems: 'center',
  },
  statNumber: { ...typography.h1, color: colors.textPrimary },
  statLabel: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.background, fontWeight: '700' },
  listSection: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  empty: { alignItems: 'center', paddingTop: 40, gap: spacing.sm },
  emptyText: { ...typography.bodyLg, color: colors.textTertiary },
  bookingCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingVenue: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '600' },
  bookingUser: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  statusText: { ...typography.caption, textTransform: 'capitalize' },
  bookingDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { ...typography.bodySm, color: colors.textTertiary },
  bookingMessage: { ...typography.bodySm, color: colors.textSecondary, fontStyle: 'italic', marginTop: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: colors.success, paddingVertical: 10, borderRadius: radius.full,
  },
  confirmBtnText: { ...typography.bodySm, color: colors.background, fontWeight: '700' },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.error, paddingVertical: 10, borderRadius: radius.full,
  },
  rejectBtnText: { ...typography.bodySm, color: colors.error, fontWeight: '600' },
  venueCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  venueMain: { flex: 1 },
  venueCardName: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '600' },
  venueCardLocation: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  venueStats: { flexDirection: 'row', gap: spacing.md, marginTop: 4 },
  venueStat: { ...typography.bodySm, color: colors.textTertiary },
  venueCardPrice: { ...typography.h3, color: colors.primary },
});
