import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, EVENT_TYPE_LABELS, EVENT_TYPE_ICONS, Venue } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';
import VenueBadges from '../../src/components/VenueBadges';
import LoyaltyBadge from '../../src/components/LoyaltyBadge';

const { width } = Dimensions.get('window');

const HOW_IT_WORKS = [
  { step: '1', title: 'Caută', desc: 'Găsește locația perfectă pentru evenimentul tău', icon: 'search' },
  { step: '2', title: 'Solicită', desc: 'Cere ofertă și verifică disponibilitatea', icon: 'chatbubble-ellipses' },
  { step: '3', title: 'Rezervă', desc: 'Confirmă direct cu proprietarul locației', icon: 'checkmark-circle' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.logoRow}>
              <Ionicons name="diamond" size={24} color={colors.primary} />
              <Text style={styles.logoText}>Venvy</Text>
            </View>
            <TouchableOpacity
              testID="home-profile-btn"
              onPress={() => router.push(user ? '/(tabs)/profile' : '/auth')}
              style={styles.avatarBtn}
            >
              {user ? (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                  {user.loyalty_tier && user.role === 'client' && (
                    <View style={styles.loyaltyIndicator}>
                      <View style={[styles.loyaltyDot, { backgroundColor: user.loyalty_tier.color }]} />
                    </View>
                  )}
                </View>
              ) : (
                <Ionicons name="log-in" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.heroTitle}>
            Găsește locația perfectă{'\n'}pentru evenimentul tău
          </Text>
          <Text style={styles.heroSubtitle}>
            Marketplace-ul nr. 1 din România pentru locații de nunți, botezuri și evenimente corporate.
          </Text>

          {/* Search CTA */}
          <TouchableOpacity
            testID="home-search-btn"
            style={styles.searchBtn}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <Text style={styles.searchBtnText}>Caută locații, orașe...</Text>
          </TouchableOpacity>
        </View>

        {/* Event Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ce tip de eveniment planifici?</Text>
          <View style={styles.typesGrid}>
            {eventTypes.map(([id, label]) => (
              <TouchableOpacity
                key={id}
                testID={`event-type-${id}`}
                style={styles.typeCard}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { event_type: id } })}
              >
                <View style={styles.typeIconWrap}>
                  <Ionicons name={(EVENT_TYPE_ICONS[id] || 'star') as any} size={24} color={colors.primary} />
                </View>
                <Text style={styles.typeLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promoted Venues (Gold promotions) */}
        {promotedVenues.length > 0 && (
          <View style={styles.promotedSection}>
            <View style={styles.promotedHeader}>
              <View style={styles.promotedTitleRow}>
                <Ionicons name="flash" size={20} color={colors.warning} />
                <Text style={styles.promotedTitle}>Locații în evidență</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promotedRow}>
              {promotedVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.promotedCard}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                  activeOpacity={0.9}
                >
                  {venue.images && venue.images[0] ? (
                    <Image source={{ uri: venue.images[0] }} style={styles.promotedImage} />
                  ) : (
                    <View style={[styles.promotedImage, styles.placeholderImage]}>
                      <Ionicons name="business" size={32} color={colors.textTertiary} />
                    </View>
                  )}
                  <View style={styles.promotedBadge}>
                    <Ionicons name="flash" size={10} color="#fff" />
                    <Text style={styles.promotedBadgeText}>Top Promovat</Text>
                  </View>
                  <View style={styles.promotedInfo}>
                    <Text style={styles.promotedName} numberOfLines={1}>{venue.name}</Text>
                    <Text style={styles.promotedCity}>{venue.city}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cum funcționează</Text>
          <View style={styles.stepsRow}>
            {HOW_IT_WORKS.map((item, i) => (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepCircle}>
                  <Ionicons name={item.icon as any} size={22} color={colors.primary} />
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Latest Venues */}
        {venues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Locații Recomandate</Text>
              <TouchableOpacity testID="see-all-btn" onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.seeAll}>Vezi toate →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.venueRow}>
              {venues.slice(0, 6).map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  testID={`venue-card-${venue.id}`}
                  style={styles.venueCard}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                  activeOpacity={0.9}
                >
                  {venue.images && venue.images[0] ? (
                    <Image source={{ uri: venue.images[0] }} style={styles.venueImage} />
                  ) : (
                    <View style={[styles.venueImage, styles.placeholderImage]}>
                      <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
                    </View>
                  )}
                  
                  {/* Tags */}
                  {venue.style_tags && venue.style_tags.length > 0 && (
                    <View style={styles.tagsOverlay}>
                      {venue.style_tags.slice(0, 2).map((tag) => (
                        <View key={tag} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
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
                    <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-sharp" size={13} color={colors.textSecondary} />
                      <Text style={styles.locationText}>{venue.city}</Text>
                      {venue.avg_rating > 0 && (
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={10} color={colors.primary} />
                          <Text style={styles.ratingText}>{venue.avg_rating}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.capacityText}>{venue.capacity_min}-{venue.capacity_max} persoane</Text>
                    <Text style={styles.priceText}>
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
          <View style={styles.emptySection}>
            <Ionicons name="business-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Încă nu sunt locații publicate</Text>
            <Text style={styles.emptySubtext}>
              Fii primul proprietar care își listează locația pe Venvy!
            </Text>
            {user?.role === 'owner' ? (
              <TouchableOpacity
                testID="add-venue-cta"
                style={styles.ctaBtn}
                onPress={() => router.push('/owner/add-venue')}
              >
                <Text style={styles.ctaBtnText}>Adaugă locația ta</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                testID="register-owner-cta"
                style={styles.ctaBtn}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.ctaBtnText}>Înregistrează-te ca proprietar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Owner CTA */}
        <View style={styles.ownerCta}>
          <View style={styles.ownerCtaIcon}>
            <Ionicons name="business" size={28} color={colors.primary} />
          </View>
          <Text style={styles.ownerCtaTitle}>Ai o locație de evenimente?</Text>
          <Text style={styles.ownerCtaText}>
            Listează-ți spațiul pe Venvy și fii descoperit de mii de clienți care caută locația perfectă.
          </Text>
          <TouchableOpacity
            testID="owner-register-cta"
            style={styles.ownerCtaBtn}
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
  container: { flex: 1, backgroundColor: colors.background },
  hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoText: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userAvatar: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  loyaltyIndicator: { position: 'absolute', bottom: -2, right: -2 },
  loyaltyDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.background },
  heroTitle: { ...typography.h1, color: colors.textPrimary, lineHeight: 36 },
  heroSubtitle: { ...typography.bodyLg, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  searchBtnText: { ...typography.bodyLg, color: colors.textTertiary },
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { ...typography.bodySm, color: colors.primary, fontWeight: '600' },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeCard: {
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 3,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  typeLabel: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '500', textAlign: 'center' },
  // Promoted section
  promotedSection: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  promotedHeader: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  promotedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  promotedTitle: { ...typography.h3, color: colors.textPrimary },
  promotedRow: { paddingHorizontal: spacing.lg, gap: spacing.md },
  promotedCard: { width: 180, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceHighlight },
  promotedImage: { width: '100%', height: 100 },
  placeholderImage: { backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' },
  promotedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  promotedBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  promotedInfo: { padding: spacing.sm },
  promotedName: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '600' },
  promotedCity: { ...typography.caption, color: colors.textTertiary, textTransform: 'none', marginTop: 2 },
  // Steps
  stepsRow: { gap: spacing.md },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '700' },
  stepDesc: { ...typography.bodySm, color: colors.textSecondary, flex: 1 },
  // Venue cards
  venueRow: { paddingRight: spacing.lg, gap: spacing.md },
  venueCard: {
    width: width * 0.65,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  venueImage: { width: '100%', height: 160 },
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
  venueName: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
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
  ratingText: { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'none' },
  capacityText: { ...typography.bodySm, color: colors.textTertiary, marginTop: 2 },
  priceText: { ...typography.bodySm, color: colors.primary, fontWeight: '700', marginTop: 4 },
  // Empty state
  emptySection: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg, gap: spacing.sm },
  emptyTitle: { ...typography.h3, color: colors.textSecondary, textAlign: 'center' },
  emptySubtext: { ...typography.bodyLg, color: colors.textTertiary, textAlign: 'center' },
  ctaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  ctaBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
  // Owner CTA
  ownerCta: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    alignItems: 'center',
  },
  ownerCtaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  ownerCtaTitle: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
  ownerCtaText: { ...typography.bodySm, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20, textAlign: 'center' },
  ownerCtaBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  ownerCtaBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
});
