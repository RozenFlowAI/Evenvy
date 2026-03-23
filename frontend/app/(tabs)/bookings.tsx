import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, authHeaders, Quote, EVENT_TYPE_LABELS } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  pending: { color: colors.warning, label: 'În așteptare', icon: 'time' },
  responded: { color: colors.success, label: 'Răspuns primit', icon: 'checkmark-circle' },
  rejected: { color: colors.error, label: 'Refuzat', icon: 'close-circle' },
};

export default function MyQuotesScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuotes = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiCall('/quotes/mine', { headers: authHeaders(token) });
      setQuotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Cererile Mele</Text>
        </View>
        <View style={styles.authPrompt}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.authTitle}>Autentifică-te</Text>
          <Text style={styles.authText}>Pentru a vedea cererile tale de ofertă</Text>
          <TouchableOpacity style={styles.authBtn} onPress={() => router.push('/auth')}>
            <Text style={styles.authBtnText}>Conectează-te</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderQuote = ({ item }: { item: Quote }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    
    return (
      <TouchableOpacity
        style={styles.quoteCard}
        testID={`my-quote-${item.id}`}
        onPress={() => router.push(`/venue/${item.venue_id}`)}
        activeOpacity={0.9}
      >
        {/* Venue Image */}
        {item.venue_image ? (
          <Image source={{ uri: item.venue_image }} style={styles.venueImage} />
        ) : (
          <View style={[styles.venueImage, styles.placeholderImage]}>
            <Ionicons name="business" size={24} color={colors.textTertiary} />
          </View>
        )}
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Ionicons name={status.icon as any} size={12} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        
        <View style={styles.quoteInfo}>
          <Text style={styles.venueName} numberOfLines={1}>{item.venue_name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={colors.textTertiary} />
            <Text style={styles.locationText}>{item.venue_city}</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={14} color={colors.primary} />
              <Text style={styles.detailText}>{item.event_date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people" size={14} color={colors.primary} />
              <Text style={styles.detailText}>{item.guest_count} invitați</Text>
            </View>
          </View>
          
          <View style={styles.eventTypeRow}>
            <View style={styles.eventTypeBadge}>
              <Text style={styles.eventTypeText}>
                {EVENT_TYPE_LABELS[item.event_type] || item.event_type}
              </Text>
            </View>
          </View>
          
          {item.message && (
            <Text style={styles.message} numberOfLines={2}>"{item.message}"</Text>
          )}
          
          <Text style={styles.dateCreated}>
            Trimis: {new Date(item.created_at).toLocaleDateString('ro-RO')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cererile Mele</Text>
      </View>

      {loading ? (
        <ActivityIndicator testID="quotes-loading" size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          testID="quotes-list"
          data={quotes}
          keyExtractor={(item) => item.id}
          renderItem={renderQuote}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadQuotes(); }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>Nicio cerere de ofertă</Text>
              <Text style={styles.emptyText}>
                Găsește locația perfectă și cere o ofertă personalizată de preț.
              </Text>
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Ionicons name="search" size={18} color={colors.background} />
                <Text style={styles.searchBtnText}>Caută locații</Text>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  // Auth prompt
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  authTitle: { ...typography.h2, color: colors.textPrimary },
  authText: { ...typography.bodyLg, color: colors.textSecondary, textAlign: 'center' },
  authBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  authBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
  // List
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  venueImage: { width: '100%', height: 140 },
  placeholderImage: {
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: { ...typography.caption, textTransform: 'capitalize', fontSize: 11 },
  quoteInfo: { padding: spacing.md },
  venueName: { ...typography.h3, color: colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { ...typography.bodySm, color: colors.textTertiary },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { ...typography.bodySm, color: colors.textSecondary },
  eventTypeRow: { marginTop: spacing.sm },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  eventTypeText: { ...typography.caption, color: colors.primary, textTransform: 'none' },
  message: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  dateCreated: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textTransform: 'none',
  },
  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  emptyText: { ...typography.bodyLg, color: colors.textTertiary, textAlign: 'center' },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  searchBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
});
