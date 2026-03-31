import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EVENT_COLORS } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { apiCall, EVENT_TYPE_LABELS, EVENT_TYPE_ICONS, Venue } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';
import VenueBadges from '../../src/components/VenueBadges';

const { width } = Dimensions.get('window');

const HOW_IT_WORKS = [
  { step: '1', title: 'Caută', desc: 'Găsește locația perfectă', icon: 'search' },
  { step: '2', title: 'Solicită', desc: 'Cere ofertă personalizată', icon: 'chatbubble-ellipses' },
  { step: '3', title: 'Rezervă', desc: 'Confirmă direct cu proprietarul', icon: 'checkmark-circle' },
];

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
  const s = theme.spacing;
  const r = theme.radius;

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
        <View style={[styles.hero, { paddingHorizontal: s.lg }]}>
          <View style={styles.heroTop}>
            <View style={styles.logoRow}>
              <View style={[styles.logoIcon, { backgroundColor: c.primary + '20' }]}>
                <Ionicons name="diamond" size={20} color={c.primary} />
              </View>
              <Text style={[styles.logoText, { color: c.textPrimary }]}>Venvy</Text>
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
            Cele mai bune locații pentru nunți, botezuri și evenimente corporate din România.
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

        {/* Event Types with Colors */}
        <View style={[styles.section, { paddingHorizontal: s.lg }]}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Ce tip de eveniment planifici?</Text>
          <View style={styles.typesGrid}>
            {eventTypes.map(([id, label]) => {
              const eventColor = EVENT_COLORS[id] || { primary: c.primary, light: c.surfaceHighlight };
              return (
                <TouchableOpacity
                  key={id}
                  testID={`event-type-${id}`}
                  activeOpacity={0.7}
                  style={[
                    styles.typeCard, 
                    { 
                      backgroundColor: c.surface, 
                      borderColor: c.border,
                      borderLeftWidth: 3,
                      borderLeftColor: eventColor.primary,
                    }
                  ]}
                  onPress={() => router.push({ pathname: '/(tabs)/search', params: { event_type: id } })}
                >
                  <View style={[styles.typeIconWrap, { backgroundColor: eventColor.primary + '20' }]}>
                    <Ionicons name={(EVENT_TYPE_ICONS[id] || 'star') as any} size={22} color={eventColor.primary} />
                  </View>
                  <Text style={[styles.typeLabel, { color: c.textPrimary }]} numberOfLines={1}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Promoted Venues */}
        {promotedVenues.length > 0 && (
          <View style={[styles.promotedSection, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.promotedHeader, { paddingHorizontal: s.lg }]}>
              <View style={styles.promotedTitleRow}>
                <Ionicons name="flash" size={20} color={c.warning} />
                <Text style={[styles.promotedTitle, { color: c.textPrimary }]}>Locații în evidență</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.promotedRow, { paddingHorizontal: s.lg }]}>
              {promotedVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={[styles.promotedCard, { backgroundColor: c.surfaceHighlight }]}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                  activeOpacity={0.9}
                >
                  {venue.images && venue.images[0] ? (
                    <Image source={{ uri: venue.images[0] }} style={styles.promotedImage} />
                  ) : (
                    <View style={[styles.promotedImage, styles.placeholderImage, { backgroundColor: c.surfaceHighlight }]}>
                      <Ionicons name="business" size={32} color={c.textTertiary} />
                    </View>
                  )}
                  <View style={[styles.promotedBadge, { backgroundColor: c.error }]}>
                    <Ionicons name="flash" size={10} color="#fff" />
                    <Text style={styles.promotedBadgeText}>Top Promovat</Text>
                  </View>
                  <View style={styles.promotedInfo}>
                    <Text style={[styles.promotedName, { color: c.textPrimary }]} numberOfLines={1}>{venue.name}</Text>
                    <Text style={[styles.promotedCity, { color: c.textTertiary }]}>{venue.city}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* How it works */}
        <View style={[styles.section, { paddingHorizontal: s.lg }]}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Cum funcționează</Text>
          <View style={styles.stepsRow}>
            {HOW_IT_WORKS.map((item, i) => (
              <View key={i} style={[styles.stepCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.stepCircle, { backgroundColor: c.primary + '15' }]}>
                  <Ionicons name={item.icon as any} size={20} color={c.primary} />
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
          <View style={[styles.section, { paddingHorizontal: s.lg }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Locații Recomandate</Text>
              <TouchableOpacity testID="see-all-btn" onPress={() => router.push('/(tabs)/search')}>
                <Text style={[styles.seeAll, { color: c.primary }]}>Vezi toate →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.venueRow}>
              {venues.slice(0, 6).map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  testID={`venue-card-${venue.id}`}
                  style={[styles.venueCard, { backgroundColor: c.surface, borderColor: c.border }]}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                  activeOpacity={0.9}
                >
                  {venue.images && venue.images[0] ? (
                    <Image source={{ uri: venue.images[0] }} style={styles.venueImage} />
                  ) : (
                    <View style={[styles.venueImage, styles.placeholderImage, { backgroundColor: c.surfaceHighlight }]}>
                      <Ionicons name="image-outline" size={32} color={c.textTertiary} />
                    </View>
                  )}
                  
                  {/* Event type color indicator */}
                  {venue.event_types && venue.event_types[0] && (
                    <View style={[
                      styles.eventTypeIndicator, 
                      { backgroundColor: (EVENT_COLORS[venue.event_types[0]] || EVENT_COLORS.wedding).primary }
                    ]} />
                  )}
                  
                  {/* Badges */}
                  {(venue.commission_badge || venue.promotion_badge) && (
                    <VenueBadges
                      commissionBadge={venue.commission_badge}
                      promotionBadge={venue.promotion_badge}
                      style={styles.venueBadge}
                    />
                  )}
                  
                  <View style={styles.venueInfo}>
                    <Text style={[styles.venueName, { color: c.textPrimary }]} numberOfLines={1}>{venue.name}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-sharp" size={13} color={c.textSecondary} />
                      <Text style={[styles.locationText, { color: c.textSecondary }]}>{venue.city}</Text>
                      {venue.avg_rating > 0 && (
                        <View style={[styles.ratingBadge, { backgroundColor: c.primary + '20' }]}>
                          <Ionicons name="star" size={10} color={c.primary} />
                          <Text style={[styles.ratingText, { color: c.primary }]}>{venue.avg_rating}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.capacityText, { color: c.textTertiary }]}>{venue.capacity_min}-{venue.capacity_max} persoane</Text>
                    <Text style={[styles.priceText, { color: c.primary }]}>
                      {venue.price_type === 'fixed' && venue.price_per_person
                        ? `de la €${venue.price_per_person}/persoană`
                        : 'Cere ofertă de preț'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Empty state */}
        {!loading && venues.length === 0 && (
          <View style={[styles.emptySection, { paddingHorizontal: s.lg }]}>
            <Ionicons name="business-outline" size={48} color={c.textTertiary} />
            <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>Încă nu sunt locații publicate</Text>
            <Text style={[styles.emptySubtext, { color: c.textTertiary }]}>
              Fii primul proprietar care își listează locația pe Venvy!
            </Text>
            <TouchableOpacity
              testID="register-owner-cta"
              style={[styles.ctaBtn, { backgroundColor: c.primary }]}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.ctaBtnText}>Înregistrează-te ca proprietar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Owner CTA */}
        <View style={[styles.ownerCta, { backgroundColor: c.surface, borderColor: c.primary + '40', marginHorizontal: s.lg }]}>
          <View style={[styles.ownerCtaIcon, { backgroundColor: c.primary + '15' }]}>
            <Ionicons name="business" size={28} color={c.primary} />
          </View>
          <Text style={[styles.ownerCtaTitle, { color: c.textPrimary }]}>Ai o locație de evenimente?</Text>
          <Text style={[styles.ownerCtaText, { color: c.textSecondary }]}>
            Listează-ți spațiul pe Venvy și fii descoperit de mii de clienți.
          </Text>
          <TouchableOpacity
            testID="owner-register-cta"
            style={[styles.ownerCtaBtn, { backgroundColor: c.primary }]}
            onPress={() => user?.role === 'owner' ? router.push('/owner/add-venue') : router.push('/auth')}
          >
            <Text style={styles.ownerCtaBtnText}>Listează-ți locația gratuit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingTop: 8, paddingBottom: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 24, fontWeight: '700' },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  userAvatarText: { fontSize: 16, fontWeight: '700' },
  heroTitle: { fontSize: 26, fontWeight: '700', lineHeight: 34 },
  heroSubtitle: { fontSize: 15, marginTop: 8, lineHeight: 22 },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
  },
  searchBtnText: { fontSize: 15 },
  section: { marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontSize: 14, fontWeight: '600' },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    width: (width - 48 - 20) / 3,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  typeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    flexShrink: 0,
  },
  typeLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center', flexShrink: 0 },
  // Promoted section
  promotedSection: {
    marginTop: 28,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  promotedHeader: { marginBottom: 10 },
  promotedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promotedTitle: { fontSize: 18, fontWeight: '600' },
  promotedRow: { gap: 12 },
  promotedCard: { width: 180, borderRadius: 12, overflow: 'hidden' },
  promotedImage: { width: '100%', height: 100 },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  promotedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  promotedBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  promotedInfo: { padding: 10 },
  promotedName: { fontSize: 14, fontWeight: '600' },
  promotedCity: { fontSize: 12, marginTop: 2 },
  // Steps
  stepsRow: { gap: 10 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600' },
  stepDesc: { fontSize: 13, marginTop: 2 },
  // Venue cards
  venueRow: { gap: 12, paddingRight: 24 },
  venueCard: {
    width: width * 0.65,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  venueImage: { width: '100%', height: 150 },
  eventTypeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  venueBadge: { position: 'absolute', top: 10, right: 10 },
  venueInfo: { padding: 12 },
  venueName: { fontSize: 15, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  locationText: { fontSize: 13 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  ratingText: { fontSize: 12, fontWeight: '700' },
  capacityText: { fontSize: 13, marginTop: 4 },
  priceText: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  // Empty state
  emptySection: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
  ctaBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 16,
  },
  ctaBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  // Owner CTA
  ownerCta: {
    marginTop: 28,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  ownerCtaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ownerCtaTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  ownerCtaText: { fontSize: 14, marginTop: 6, lineHeight: 20, textAlign: 'center' },
  ownerCtaBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 16,
  },
  ownerCtaBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
