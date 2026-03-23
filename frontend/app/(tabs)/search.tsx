import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  TextInput, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, EVENT_TYPE_LABELS, Venue } from '../../src/utils/api';
import VenueBadges from '../../src/components/VenueBadges';

const EVENT_TYPES = [
  { id: '', label: 'Toate' },
  ...Object.entries(EVENT_TYPE_LABELS).map(([id, label]) => ({ id, label })),
];

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recomandate' },
  { id: 'newest', label: 'Cele mai noi' },
  { id: 'price_asc', label: 'Preț crescător' },
  { id: 'price_desc', label: 'Preț descrescător' },
  { id: 'rating', label: 'Rating' },
  { id: 'capacity', label: 'Capacitate' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ event_type?: string }>();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState(params.event_type || '');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (search) qp.append('search', search);
      if (eventType) qp.append('event_type', eventType);
      qp.append('sort_by', sortBy);
      const data = await apiCall(`/venues?${qp.toString()}`);
      setVenues(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, eventType, sortBy]);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);
  useEffect(() => { if (params.event_type) setEventType(params.event_type); }, [params.event_type]);

  const renderVenue = ({ item }: { item: Venue }) => (
    <TouchableOpacity
      testID={`search-venue-${item.id}`}
      style={styles.venueCard}
      onPress={() => router.push(`/venue/${item.id}`)}
      activeOpacity={0.9}
    >
      {item.images && item.images[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.venueImage} />
      ) : (
        <View style={[styles.venueImage, styles.placeholder]}>
          <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
        </View>
      )}
      
      {/* Tags overlay */}
      {item.style_tags && item.style_tags.length > 0 && (
        <View style={styles.tagsOverlay}>
          {item.style_tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Commission/Promotion badge */}
      {(item.commission_badge || item.promotion_badge) && (
        <VenueBadges
          commissionBadge={item.commission_badge}
          promotionBadge={item.promotion_badge}
          style={styles.venueBadge}
        />
      )}
      
      <View style={styles.venueInfo}>
        <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={colors.textSecondary} />
          <Text style={styles.locationText}>{item.city}</Text>
          {item.avg_rating > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={colors.primary} />
              <Text style={styles.ratingText}>{item.avg_rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.capacityText}>{item.capacity_min}-{item.capacity_max} persoane</Text>
          <Text style={styles.priceText}>
            {item.price_type === 'fixed' && item.price_per_person
              ? `de la €${item.price_per_person}/pers.`
              : 'Cere ofertă'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Caută Locații</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <TextInput
              testID="search-input"
              style={styles.input}
              placeholder="Nume, oraș..."
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={fetchVenues}
              returnKeyType="search"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')} testID="clear-search">
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity testID="filter-btn" style={styles.filterBtn} onPress={() => setShowFilters(true)}>
            <Ionicons name="options" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        horizontal
        data={EVENT_TYPES}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        keyExtractor={(item) => item.id || 'all'}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`filter-type-${item.id || 'all'}`}
            style={[styles.chip, eventType === item.id && styles.chipActive]}
            onPress={() => setEventType(item.id)}
          >
            <Text style={[styles.chipText, eventType === item.id && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator testID="search-loading" size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          testID="venue-list"
          data={venues}
          keyExtractor={(item) => item.id}
          renderItem={renderVenue}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Nicio locație găsită</Text>
              <Text style={styles.emptySubtext}>
                Proprietarii nu au publicat încă locații{eventType ? ' pentru acest tip de eveniment' : ''}.
              </Text>
            </View>
          }
        />
      )}

      {/* Sort Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sortare</Text>
              <TouchableOpacity testID="close-filters" onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                testID={`sort-${opt.id}`}
                style={[styles.sortOption, sortBy === opt.id && styles.sortOptionActive]}
                onPress={() => setSortBy(opt.id)}
              >
                <Text style={[styles.sortText, sortBy === opt.id && styles.sortTextActive]}>
                  {opt.label}
                </Text>
                {sortBy === opt.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              testID="apply-filters"
              style={styles.applyBtn}
              onPress={() => { setShowFilters(false); fetchVenues(); }}
            >
              <Text style={styles.applyBtnText}>Aplică</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, ...typography.bodyLg, color: colors.textPrimary, paddingVertical: 12 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipsRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: colors.background, fontWeight: '700' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  venueCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  venueImage: { width: '100%', height: 180 },
  placeholder: { backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' },
  tagsOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: 4,
  },
  tagBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tagText: { ...typography.caption, color: colors.textPrimary, textTransform: 'none', fontSize: 10 },
  venueBadge: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  venueInfo: { padding: spacing.md },
  venueName: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  locationText: { ...typography.bodySm, color: colors.textSecondary },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  ratingText: { ...typography.bodySm, color: colors.primary, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  capacityText: { ...typography.bodySm, color: colors.textTertiary },
  priceText: { ...typography.bodyLg, color: colors.primary, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.sm, paddingHorizontal: spacing.lg },
  emptyText: { ...typography.h3, color: colors.textSecondary },
  emptySubtext: { ...typography.bodySm, color: colors.textTertiary, textAlign: 'center' },
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
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.h2, color: colors.textPrimary },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  sortOptionActive: { backgroundColor: colors.surfaceHighlight },
  sortText: { ...typography.bodyLg, color: colors.textSecondary },
  sortTextActive: { color: colors.primary, fontWeight: '600' },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.full,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  applyBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
});
