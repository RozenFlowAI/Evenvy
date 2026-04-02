import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  TextInput, ActivityIndicator, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { apiCall, EVENT_TYPE_LABELS, Venue } from '../../src/utils/api';
import VenueBadges from '../../src/components/VenueBadges';
import SkeletonLoader from '../../src/components/SkeletonLoader';

const { width } = Dimensions.get('window');

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

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ event_type?: string }>();
  const { theme } = useTheme();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState(params.event_type || '');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  const c = theme.colors;

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
      style={[styles.venueCard, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={() => router.push(`/venue/${item.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.images?.[0] || PLACEHOLDER_IMAGE }} 
          style={styles.venueImage}
        />
        {/* Skeleton shimmer while loading */}
        {(!item.images || item.images.length === 0) && (
          <View style={styles.imagePlaceholder}>
            <SkeletonLoader width="100%" height="100%" borderRadius={0} />
            <View style={styles.placeholderIcon}>
              <Ionicons name="image-outline" size={32} color={c.textTertiary} />
            </View>
          </View>
        )}
      </View>
      
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
        <Text style={[styles.venueName, { color: c.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={c.textSecondary} />
          <Text style={[styles.locationText, { color: c.textSecondary }]} numberOfLines={1}>{item.city}</Text>
          {item.avg_rating > 0 && (
            <View style={[styles.ratingBadge, { backgroundColor: c.primary + '20' }]}>
              <Ionicons name="star" size={11} color={c.primary} />
              <Text style={[styles.ratingText, { color: c.primary }]}>{item.avg_rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.capacityText, { color: c.textTertiary }]}>{item.capacity_min}-{item.capacity_max} pers.</Text>
          <Text style={[styles.priceText, { color: c.primary }]} numberOfLines={1}>
            {item.price_type === 'fixed' && item.price_per_person
              ? `€${item.price_per_person}/pers.`
              : 'Cere ofertă'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.textPrimary }]}>Caută Locații</Text>
        <View style={styles.searchRow}>
          <View style={[styles.searchInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border }]}>
            <Ionicons name="search" size={18} color={c.textTertiary} />
            <TextInput
              testID="search-input"
              style={[styles.input, { color: c.textPrimary }]}
              placeholder="Nume, oraș..."
              placeholderTextColor={c.textTertiary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={fetchVenues}
              returnKeyType="search"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')} testID="clear-search">
                <Ionicons name="close-circle" size={18} color={c.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity 
            testID="filter-btn" 
            style={[styles.filterBtn, { backgroundColor: c.surfaceHighlight, borderColor: c.border }]} 
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter chips - FIXED: consistent height, single color */}
      <FlatList
        horizontal
        data={EVENT_TYPES}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        keyExtractor={(item) => item.id || 'all'}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`filter-type-${item.id || 'all'}`}
            activeOpacity={0.7}
            style={[
              styles.chip, 
              { backgroundColor: c.surfaceHighlight, borderColor: c.border },
              eventType === item.id && { backgroundColor: c.primary, borderColor: c.primary }
            ]}
            onPress={() => setEventType(item.id)}
          >
            <Text style={[
              styles.chipText, 
              { color: c.textSecondary },
              eventType === item.id && styles.chipTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator testID="search-loading" size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          testID="venue-list"
          data={venues}
          keyExtractor={(item) => item.id}
          renderItem={renderVenue}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, { backgroundColor: c.surfaceHighlight }]}>
                <Ionicons name="search-outline" size={40} color={c.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Nicio locație găsită</Text>
              <Text style={[styles.emptySubtext, { color: c.textSecondary }]}>
                {eventType 
                  ? `Nu există locații pentru "${EVENT_TYPE_LABELS[eventType] || eventType}".`
                  : 'Proprietarii nu au publicat încă locații.'}
              </Text>
              <Text style={[styles.emptyHint, { color: c.textTertiary }]}>
                Încearcă să schimbi filtrele sau caută altceva.
              </Text>
            </View>
          }
        />
      )}

      {/* Sort Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.textPrimary }]}>Sortare</Text>
              <TouchableOpacity testID="close-filters" onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={c.textPrimary} />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                testID={`sort-${opt.id}`}
                style={[
                  styles.sortOption, 
                  { borderColor: c.border },
                  sortBy === opt.id && { backgroundColor: c.surfaceHighlight }
                ]}
                onPress={() => setSortBy(opt.id)}
              >
                <Text style={[
                  styles.sortText, 
                  { color: c.textSecondary },
                  sortBy === opt.id && { color: c.primary, fontWeight: '600' }
                ]}>
                  {opt.label}
                </Text>
                {sortBy === opt.id && <Ionicons name="checkmark" size={18} color={c.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              testID="apply-filters"
              style={[styles.applyBtn, { backgroundColor: c.primary }]}
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
  container: { flex: 1 },
  
  // Header
  header: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 12 },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  
  // Chips - FIXED: consistent height, no expansion
  chipsRow: { paddingHorizontal: 24, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 0,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  
  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  // List
  listContent: { paddingHorizontal: 24, paddingBottom: 24 },
  
  // Venue card - FIXED: image placeholder, price truncation
  venueCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
  },
  imageContainer: { width: '100%', height: 160, position: 'relative' },
  venueImage: { width: '100%', height: '100%' },
  imagePlaceholder: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0
  },
  placeholderIcon: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  tagsOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 4,
  },
  tagBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  venueBadge: { position: 'absolute', top: 10, right: 10 },
  venueInfo: { padding: 12 },
  venueName: { fontSize: 16, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 13, fontWeight: '400', flex: 1 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  ratingText: { fontSize: 12, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  capacityText: { fontSize: 13, fontWeight: '400' },
  priceText: { fontSize: 15, fontWeight: '700' },
  
  // Empty state - FIXED: no empty space
  emptyContainer: { 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 32 
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { fontSize: 14, fontWeight: '400', textAlign: 'center', marginTop: 8 },
  emptyHint: { fontSize: 13, fontWeight: '400', textAlign: 'center', marginTop: 8 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '600' },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  sortText: { fontSize: 15, fontWeight: '400' },
  applyBtn: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 16,
  },
  applyBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
