import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { apiCall, authHeaders, EVENT_TYPE_LABELS } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

export default function RequestQuoteScreen() {
  const router = useRouter();
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
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

  if (loading) return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ActivityIndicator testID="quote-loading" size="large" color={c.primary} style={{ flex: 1 }} />
    </SafeAreaView>
  );

  const eventTypes = Object.entries(EVENT_TYPE_LABELS);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity testID="quote-close-btn" style={[styles.closeBtn, { backgroundColor: c.surfaceHighlight }]} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={c.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: c.textPrimary }]}>Cere ofertă de preț</Text>
            <View style={{ width: 40 }} />
          </View>

          {venue && (
            <View style={[styles.venueCard, { backgroundColor: c.surface, borderColor: c.border }]} testID="quote-venue-info">
              <Ionicons name="business" size={20} color={c.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.venueName, { color: c.textPrimary }]}>{venue.name}</Text>
                <Text style={[styles.venueCity, { color: c.textSecondary }]}>{venue.city}</Text>
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Data evenimentului *</Text>
            <TextInput 
              testID="quote-date-input" 
              style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} 
              placeholder="ex: 15 Iunie 2026" 
              placeholderTextColor={c.textTertiary} 
              value={eventDate} 
              onChangeText={setEventDate} 
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Număr invitați *</Text>
            <TextInput 
              testID="quote-guests-input" 
              style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} 
              placeholder="ex: 150" 
              placeholderTextColor={c.textTertiary} 
              value={guestCount} 
              onChangeText={setGuestCount} 
              keyboardType="numeric" 
            />
            {venue && <Text style={[styles.hint, { color: c.textTertiary }]}>Capacitate: {venue.capacity_min}-{venue.capacity_max} persoane</Text>}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Tip eveniment *</Text>
            <View style={styles.typesGrid}>
              {eventTypes.map(([id, label]) => (
                <TouchableOpacity 
                  key={id} 
                  testID={`quote-type-${id}`}
                  style={[
                    styles.typeChip, 
                    { backgroundColor: c.surfaceHighlight, borderColor: c.border },
                    eventType === id && { backgroundColor: c.primary, borderColor: c.primary }
                  ]}
                  onPress={() => setEventType(id)}
                >
                  <Text style={[
                    styles.typeText, 
                    { color: c.textSecondary },
                    eventType === id && { color: c.background, fontWeight: '700' }
                  ]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Telefon de contact</Text>
            <TextInput 
              testID="quote-phone-input" 
              style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} 
              placeholder="+40 7xx xxx xxx" 
              placeholderTextColor={c.textTertiary} 
              value={phone} 
              onChangeText={setPhone} 
              keyboardType="phone-pad" 
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Mesaj (opțional)</Text>
            <TextInput 
              testID="quote-message-input" 
              style={[styles.textInput, styles.textArea, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} 
              placeholder="Detalii suplimentare despre evenimentul tău..." 
              placeholderTextColor={c.textTertiary} 
              value={message} 
              onChangeText={setMessage} 
              multiline 
            />
          </View>

          <TouchableOpacity 
            testID="quote-submit-btn" 
            style={[styles.submitBtn, { backgroundColor: c.primary }, submitting && { opacity: 0.7 }]} 
            onPress={handleSubmit} 
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={c.background} />
            ) : (
              <Text style={[styles.submitBtnText, { color: c.background }]}>Trimite cererea</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: c.textTertiary }]}>
            Proprietarul locației va fi notificat și te va contacta direct cu o ofertă personalizată.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600' },
  venueCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 24, 
    borderWidth: 1 
  },
  venueName: { fontSize: 16, fontWeight: '600' },
  venueCity: { fontSize: 14 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textInput: { 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    borderWidth: 1 
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontSize: 12, marginTop: 4 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 999, 
    borderWidth: 1 
  },
  typeText: { fontSize: 14, fontWeight: '500' },
  submitBtn: { 
    paddingVertical: 16, 
    borderRadius: 999, 
    alignItems: 'center', 
    marginTop: 8 
  },
  submitBtnText: { fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 14, textAlign: 'center', marginTop: 16 },
});
