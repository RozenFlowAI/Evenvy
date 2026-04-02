import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../src/context/ThemeContext';
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
  const { theme } = useTheme();
  const c = theme.colors;
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
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity testID="add-venue-close-btn" style={[styles.closeBtn, { backgroundColor: c.surfaceHighlight }]} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={c.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: c.textPrimary }]}>Adaugă Locație</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Basic Info Section */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Informații de bază</Text>
          
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Numele locației *</Text>
            <TextInput
              testID="venue-name-input"
              style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
              placeholder="ex: Palatul Regilor"
              placeholderTextColor={c.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Descriere *</Text>
            <TextInput
              testID="venue-description-input"
              style={[styles.textInput, styles.textArea, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
              placeholder="Descrie locația ta, atmosfera, ce o face specială..."
              placeholderTextColor={c.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Reguli și informații importante</Text>
            <TextInput
              testID="venue-rules-input"
              style={[styles.textInput, styles.textArea, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
              placeholder="ex: Se interzice fumatul în interior. Muzica se oprește la ora 23:00..."
              placeholderTextColor={c.textTertiary}
              value={rules}
              onChangeText={setRules}
              multiline
            />
            <Text style={[styles.hint, { color: c.textTertiary }]}>Regulile vor fi afișate separat pe pagina locației</Text>
          </View>

          {/* Location Section */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Locație</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Oraș *</Text>
              <TextInput
                testID="venue-city-input"
                style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
                placeholder="București"
                placeholderTextColor={c.textTertiary}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Adresă completă</Text>
            <TextInput
              testID="venue-address-input"
              style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
              placeholder="Strada, Număr, Sector"
              placeholderTextColor={c.textTertiary}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Coordonate GPS (pentru hartă)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.textInput, { flex: 1, backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
                placeholder="Latitudine"
                placeholderTextColor={c.textTertiary}
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.textInput, { flex: 1, backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
                placeholder="Longitudine"
                placeholderTextColor={c.textTertiary}
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={[styles.gpsBtn, { backgroundColor: c.primary + '15' }]}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color={c.primary} />
              ) : (
                <>
                  <Ionicons name="locate" size={18} color={c.primary} />
                  <Text style={[styles.gpsBtnText, { color: c.primary }]}>Folosește locația curentă</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Capacity & Pricing Section */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Capacitate și prețuri</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Capacitate min *</Text>
              <TextInput
                testID="venue-capacity-min-input"
                style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
                placeholder="50"
                placeholderTextColor={c.textTertiary}
                value={capacityMin}
                onChangeText={setCapacityMin}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Capacitate max *</Text>
              <TextInput
                testID="venue-capacity-max-input"
                style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
                placeholder="300"
                placeholderTextColor={c.textTertiary}
                value={capacityMax}
                onChangeText={setCapacityMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Tip preț</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.priceTypeBtn, { backgroundColor: c.surfaceHighlight, borderColor: c.border }, priceType === 'on_request' && { borderColor: c.primary }]}
                onPress={() => setPriceType('on_request')}
              >
                <Ionicons name={priceType === 'on_request' ? 'radio-button-on' : 'radio-button-off'} size={20} color={priceType === 'on_request' ? c.primary : c.textTertiary} />
                <Text style={[styles.priceTypeBtnText, { color: c.textSecondary }, priceType === 'on_request' && { color: c.textPrimary, fontWeight: '600' }]}>La cerere</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.priceTypeBtn, { backgroundColor: c.surfaceHighlight, borderColor: c.border }, priceType === 'fixed' && { borderColor: c.primary }]}
                onPress={() => setPriceType('fixed')}
              >
                <Ionicons name={priceType === 'fixed' ? 'radio-button-on' : 'radio-button-off'} size={20} color={priceType === 'fixed' ? c.primary : c.textTertiary} />
                <Text style={[styles.priceTypeBtnText, { color: c.textSecondary }, priceType === 'fixed' && { color: c.textPrimary, fontWeight: '600' }]}>Preț fix</Text>
              </TouchableOpacity>
            </View>
          </View>

          {priceType === 'fixed' && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Preț per persoană (€)</Text>
              <TextInput
                testID="venue-price-input"
                style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
                placeholder="75"
                placeholderTextColor={c.textTertiary}
                value={pricePerPerson}
                onChangeText={setPricePerPerson}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Event Types */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Tip evenimente *</Text>
          <View style={styles.chipsGrid}>
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                testID={`venue-type-${type.id}`}
                style={[styles.chip, { backgroundColor: c.surfaceHighlight, borderColor: c.border }, selectedTypes.includes(type.id) && { backgroundColor: c.primary, borderColor: c.primary }]}
                onPress={() => toggleItem(selectedTypes, setSelectedTypes, type.id)}
              >
                <Text style={[styles.chipText, { color: c.textSecondary }, selectedTypes.includes(type.id) && { color: c.background, fontWeight: '700' }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Style Tags */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Stil locație</Text>
          <View style={styles.chipsGrid}>
            {STYLE_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.chip, { backgroundColor: c.surfaceHighlight, borderColor: c.border }, selectedStyles.includes(tag) && { backgroundColor: c.primary, borderColor: c.primary }]}
                onPress={() => toggleItem(selectedStyles, setSelectedStyles, tag)}
              >
                <Text style={[styles.chipText, { color: c.textSecondary }, selectedStyles.includes(tag) && { color: c.background, fontWeight: '700' }]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amenities */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Facilități</Text>
          <View style={styles.chipsGrid}>
            {AMENITIES.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={[styles.chip, { backgroundColor: c.surfaceHighlight, borderColor: c.border }, selectedAmenities.includes(amenity) && { backgroundColor: c.primary, borderColor: c.primary }]}
                onPress={() => toggleItem(selectedAmenities, setSelectedAmenities, amenity)}
              >
                <Text style={[styles.chipText, { color: c.textSecondary }, selectedAmenities.includes(amenity) && { color: c.background, fontWeight: '700' }]}>
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Section */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Informații contact</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Persoană de contact</Text>
            <TextInput
              testID="venue-contact-person-input"
              style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
              placeholder="Ion Popescu"
              placeholderTextColor={c.textTertiary}
              value={contactPerson}
              onChangeText={setContactPerson}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Telefon</Text>
              <TextInput
                testID="venue-phone-input"
                style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
                placeholder="+40 7xx xxx xxx"
                placeholderTextColor={c.textTertiary}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Email</Text>
              <TextInput
                testID="venue-email-input"
                style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
                placeholder="contact@locatie.ro"
                placeholderTextColor={c.textTertiary}
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Commission Tier */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Plan de vizibilitate</Text>
          <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>Alege nivelul de comision pentru o vizibilitate crescută în rezultatele de căutare.</Text>
          
          {COMMISSION_TIERS.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={[styles.tierCard, { backgroundColor: c.surfaceHighlight, borderColor: c.border }, commissionTier === tier.id && { borderColor: c.primary, backgroundColor: c.primary + '10' }]}
              onPress={() => setCommissionTier(tier.id)}
            >
              <View style={styles.tierRadio}>
                <Ionicons
                  name={commissionTier === tier.id ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={commissionTier === tier.id ? c.primary : c.textTertiary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tierLabel, { color: c.textSecondary }, commissionTier === tier.id && { color: c.textPrimary }]}>{tier.label}</Text>
                <Text style={[styles.tierDesc, { color: c.textTertiary }]}>{tier.desc}</Text>
              </View>
              {tier.id !== 'standard' && (
                <Ionicons name={tier.id === 'elite' ? 'diamond' : 'star'} size={20} color={tier.id === 'elite' ? c.primary : c.info} />
              )}
            </TouchableOpacity>
          ))}

          {/* Images */}
          <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Imagini</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>URL-uri imagini (separate prin virgulă)</Text>
            <TextInput
              testID="venue-images-input"
              style={[styles.textInput, styles.textArea, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]}
              placeholder="https://example.com/img1.jpg, https://..."
              placeholderTextColor={c.textTertiary}
              value={imageUrls}
              onChangeText={setImageUrls}
              multiline
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            testID="submit-venue-btn"
            style={[styles.submitBtn, { backgroundColor: c.primary }, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={c.background} />
            ) : (
              <Text style={[styles.submitBtnText, { color: c.background }]}>Publică Locația</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '600' },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  row: { flexDirection: 'row', gap: 16 },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gpsBtnText: { fontSize: 14, fontWeight: '600' },
  priceTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  priceTypeBtnText: { fontSize: 14 },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '500' },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  tierRadio: {},
  tierLabel: { fontSize: 16, fontWeight: '600' },
  tierDesc: { fontSize: 14, marginTop: 2 },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700' },
});
