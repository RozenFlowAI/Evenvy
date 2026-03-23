import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, authHeaders } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

const EVENT_TYPES = [
  { id: 'wedding', label: 'Nuntă' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'party', label: 'Petrecere' },
  { id: 'birthday', label: 'Zi naștere' },
  { id: 'conference', label: 'Conferință' },
  { id: 'exhibition', label: 'Expoziție' },
];

export default function AddVenueScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState('');
  const [imageUrls, setImageUrls] = useState('');

  const toggleType = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name || !description || !location || !price || !capacity || selectedTypes.length === 0) {
      Alert.alert('Eroare', 'Completează toate câmpurile obligatorii');
      return;
    }
    if (!token) {
      router.push('/auth');
      return;
    }
    setSubmitting(true);
    try {
      const amenitiesList = amenities.split(',').map(a => a.trim()).filter(Boolean);
      const imagesList = imageUrls.split(',').map(u => u.trim()).filter(Boolean);

      await apiCall('/venues', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          name,
          description,
          location,
          price_per_event: parseFloat(price),
          capacity: parseInt(capacity),
          event_types: selectedTypes,
          amenities: amenitiesList,
          images: imagesList.length > 0 ? imagesList : [
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
          ],
          phone,
          email,
        }),
      });
      Alert.alert('Succes!', 'Locația a fost adăugată cu succes.', [
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

          {/* Name */}
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

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Descriere *</Text>
            <TextInput
              testID="venue-description-input"
              style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Descrie locația ta..."
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>Oraș / Adresă *</Text>
            <TextInput
              testID="venue-location-input"
              style={styles.textInput}
              placeholder="ex: București, Sector 1"
              placeholderTextColor={colors.textTertiary}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Price & Capacity */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Preț (€) *</Text>
              <TextInput
                testID="venue-price-input"
                style={styles.textInput}
                placeholder="2000"
                placeholderTextColor={colors.textTertiary}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Capacitate *</Text>
              <TextInput
                testID="venue-capacity-input"
                style={styles.textInput}
                placeholder="200"
                placeholderTextColor={colors.textTertiary}
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Event Types */}
          <View style={styles.field}>
            <Text style={styles.label}>Tip evenimente *</Text>
            <View style={styles.typesGrid}>
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  testID={`venue-type-${type.id}`}
                  style={[styles.typeChip, selectedTypes.includes(type.id) && styles.typeChipActive]}
                  onPress={() => toggleType(type.id)}
                >
                  <Text style={[styles.typeText, selectedTypes.includes(type.id) && styles.typeTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Phone & Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              testID="venue-phone-input"
              style={styles.textInput}
              placeholder="+40 7xx xxx xxx"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email contact</Text>
            <TextInput
              testID="venue-email-input"
              style={styles.textInput}
              placeholder="contact@locatie.ro"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Amenities */}
          <View style={styles.field}>
            <Text style={styles.label}>Facilități (separate prin virgulă)</Text>
            <TextInput
              testID="venue-amenities-input"
              style={styles.textInput}
              placeholder="Parcare, Catering, DJ, WiFi"
              placeholderTextColor={colors.textTertiary}
              value={amenities}
              onChangeText={setAmenities}
            />
          </View>

          {/* Image URLs */}
          <View style={styles.field}>
            <Text style={styles.label}>URL-uri imagini (separate prin virgulă)</Text>
            <TextInput
              testID="venue-images-input"
              style={[styles.textInput, { minHeight: 60, textAlignVertical: 'top' }]}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...typography.h2, color: colors.textPrimary },
  field: { marginBottom: spacing.md },
  label: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  textInput: {
    backgroundColor: colors.surfaceHighlight, borderRadius: radius.lg, padding: spacing.md,
    color: colors.textPrimary, ...typography.bodyLg, borderWidth: 1, borderColor: colors.border,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: {
    paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.full,
    backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '500' },
  typeTextActive: { color: colors.background, fontWeight: '700' },
  submitBtn: {
    backgroundColor: colors.primary, paddingVertical: 16, borderRadius: radius.full,
    alignItems: 'center', marginTop: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
});
