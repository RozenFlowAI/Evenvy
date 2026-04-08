import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { apiCall, EVENT_TYPE_LABELS, Venue, Review } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';
import VenueMap from '../../src/components/VenueMap';
import VenueBadges from '../../src/components/VenueBadges';

const { width } = Dimensions.get('window');

export default function VenueDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  // ANTI-BYPASS: Track if user has sent a quote request
  const [quoteSent, setQuoteSent] = useState(false);
  const [checkingQuote, setCheckingQuote] = useState(true);

  useEffect(() => {
    Promise.all([apiCall(`/venues/${id}`), apiCall(`/reviews/venue/${id}`)])
      .then(([v, r]) => { setVenue(v); setReviews(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
    
    // Check if user already sent a quote for this venue
    if (token) {
      apiCall(`/quotes/check/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((data) => setQuoteSent(data.has_quote))
        .catch(() => setQuoteSent(false))
        .finally(() => setCheckingQuote(false));
    } else {
      setCheckingQuote(false);
    }
  }, [id, token]);

  if (loading || !venue) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <ActivityIndicator testID="venue-loading" size="large" color={c.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imgContainer}>
          {venue.images && venue.images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
            >
              {venue.images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.heroImage} />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.heroImage, styles.noImage, { backgroundColor: c.surfaceHighlight }]}>
              <Ionicons name="image-outline" size={48} color={c.textTertiary} />
              <Text style={[styles.noImageText, { color: c.textTertiary }]}>Fără imagini</Text>
            </View>
          )}
          
          <SafeAreaView style={styles.topBar} edges={['top']}>
            <TouchableOpacity testID="venue-back-btn" style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={c.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="heart-outline" size={22} color={c.textPrimary} />
            </TouchableOpacity>
          </SafeAreaView>
          
          {venue.images && venue.images.length > 1 && (
            <View style={styles.dots}>
              {venue.images.map((_, i) => (
                <View key={i} style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.4)' }, i === activeImg && { backgroundColor: c.primary, width: 20 }]} />
              ))}
            </View>
          )}
          
          {/* Badges overlay */}
          <View style={styles.badgesOverlay}>
            {venue.style_tags && venue.style_tags.map(t => (
              <View key={t} style={styles.styleTag}>
                <Text style={[styles.styleTagText, { color: c.textPrimary }]}>{t}</Text>
              </View>
            ))}
          </View>
          
          {/* Commission/Promotion badge */}
          {(venue.commission_badge || venue.promotion_badge) && (
            <VenueBadges
              commissionBadge={venue.commission_badge}
              promotionBadge={venue.promotion_badge}
              style={styles.topBadge}
            />
          )}
        </View>

        <View style={styles.content}>
          <Text testID="venue-name" style={[styles.venueName, { color: c.textPrimary }]}>{venue.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={c.primary} />
            <Text style={[styles.location, { color: c.textSecondary }]}>
              {venue.city}{venue.address ? `, ${venue.address}` : ''}
            </Text>
          </View>

          {/* Key Stats */}
          <View style={[styles.statsRow, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: c.textPrimary }]}>{venue.capacity_min}-{venue.capacity_max}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>persoane</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: c.textPrimary }]}>
                {venue.price_type === 'fixed' && venue.price_per_person ? `€${venue.price_per_person}` : '—'}
              </Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>{venue.price_type === 'fixed' ? '/persoană' : 'la cerere'}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.border }]} />
            <View style={styles.stat}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={c.primary} />
                <Text style={[styles.statValue, { color: c.textPrimary }]}>{venue.avg_rating > 0 ? venue.avg_rating : '—'}</Text>
              </View>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>{venue.review_count} recenzii</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Despre locație</Text>
            <Text style={[styles.description, { color: c.textSecondary }]}>{venue.description || 'Fără descriere'}</Text>
          </View>

          {/* Rules Section */}
          {venue.rules && venue.rules.trim() !== '' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={20} color={c.primary} />
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Reguli și informații</Text>
              </View>
              <View style={[styles.rulesCard, { backgroundColor: c.surface, borderColor: c.warning + '40' }]}>
                <Text style={[styles.rulesText, { color: c.textSecondary }]}>{venue.rules}</Text>
              </View>
            </View>
          )}

          {/* Map Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="map" size={20} color={c.primary} />
              <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Locație pe hartă</Text>
            </View>
            <VenueMap
              latitude={venue.latitude || 0}
              longitude={venue.longitude || 0}
              venueName={venue.name}
              price={venue.price_per_person ? `€${venue.price_per_person}` : undefined}
            />
          </View>

          {/* Event Types */}
          {venue.event_types && venue.event_types.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Tipuri de evenimente</Text>
              <View style={styles.tagsRow}>
                {venue.event_types.map(t => (
                  <View key={t} style={[styles.eventTag, { backgroundColor: c.primary + '20', borderColor: c.primary + '40' }]}>
                    <Text style={[styles.eventTagText, { color: c.primary }]}>{EVENT_TYPE_LABELS[t] || t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Amenities */}
          {venue.amenities && venue.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Facilități</Text>
              <View style={styles.amenitiesGrid}>
                {venue.amenities.map((a, i) => (
                  <View key={i} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={16} color={c.success} />
                    <Text style={[styles.amenityText, { color: c.textSecondary }]}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact - ANTI-BYPASS: Hidden until quote sent */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Contact direct</Text>
            <View style={[styles.contactCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              {quoteSent ? (
                <>
                  {venue.contact_person ? (
                    <View style={styles.contactRow}>
                      <Ionicons name="person" size={16} color={c.primary} />
                      <Text style={[styles.contactText, { color: c.textSecondary }]}>{venue.contact_person}</Text>
                    </View>
                  ) : null}
                  {venue.contact_phone ? (
                    <View style={styles.contactRow}>
                      <Ionicons name="call" size={16} color={c.primary} />
                      <Text style={[styles.contactText, { color: c.textSecondary }]}>{venue.contact_phone}</Text>
                    </View>
                  ) : null}
                  {venue.contact_email ? (
                    <View style={styles.contactRow}>
                      <Ionicons name="mail" size={16} color={c.primary} />
                      <Text style={[styles.contactText, { color: c.textSecondary }]}>{venue.contact_email}</Text>
                    </View>
                  ) : null}
                  {!venue.contact_person && !venue.contact_phone && !venue.contact_email && (
                    <Text style={[styles.contactText, { color: c.textSecondary }]}>Proprietarul te va contacta direct</Text>
                  )}
                </>
              ) : (
                <View style={styles.contactLocked}>
                  <Ionicons name="lock-closed" size={32} color={c.textTertiary} />
                  <Text style={[styles.contactLockedTitle, { color: c.textSecondary }]}>Contact ascuns</Text>
                  <Text style={[styles.contactLockedText, { color: c.textTertiary }]}>
                    Trimite o cerere de ofertă pentru a vedea datele de contact
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Recenzii ({reviews.length})</Text>
              {reviews.map(r => (
                <View key={r.id} style={[styles.reviewCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <View style={styles.reviewHeader}>
                    <View style={[styles.reviewAvatar, { backgroundColor: c.surfaceHighlight }]}>
                      <Text style={[styles.reviewAvatarText, { color: c.primary }]}>{r.user_name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reviewName, { color: c.textPrimary }]}>{r.user_name}</Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Ionicons
                            key={s}
                            name={s <= r.rating ? 'star' : 'star-outline'}
                            size={14}
                            color={c.primary}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.reviewComment, { color: c.textSecondary }]}>{r.comment}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: c.surface, borderTopColor: c.border }]}>
        <View>
          <Text style={[styles.priceLabel, { color: c.primary }]}>
            {venue.price_type === 'fixed' && venue.price_per_person
              ? `de la €${venue.price_per_person}/pers.`
              : 'Preț la cerere'}
          </Text>
          <Text style={[styles.capacityLabel, { color: c.textTertiary }]}>{venue.capacity_min}-{venue.capacity_max} pers.</Text>
        </View>
        <TouchableOpacity
          testID="request-quote-btn"
          style={[styles.quoteBtn, { backgroundColor: c.primary }]}
          onPress={() => user ? router.push(`/booking/${venue.id}`) : router.push('/auth')}
        >
          <Text style={[styles.quoteBtnText, { color: c.background }]}>Cere ofertă</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imgContainer: { position: 'relative' },
  heroImage: { width, height: 300 },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: { marginTop: 8 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgesOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  styleTag: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  styleTagText: { fontSize: 11, fontWeight: '600' },
  topBadge: { position: 'absolute', top: 72, right: 16 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  venueName: { fontSize: 26, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  location: { fontSize: 16 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
  },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 18, fontWeight: '600' },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 30 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  section: { marginTop: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  description: { fontSize: 16, lineHeight: 24 },
  rulesCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  rulesText: { fontSize: 16, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  eventTag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  eventTagText: { fontSize: 14, fontWeight: '600' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
    paddingVertical: 4,
  },
  amenityText: { fontSize: 14 },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 16 },
  // ANTI-BYPASS: Locked contact styles
  contactLocked: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  contactLockedTitle: { fontSize: 16, fontWeight: '600' },
  contactLockedText: { fontSize: 14, textAlign: 'center' },
  reviewCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: 16, fontWeight: '700' },
  reviewName: { fontSize: 14, fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewComment: { fontSize: 14, lineHeight: 20 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  priceLabel: { fontSize: 16, fontWeight: '700' },
  capacityLabel: { fontSize: 14 },
  quoteBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  quoteBtnText: { fontSize: 16, fontWeight: '700' },
});
