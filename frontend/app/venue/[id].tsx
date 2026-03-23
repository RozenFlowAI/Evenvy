import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, EVENT_TYPE_LABELS } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

type Venue = {
  id: string; name: string; description: string; city: string; address: string;
  price_per_person: number | null; price_type: string;
  capacity_min: number; capacity_max: number; event_types: string[];
  style_tags: string[]; amenities: string[]; images: string[];
  contact_phone: string; contact_email: string; contact_person: string;
  avg_rating: number; review_count: number; quote_count: number; owner_name: string;
};

type Review = { id: string; user_name: string; rating: number; comment: string; created_at: string; };

export default function VenueDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    Promise.all([apiCall(`/venues/${id}`), apiCall(`/reviews/venue/${id}`)])
      .then(([v, r]) => { setVenue(v); setReviews(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !venue) {
    return <SafeAreaView style={styles.container}><ActivityIndicator testID="venue-loading" size="large" color={colors.primary} style={{ flex: 1 }} /></SafeAreaView>;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imgContainer}>
          {venue.images.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}>
              {venue.images.map((img, i) => <Image key={i} source={{ uri: img }} style={styles.heroImage} />)}
            </ScrollView>
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
              <Text style={{ color: colors.textTertiary, marginTop: 8 }}>Fără imagini</Text>
            </View>
          )}
          <SafeAreaView style={styles.topBar} edges={['top']}>
            <TouchableOpacity testID="venue-back-btn" style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </SafeAreaView>
          {venue.images.length > 1 && (
            <View style={styles.dots}>
              {venue.images.map((_, i) => <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />)}
            </View>
          )}
          {venue.style_tags.length > 0 && (
            <View style={styles.styleTags}>
              {venue.style_tags.map(t => (
                <View key={t} style={styles.styleTag}><Text style={styles.styleTagText}>{t}</Text></View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text testID="venue-name" style={styles.venueName}>{venue.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={colors.primary} />
            <Text style={styles.location}>{venue.city}{venue.address ? `, ${venue.address}` : ''}</Text>
          </View>

          {/* Key Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{venue.capacity_min}-{venue.capacity_max}</Text>
              <Text style={styles.statLabel}>persoane</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {venue.price_type === 'fixed' && venue.price_per_person ? `€${venue.price_per_person}` : '—'}
              </Text>
              <Text style={styles.statLabel}>{venue.price_type === 'fixed' ? '/persoană' : 'la cerere'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{venue.avg_rating > 0 ? venue.avg_rating : '—'}</Text>
              <Text style={styles.statLabel}>{venue.review_count} recenzii</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Despre locație</Text>
            <Text style={styles.description}>{venue.description}</Text>
          </View>

          {/* Event Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipuri de evenimente</Text>
            <View style={styles.tagsRow}>
              {venue.event_types.map(t => (
                <View key={t} style={styles.eventTag}>
                  <Text style={styles.eventTagText}>{EVENT_TYPE_LABELS[t] || t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Amenities */}
          {venue.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilități</Text>
              <View style={styles.amenitiesGrid}>
                {venue.amenities.map((a, i) => (
                  <View key={i} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact direct</Text>
            <View style={styles.contactCard}>
              {venue.contact_person ? <View style={styles.contactRow}><Ionicons name="person" size={16} color={colors.primary} /><Text style={styles.contactText}>{venue.contact_person}</Text></View> : null}
              {venue.contact_phone ? <View style={styles.contactRow}><Ionicons name="call" size={16} color={colors.primary} /><Text style={styles.contactText}>{venue.contact_phone}</Text></View> : null}
              {venue.contact_email ? <View style={styles.contactRow}><Ionicons name="mail" size={16} color={colors.primary} /><Text style={styles.contactText}>{venue.contact_email}</Text></View> : null}
              {!venue.contact_person && !venue.contact_phone && !venue.contact_email && (
                <Text style={styles.contactText}>Contactează prin cerere de ofertă</Text>
              )}
            </View>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recenzii ({reviews.length})</Text>
              {reviews.map(r => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{r.user_name.charAt(0)}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{r.user_name}</Text>
                      <View style={styles.starsRow}>
                        {[1,2,3,4,5].map(s => <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color={colors.primary} />)}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>
            {venue.price_type === 'fixed' && venue.price_per_person
              ? `de la €${venue.price_per_person}/pers.`
              : 'Preț la cerere'}
          </Text>
          <Text style={styles.capacityLabel}>{venue.capacity_min}-{venue.capacity_max} pers.</Text>
        </View>
        <TouchableOpacity
          testID="request-quote-btn"
          style={styles.quoteBtn}
          onPress={() => user ? router.push(`/booking/${venue.id}`) : router.push('/auth')}
        >
          <Text style={styles.quoteBtnText}>Cere ofertă</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  imgContainer: { position: 'relative' },
  heroImage: { width, height: 280 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: spacing.md, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  styleTags: { position: 'absolute', top: spacing.sm, right: spacing.sm, gap: 4 },
  styleTag: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  styleTagText: { color: colors.textPrimary, fontSize: 11, fontWeight: '600' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  venueName: { ...typography.h1, color: colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  location: { ...typography.bodyLg, color: colors.textSecondary },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, textTransform: 'none' },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  section: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  description: { ...typography.bodyLg, color: colors.textSecondary, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  eventTag: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.primary + '20', borderWidth: 1, borderColor: colors.primary + '40' },
  eventTagText: { ...typography.bodySm, color: colors.primary, fontWeight: '600' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '48%', paddingVertical: 4 },
  amenityText: { ...typography.bodySm, color: colors.textSecondary },
  contactCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  contactText: { ...typography.bodyLg, color: colors.textSecondary },
  reviewCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { ...typography.bodyLg, color: colors.primary, fontWeight: '700' },
  reviewName: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewComment: { ...typography.bodySm, color: colors.textSecondary, lineHeight: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xl,
  },
  priceLabel: { ...typography.bodyLg, color: colors.primary, fontWeight: '700' },
  capacityLabel: { ...typography.bodySm, color: colors.textTertiary },
  quoteBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 14, borderRadius: radius.full },
  quoteBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
});
