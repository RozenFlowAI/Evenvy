import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, authHeaders } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

const EVENT_TYPES = [
  { id: 'wedding', label: 'Nuntă' },
  { id: 'baptism', label: 'Botez' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'civil_wedding', label: 'Cununie' },
  { id: 'party', label: 'Petrecere' },
  { id: 'birthday', label: 'Aniversare' },
  { id: 'conference', label: 'Conferință' },
];

const STYLE_TAGS = [
  'Modern', 'Glamour', 'Rustic', 'Exclusivist', 'Natură', 'Panoramic', 'Istoric', 'Central'
];

const AMENITIES = [
  'Parcare', 'Catering inclus', 'DJ / Muzică live', 'Decorațiuni', 'Fotograf',
  'Bar', 'Terasă', 'Grădină', 'Piscină', 'WiFi', 'Climatizare', 'Cameră mirilor'
];

const COMMISSION_TIERS = [
  { id: 'standard', label: 'Standard (10%)', desc: 'Listare normală' },
  { id: 'premium', label: 'Premium (15%)', desc: 'Badge "Recomandat" + prioritate' },
  { id: 'elite', label: 'Elite (20%)', desc: 'Badge "Top Alegere" + maximă vizibilitate' },
];

export default function AddVenueScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  
  // GPS
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Pricing
  const [priceType, setPriceType] = useState<'fixed' | 'on_request'>('on_request');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [capacityMin, setCapacityMin] = useState('');
  const [capacityMax, setCapacityMax] = useState('');
  
  // Contact
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Categories
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Commission
  const [commissionTier, setCommissionTier] = useState('standard');
  
  // Images
  const [imageUrls, setImageUrls] = useState('');

  const toggleItem = (list: string[], setList: (val: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter(t => t !== id) : [...list, id]);
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune necesară', 'Accesul la locație este necesar pentru a obține coordonatele GPS.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude.toFixed(6));
      setLongitude(loc.coords.longitude.toFixed(6));
      Alert.alert('Succes', 'Coordonatele GPS au fost setate!');
    } catch (e) {
      Alert.alert('Eroare', 'Nu am putut obține locația curentă.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !city || !capacityMin || !capacityMax || selectedTypes.length === 0) {
      Alert.alert('Eroare', 'Completează toate câmpurile obligatorii (*)');
      return;
    }
    if (!token) {
      router.push('/auth');
      return;
    }
    
    setSubmitting(true);
    try {
      const imagesList = imageUrls.split(',').map(u => u.trim()).filter(Boolean);

      await apiCall('/venues', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          name,
          description,
          rules,
          city,
          address,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          price_type: priceType,
          price_per_person: priceType === 'fixed' && pricePerPerson ? parseFloat(pricePerPerson) : null,
          capacity_min: parseInt(capacityMin),
          capacity_max: parseInt(capacityMax),
          event_types: selectedTypes,
          style_tags: selectedStyles,
          amenities: selectedAmenities,
          images: imagesList.length > 0 ? imagesList : [
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
          ],
          contact_person: contactPerson,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          commission_tier: commissionTier,
        }),
      });
      
      Alert.alert('Succes!', 'Locația a fost publicată cu succes.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Eroare', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity testID="add-venue-close-btn" style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Adaugă Locație</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Basic Info Section */}
          <Text style={styles.sectionLabel}>Informații de bază</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Numele locației *</Text>
            <TextInput
              testID="venue-name-input"
              style={styles.textInput}
              placeholder="ex: Palatul Regilor"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descriere *</Text>
            <TextInput
              testID="venue-description-input"
              style={[styles.textInput, styles.textArea]}
              placeholder="Descrie locația ta, atmosfera, ce o face specială..."
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Reguli și informații importante</Text>
            <TextInput
              testID="venue-rules-input"
              style={[styles.textInput, styles.textArea]}
              placeholder="ex: Se interzice fumatul în interior. Muzica se oprește la ora 23:00. Depozit: 500€..."
              placeholderTextColor={colors.textTertiary}
              value={rules}
              onChangeText={setRules}
              multiline
            />
            <Text style={styles.hint}>Regulile vor fi afișate separat pe pagina locației</Text>
          </View>

          {/* Location Section */}
          <Text style={styles.sectionLabel}>Locație</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Oraș *</Text>
              <TextInput
                testID="venue-city-input"
                style={styles.textInput}
                placeholder="București"
                placeholderTextColor={colors.textTertiary}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Adresă completă</Text>
            <TextInput
              testID="venue-address-input"
              style={styles.textInput}
              placeholder="Strada, Număr, Sector"
              placeholderTextColor={colors.textTertiary}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Coordonate GPS (pentru hartă)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Latitudine"
                placeholderTextColor={colors.textTertiary}
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Longitudine"
                placeholderTextColor={colors.textTertiary}
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="locate" size={18} color={colors.primary} />
                  <Text style={styles.gpsBtnText}>Folosește locația curentă</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Capacity & Pricing Section */}
          <Text style={styles.sectionLabel}>Capacitate și prețuri</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Capacitate min *</Text>
              <TextInput
                testID="venue-capacity-min-input"
                style={styles.textInput}
                placeholder="50"
                placeholderTextColor={colors.textTertiary}
                value={capacityMin}
                onChangeText={setCapacityMin}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Capacitate max *</Text>
              <TextInput
                testID="venue-capacity-max-input"
                style={styles.textInput}
                placeholder="300"
                placeholderTextColor={colors.textTertiary}
                value={capacityMax}
                onChangeText={setCapacityMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tip preț</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.priceTypeBtn, priceType === 'on_request' && styles.priceTypeBtnActive]}
                onPress={() => setPriceType('on_request')}
              >
                <Ionicons name={priceType === 'on_request' ? 'radio-button-on' : 'radio-button-off'} size={20} color={priceType === 'on_request' ? colors.primary : colors.textTertiary} />
                <Text style={[styles.priceTypeBtnText, priceType === 'on_request' && styles.priceTypeBtnTextActive]}>La cerere</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.priceTypeBtn, priceType === 'fixed' && styles.priceTypeBtnActive]}
                onPress={() => setPriceType('fixed')}
              >
                <Ionicons name={priceType === 'fixed' ? 'radio-button-on' : 'radio-button-off'} size={20} color={priceType === 'fixed' ? colors.primary : colors.textTertiary} />
                <Text style={[styles.priceTypeBtnText, priceType === 'fixed' && styles.priceTypeBtnTextActive]}>Preț fix</Text>
              </TouchableOpacity>
            </View>
          </View>

          {priceType === 'fixed' && (
            <View style={styles.field}>
              <Text style={styles.label}>Preț per persoană (€)</Text>
              <TextInput
                testID="venue-price-input"
                style={styles.textInput}
                placeholder="75"
                placeholderTextColor={colors.textTertiary}
                value={pricePerPerson}
                onChangeText={setPricePerPerson}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Event Types */}
          <Text style={styles.sectionLabel}>Tip evenimente *</Text>
          <View style={styles.chipsGrid}>
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                testID={`venue-type-${type.id}`}
                style={[styles.chip, selectedTypes.includes(type.id) && styles.chipActive]}
                onPress={() => toggleItem(selectedTypes, setSelectedTypes, type.id)}
              >
                <Text style={[styles.chipText, selectedTypes.includes(type.id) && styles.chipTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Style Tags */}
          <Text style={styles.sectionLabel}>Stil locație</Text>
          <View style={styles.chipsGrid}>
            {STYLE_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.chip, selectedStyles.includes(tag) && styles.chipActive]}
                onPress={() => toggleItem(selectedStyles, setSelectedStyles, tag)}
              >
                <Text style={[styles.chipText, selectedStyles.includes(tag) && styles.chipTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amenities */}
          <Text style={styles.sectionLabel}>Facilități</Text>
          <View style={styles.chipsGrid}>
            {AMENITIES.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={[styles.chip, selectedAmenities.includes(amenity) && styles.chipActive]}
                onPress={() => toggleItem(selectedAmenities, setSelectedAmenities, amenity)}
              >
                <Text style={[styles.chipText, selectedAmenities.includes(amenity) && styles.chipTextActive]}>
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Section */}
          <Text style={styles.sectionLabel}>Informații contact</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Persoană de contact</Text>
            <TextInput
              testID="venue-contact-person-input"
              style={styles.textInput}
              placeholder="Ion Popescu"
              placeholderTextColor={colors.textTertiary}
              value={contactPerson}
              onChangeText={setContactPerson}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                testID="venue-phone-input"
                style={styles.textInput}
                placeholder="+40 7xx xxx xxx"
                placeholderTextColor={colors.textTertiary}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                testID="venue-email-input"
                style={styles.textInput}
                placeholder="contact@locatie.ro"
                placeholderTextColor={colors.textTertiary}
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Commission Tier */}
          <Text style={styles.sectionLabel}>Plan de vizibilitate</Text>
          <Text style={styles.sectionDesc}>Alege nivelul de comision pentru o vizibilitate crescută în rezultatele de căutare.</Text>
          
          {COMMISSION_TIERS.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={[styles.tierCard, commissionTier === tier.id && styles.tierCardActive]}
              onPress={() => setCommissionTier(tier.id)}
            >
              <View style={styles.tierRadio}>
                <Ionicons
                  name={commissionTier === tier.id ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={commissionTier === tier.id ? colors.primary : colors.textTertiary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tierLabel, commissionTier === tier.id && styles.tierLabelActive]}>{tier.label}</Text>
                <Text style={styles.tierDesc}>{tier.desc}</Text>
              </View>
              {tier.id !== 'standard' && (
                <Ionicons name={tier.id === 'elite' ? 'diamond' : 'star'} size={20} color={tier.id === 'elite' ? colors.primary : colors.info} />
              )}
            </TouchableOpacity>
          ))}

          {/* Images */}
          <Text style={styles.sectionLabel}>Imagini</Text>
          <View style={styles.field}>
            <Text style={styles.label}>URL-uri imagini (separate prin virgulă)</Text>
            <TextInput
              testID="venue-images-input"
              style={[styles.textInput, styles.textArea]}
              placeholder="https://example.com/img1.jpg, https://..."
              placeholderTextColor={colors.textTertiary}
              value={imageUrls}
              onChangeText={setImageUrls}
              multiline
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            testID="submit-venue-btn"
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.submitBtnText}>Publică Locația</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2, color: colors.textPrimary },
  sectionLabel: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionDesc: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md },
  label: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.bodyLg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textTransform: 'none',
  },
  row: { flexDirection: 'row', gap: spacing.md },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: radius.lg,
  },
  gpsBtnText: { ...typography.bodySm, color: colors.primary, fontWeight: '600' },
  priceTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceTypeBtnActive: { borderColor: colors.primary },
  priceTypeBtnText: { ...typography.bodySm, color: colors.textSecondary },
  priceTypeBtnTextActive: { color: colors.textPrimary, fontWeight: '600' },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: colors.background, fontWeight: '700' },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  tierRadio: {},
  tierLabel: { ...typography.bodyLg, color: colors.textSecondary, fontWeight: '600' },
  tierLabelActive: { color: colors.textPrimary },
  tierDesc: { ...typography.bodySm, color: colors.textTertiary, marginTop: 2 },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.full,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
});
