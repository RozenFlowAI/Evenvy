import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/constants/theme';
import { apiCall, authHeaders, EVENT_TYPE_LABELS } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

export default function RequestQuoteScreen() {
  const router = useRouter();
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { token, user } = useAuth();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [eventType, setEventType] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    apiCall(`/venues/${venueId}`).then(setVenue).catch(console.error).finally(() => setLoading(false));
  }, [venueId]);

  const handleSubmit = async () => {
    if (!eventDate || !guestCount || !eventType) {
      Alert.alert('Eroare', 'Completează data, numărul de invitați și tipul evenimentului');
      return;
    }
    if (!token) { router.push('/auth'); return; }
    setSubmitting(true);
    try {
      await apiCall('/quotes', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          venue_id: venueId, event_date: eventDate,
          guest_count: parseInt(guestCount), event_type: eventType,
          message, client_phone: phone,
        }),
      });
      Alert.alert(
        'Cerere trimisă!',
        'Proprietarul locației va fi notificat și te va contacta cu o ofertă personalizată.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/bookings') }]
      );
    } catch (e: any) { Alert.alert('Eroare', e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator testID="quote-loading" size="large" color={colors.primary} style={{ flex: 1 }} /></SafeAreaView>;

  const eventTypes = Object.entries(EVENT_TYPE_LABELS);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity testID="quote-close-btn" style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Cere ofertă de preț</Text>
            <View style={{ width: 40 }} />
          </View>

          {venue && (
            <View style={styles.venueCard} testID="quote-venue-info">
              <Ionicons name="business" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueCity}>{venue.city}</Text>
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Data evenimentului *</Text>
            <TextInput testID="quote-date-input" style={styles.textInput} placeholder="ex: 15 Iunie 2026" placeholderTextColor={colors.textTertiary} value={eventDate} onChangeText={setEventDate} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Număr invitați *</Text>
            <TextInput testID="quote-guests-input" style={styles.textInput} placeholder="ex: 150" placeholderTextColor={colors.textTertiary} value={guestCount} onChangeText={setGuestCount} keyboardType="numeric" />
            {venue && <Text style={styles.hint}>Capacitate: {venue.capacity_min}-{venue.capacity_max} persoane</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tip eveniment *</Text>
            <View style={styles.typesGrid}>
              {eventTypes.map(([id, label]) => (
                <TouchableOpacity key={id} testID={`quote-type-${id}`}
                  style={[styles.typeChip, eventType === id && styles.typeChipActive]}
                  onPress={() => setEventType(id)}>
                  <Text style={[styles.typeText, eventType === id && styles.typeTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefon de contact</Text>
            <TextInput testID="quote-phone-input" style={styles.textInput} placeholder="+40 7xx xxx xxx" placeholderTextColor={colors.textTertiary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mesaj (opțional)</Text>
            <TextInput testID="quote-message-input" style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="Detalii suplimentare despre evenimentul tău..." placeholderTextColor={colors.textTertiary} value={message} onChangeText={setMessage} multiline />
          </View>

          <TouchableOpacity testID="quote-submit-btn" style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.submitBtnText}>Trimite cererea</Text>}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>Proprietarul locației va fi notificat și te va contacta direct cu o ofertă personalizată.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, color: colors.textPrimary },
  venueCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  venueName: { ...typography.bodyLg, color: colors.textPrimary, fontWeight: '600' },
  venueCity: { ...typography.bodySm, color: colors.textSecondary },
  field: { marginBottom: spacing.md },
  label: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  textInput: { backgroundColor: colors.surfaceHighlight, borderRadius: radius.lg, padding: spacing.md, color: colors.textPrimary, ...typography.bodyLg, borderWidth: 1, borderColor: colors.border },
  hint: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs, textTransform: 'none' },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.full, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.border },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '500' },
  typeTextActive: { color: colors.background, fontWeight: '700' },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.sm },
  submitBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
  disclaimer: { ...typography.bodySm, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md },
});
