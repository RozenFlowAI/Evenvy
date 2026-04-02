import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { apiCall, EVENT_TYPE_LABELS, EVENT_TYPE_ICONS, Venue } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';
import VenueBadges from '../../src/components/VenueBadges';
import SkeletonLoader from '../../src/components/SkeletonLoader';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 3; // 3 columns with gaps

const HOW_IT_WORKS = [
  { step: '1', title: 'Caută', desc: 'Găsește locația perfectă', icon: 'search' },
  { step: '2', title: 'Solicită', desc: 'Cere ofertă personalizată', icon: 'chatbubble-ellipses' },
  { step: '3', title: 'Rezervă', desc: 'Confirmă direct cu proprietarul', icon: 'checkmark-circle' },
];

// Placeholder image for missing venue images
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [promotedVenues, setPromotedVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [allVenues, promoted] = await Promise.all([
        apiCall('/venues?sort_by=recommended'),
        apiCall('/venues/promoted').catch(() => []),
      ]);
      setVenues(allVenues);
      setPromotedVenues(promoted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const eventTypes = Object.entries(EVENT_TYPE_LABELS).slice(0, 6);
  const c = theme.colors;

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
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.logoRow}>
              <View style={[styles.logoIcon, { backgroundColor: c.primary + '20' }]}>
                <Ionicons name="diamond" size={18} color={c.primary} />
              </View>
              <Text style={[styles.logoText, { color: c.textPrimary }]}>Evenvy</Text>
            </View>
            <TouchableOpacity
              testID="home-profile-btn"
              onPress={() => router.push(user ? '/(tabs)/profile' : '/auth')}
              style={[styles.avatarBtn, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              {user ? (
                <Text style={[styles.userAvatarText, { color: c.primary }]}>{user.name.charAt(0)}</Text>
              ) : (
                <Ionicons name="person" size={18} color={c.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.heroTitle, { color: c.textPrimary }]}>
            Găsește locația perfectă{'\n'}pentru evenimentul tău
          </Text>
          <Text style={[styles.heroSubtitle, { color: c.textSecondary }]}>
            Cele mai bune locații pentru nunți, botezuri și evenimente corporate.
          </Text>

          {/* Search CTA */}
          <TouchableOpacity
            testID="home-search-btn"
            style={[styles.searchBtn, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={20} color={c.textTertiary} />
            <Text style={[styles.searchBtnText, { color: c.textTertiary }]}>Caută locații, orașe...</Text>
          </TouchableOpacity>
        </View>

        {/* Event Types - Single accent color (gold), MaterialCommunityIcons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Ce tip de eveniment planifici?</Text>
          <View style={styles.typesGrid}>
            {eventTypes.map(([id, label]) => (
              <TouchableOpacity
                key={id}
                testID={`event-type-${id}`}
                activeOpacity={0.7}
                style={[styles.typeCard, { backgroundColor: c.surface, borderColor: c.primary + '40' }]}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { event_type: id } })}
              >
                <View style={[styles.typeIconWrap, { backgroundColor: c.primary + '15' }]}>
                  <MaterialCommunityIcons name={(EVENT_TYPE_ICONS[id] || 'star') as any} size={22} color={c.primary} />
                </View>
                <Text style={[styles.typeLabel, { color: c.textPrimary }]} numberOfLines={1}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promoted Venues */}
        {promotedVenues.length > 0 && (
          <View style={[styles.promotedSection, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="flash" size={18} color={c.warning} />
              <Text style={[styles.sectionTitle, { color: c.textPrimary, marginBottom: 0 }]}>Locații în evidență</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {promotedVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={[styles.promotedCard, { backgroundColor: c.surfaceHighlight }]}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: venue.images?.[0] || PLACEHOLDER_IMAGE }} 
                    style={styles.promotedImage}
                    defaultSource={{ uri: PLACEHOLDER_IMAGE }}
                  />
                  <View style={[styles.promotedBadge, { backgroundColor: c.error }]}>
                    <Ionicons name="flash" size={10} color="#fff" />
                    <Text style={styles.promotedBadgeText}>Top</Text>
                  </View>
                  <View style={styles.promotedInfo}>
                    <Text style={[styles.cardTitle, { color: c.textPrimary }]} numberOfLines={1}>{venue.name}</Text>
                    <Text style={[styles.cardSubtitle, { color: c.textTertiary }]}>{venue.city}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* How it works */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Cum funcționează</Text>
          <View style={styles.stepsContainer}>
            {HOW_IT_WORKS.map((item, i) => (
              <View key={i} style={[styles.stepCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.stepCircle, { backgroundColor: c.primary + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={c.primary} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: c.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.stepDesc, { color: c.textSecondary }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Latest Venues */}
        {venues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary, marginBottom: 0 }]}>Locații Recomandate</Text>
              <TouchableOpacity testID="see-all-btn" onPress={() => router.push('/(tabs)/search')}>
                <Text style={[styles.seeAllText, { color: c.primary }]}>Vezi toate</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {venues.slice(0, 6).map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  testID={`venue-card-${venue.id}`}
                  style={[styles.venueCard, { backgroundColor: c.surface, borderColor: c.border }]}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                  activeOpacity={0.9}
                >
                  <View style={styles.venueImageContainer}>
                    <Image 
                      source={{ uri: venue.images?.[0] || PLACEHOLDER_IMAGE }} 
                      style={styles.venueImage}
                      defaultSource={{ uri: PLACEHOLDER_IMAGE }}
                    />
                    {/* Skeleton shimmer while loading */}
                    {(!venue.images || venue.images.length === 0) && (
                      <View style={styles.imagePlaceholder}>
                        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
                        <View style={styles.placeholderIcon}>
                          <Ionicons name="image-outline" size={28} color={c.textTertiary} />
                        </View>
                      </View>
                    )}
                  </View>
                  
                  {/* Badges */}
                  {(venue.commission_badge || venue.promotion_badge) && (
                    <VenueBadges
                      commissionBadge={venue.commission_badge}
                      promotionBadge={venue.promotion_badge}
                      style={styles.venueBadge}
                    />
                  )}
                  
                  <View style={styles.venueInfo}>
                    <Text style={[styles.cardTitle, { color: c.textPrimary }]} numberOfLines={1}>{venue.name}</Text>
                    <View style={styles.venueLocationRow}>
                      <Ionicons name="location-sharp" size={12} color={c.textSecondary} />
                      <Text style={[styles.cardSubtitle, { color: c.textSecondary }]} numberOfLines={1}>{venue.city}</Text>
                      {venue.avg_rating > 0 && (
                        <View style={[styles.ratingBadge, { backgroundColor: c.primary + '20' }]}>
                          <Ionicons name="star" size={10} color={c.primary} />
                          <Text style={[styles.ratingText, { color: c.primary }]}>{venue.avg_rating}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.capacityText, { color: c.textTertiary }]}>{venue.capacity_min}-{venue.capacity_max} pers.</Text>
                    <Text style={[styles.priceText, { color: c.primary }]} numberOfLines={1}>
                      {venue.price_type === 'fixed' && venue.price_per_person
                        ? `€${venue.price_per_person}/pers.`
                        : 'Cere ofertă'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Empty state */}
        {!loading && venues.length === 0 && (
          <View style={styles.emptySection}>
            <Ionicons name="business-outline" size={48} color={c.textTertiary} />
            <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>Încă nu sunt locații</Text>
            <Text style={[styles.emptySubtext, { color: c.textTertiary }]}>
              Fii primul proprietar care își listează locația pe Evenvy!
            </Text>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: c.primary }]}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.ctaBtnText}>Înregistrează-te ca proprietar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Owner CTA */}
        <View style={[styles.ownerCta, { backgroundColor: c.surface, borderColor: c.primary + '30' }]}>
          <View style={[styles.ownerCtaIcon, { backgroundColor: c.primary + '15' }]}>
            <Ionicons name="business" size={24} color={c.primary} />
          </View>
          <Text style={[styles.ownerCtaTitle, { color: c.textPrimary }]}>Ai o locație de evenimente?</Text>
          <Text style={[styles.ownerCtaText, { color: c.textSecondary }]}>
            Listează-ți spațiul și fii descoperit de mii de clienți.
          </Text>
          <TouchableOpacity
            testID="owner-register-cta"
            style={[styles.ctaBtn, { backgroundColor: c.primary }]}
            onPress={() => user?.role === 'owner' ? router.push('/owner/add-venue') : router.push('/auth')}
          >
            <Text style={styles.ctaBtnText}>Listează gratuit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Hero section
  hero: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 22, fontWeight: '700' },
  avatarBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  userAvatarText: { fontSize: 15, fontWeight: '700' },
  heroTitle: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  heroSubtitle: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  searchBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 14 },
  searchBtnText: { fontSize: 14 },
  
  // Section common
  section: { marginTop: 20, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12, paddingHorizontal: 24 },
  seeAllText: { fontSize: 13, fontWeight: '600' },
  
  // Event types grid - FIXED: all 6 visible, single accent color
  typesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8,
  },
  typeCard: {
    width: CARD_WIDTH,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  typeLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  
  // Promoted section
  promotedSection: { marginTop: 20, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1 },
  horizontalList: { paddingHorizontal: 24, gap: 10 },
  promotedCard: { width: 160, borderRadius: 12, overflow: 'hidden' },
  promotedImage: { width: '100%', height: 90, backgroundColor: '#1a1a1a' },
  promotedBadge: { position: 'absolute', top: 6, right: 6, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  promotedBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  promotedInfo: { padding: 10 },
  
  // Card typography - CONSISTENT weights
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, fontWeight: '400', marginTop: 2 },
  
  // Steps
  stepsContainer: { gap: 8 },
  stepCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  stepCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '600' },
  stepDesc: { fontSize: 12, fontWeight: '400', marginTop: 2 },
  
  // Venue cards - FIXED: image placeholder, price truncation
  venueCard: { width: width * 0.6, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  venueImageContainer: { width: '100%', height: 130, position: 'relative' },
  venueImage: { width: '100%', height: '100%' },
  imagePlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  placeholderIcon: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  venueBadge: { position: 'absolute', top: 8, right: 8 },
  venueInfo: { padding: 10 },
  venueLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 999 },
  ratingText: { fontSize: 11, fontWeight: '700' },
  capacityText: { fontSize: 12, fontWeight: '400', marginTop: 4 },
  priceText: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  
  // Empty state
  emptySection: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { fontSize: 13, fontWeight: '400', textAlign: 'center' },
  
  // CTA button
  ctaBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, marginTop: 12 },
  ctaBtnText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  
  // Owner CTA
  ownerCta: { marginTop: 20, marginHorizontal: 24, padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  ownerCtaIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  ownerCtaTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  ownerCtaText: { fontSize: 13, fontWeight: '400', marginTop: 4, textAlign: 'center' },
});
