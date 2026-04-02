import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { apiCall, authHeaders, Quote, EVENT_TYPE_LABELS } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

export default function MyQuotesScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
    pending: { color: c.warning, label: 'În așteptare', icon: 'time' },
    responded: { color: c.success, label: 'Răspuns primit', icon: 'checkmark-circle' },
    rejected: { color: c.error, label: 'Refuzat', icon: 'close-circle' },
  };

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
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.textPrimary }]}>Cererile Mele</Text>
        </View>
        <View style={styles.authPrompt}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color={c.textTertiary} />
          <Text style={[styles.authTitle, { color: c.textPrimary }]}>Autentifică-te</Text>
          <Text style={[styles.authText, { color: c.textSecondary }]}>Pentru a vedea cererile tale de ofertă</Text>
          <TouchableOpacity style={[styles.authBtn, { backgroundColor: c.primary }]} onPress={() => router.push('/auth')}>
            <Text style={[styles.authBtnText, { color: c.background }]}>Conectează-te</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderQuote = ({ item }: { item: Quote }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    
    return (
      <TouchableOpacity
        style={[styles.quoteCard, { backgroundColor: c.surface, borderColor: c.border }]}
        testID={`my-quote-${item.id}`}
        onPress={() => router.push(`/venue/${item.venue_id}`)}
        activeOpacity={0.9}
      >
        {/* Venue Image */}
        {item.venue_image ? (
          <Image source={{ uri: item.venue_image }} style={styles.venueImage} />
        ) : (
          <View style={[styles.venueImage, styles.placeholderImage, { backgroundColor: c.surfaceHighlight }]}>
            <Ionicons name="business" size={24} color={c.textTertiary} />
          </View>
        )}
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Ionicons name={status.icon as any} size={12} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        
        <View style={styles.quoteInfo}>
          <Text style={[styles.venueName, { color: c.textPrimary }]} numberOfLines={1}>{item.venue_name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={c.textTertiary} />
            <Text style={[styles.locationText, { color: c.textTertiary }]}>{item.venue_city}</Text>
          </View>
          
          <View style={[styles.detailsRow, { borderTopColor: c.border }]}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={14} color={c.primary} />
              <Text style={[styles.detailText, { color: c.textSecondary }]}>{item.event_date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people" size={14} color={c.primary} />
              <Text style={[styles.detailText, { color: c.textSecondary }]}>{item.guest_count} invitați</Text>
            </View>
          </View>
          
          <View style={styles.eventTypeRow}>
            <View style={[styles.eventTypeBadge, { backgroundColor: c.primary + '20' }]}>
              <Text style={[styles.eventTypeText, { color: c.primary }]}>
                {EVENT_TYPE_LABELS[item.event_type] || item.event_type}
              </Text>
            </View>
          </View>
          
          {item.message && (
            <Text style={[styles.message, { color: c.textSecondary }]} numberOfLines={2}>"{item.message}"</Text>
          )}
          
          <Text style={[styles.dateCreated, { color: c.textTertiary }]}>
            Trimis: {new Date(item.created_at).toLocaleDateString('ro-RO')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.textPrimary }]}>Cererile Mele</Text>
      </View>

      {loading ? (
        <ActivityIndicator testID="quotes-loading" size="large" color={c.primary} style={{ flex: 1 }} />
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
              tintColor={c.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={c.textTertiary} />
              <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>Nicio cerere de ofertă</Text>
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>
                Găsește locația perfectă și cere o ofertă personalizată de preț.
              </Text>
              <TouchableOpacity
                style={[styles.searchBtn, { backgroundColor: c.primary }]}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Ionicons name="search" size={18} color={c.background} />
                <Text style={[styles.searchBtnText, { color: c.background }]}>Caută locații</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700' },
  // Auth prompt
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  authTitle: { fontSize: 22, fontWeight: '600' },
  authText: { fontSize: 16, textAlign: 'center' },
  authBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 16,
  },
  authBtnText: { fontSize: 16, fontWeight: '700' },
  // List
  listContent: { paddingHorizontal: 24, paddingBottom: 48 },
  quoteCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  venueImage: { width: '100%', height: 140 },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: '500', textTransform: 'capitalize' },
  quoteInfo: { padding: 16 },
  venueName: { fontSize: 18, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 14 },
  detailsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14 },
  eventTypeRow: { marginTop: 8 },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  eventTypeText: { fontSize: 12, fontWeight: '500' },
  message: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  dateCreated: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyText: { fontSize: 16, textAlign: 'center' },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 16,
  },
  searchBtnText: { fontSize: 16, fontWeight: '700' },
});
