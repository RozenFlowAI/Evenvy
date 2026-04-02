import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eroare', 'Completează email și parolă');
      return;
    }
    if (!isLogin) {
      if (!firstName.trim() || !lastName.trim()) { Alert.alert('Eroare', 'Completează prenumele și numele'); return; }
      if (password !== confirmPassword) { Alert.alert('Eroare', 'Parolele nu coincid'); return; }
      if (password.length < 6) { Alert.alert('Eroare', 'Parola trebuie să aibă minim 6 caractere'); return; }
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password: password,
          phone: phone.trim(),
          role: role as 'client' | 'owner',
        });
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Eroare', e.message || 'A apărut o eroare');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity testID="auth-close-btn" style={[styles.closeBtn, { backgroundColor: c.surfaceHighlight }]} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={c.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="diamond" size={32} color={c.primary} />
            <Text style={[styles.title, { color: c.textPrimary }]}>{isLogin ? 'Autentificare' : 'Înregistrare'}</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              {isLogin ? 'Bine ai revenit pe Evenvy' : 'Creează un cont pentru a începe'}
            </Text>
          </View>

          {/* Role Selection (Register only) - like ouido.ro */}
          {!isLogin && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Sunt un...</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  testID="role-client-btn"
                  style={[styles.roleOption, { backgroundColor: c.surfaceHighlight, borderColor: c.border }, role === 'client' && { borderColor: c.primary, backgroundColor: c.primary + '15' }]}
                  onPress={() => setRole('client')}
                >
                  <Ionicons name="search" size={22} color={role === 'client' ? c.primary : c.textTertiary} />
                  <Text style={[styles.roleLabel, { color: c.textSecondary }, role === 'client' && { color: c.primary }]}>Client</Text>
                  <Text style={[styles.roleDesc, { color: c.textTertiary }]}>Caut locații</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="role-owner-btn"
                  style={[styles.roleOption, { backgroundColor: c.surfaceHighlight, borderColor: c.border }, role === 'owner' && { borderColor: c.primary, backgroundColor: c.primary + '15' }]}
                  onPress={() => setRole('owner')}
                >
                  <Ionicons name="business" size={22} color={role === 'owner' ? c.primary : c.textTertiary} />
                  <Text style={[styles.roleLabel, { color: c.textSecondary }, role === 'owner' && { color: c.primary }]}>Proprietar</Text>
                  <Text style={[styles.roleDesc, { color: c.textTertiary }]}>Am locații</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Name fields */}
          {!isLogin && (
            <View style={styles.nameRow}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Prenume *</Text>
                <TextInput testID="auth-firstname-input" style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} placeholder="Ion" placeholderTextColor={c.textTertiary} value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Nume *</Text>
                <TextInput testID="auth-lastname-input" style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} placeholder="Popescu" placeholderTextColor={c.textTertiary} value={lastName} onChangeText={setLastName} />
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Email *</Text>
            <TextInput testID="auth-email-input" style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} placeholder="email@exemplu.com" placeholderTextColor={c.textTertiary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          {!isLogin && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Telefon</Text>
              <TextInput testID="auth-phone-input" style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} placeholder="+40 7xx xxx xxx" placeholderTextColor={c.textTertiary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Parolă *</Text>
            <View style={[styles.passwordWrap, { backgroundColor: c.surfaceHighlight, borderColor: c.border }]}>
              <TextInput testID="auth-password-input" style={[styles.passwordInput, { color: c.textPrimary }]} placeholder="••••••••" placeholderTextColor={c.textTertiary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity testID="toggle-password" onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={c.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {!isLogin && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Confirmă parola *</Text>
              <TextInput testID="auth-confirm-password" style={[styles.textInput, { backgroundColor: c.surfaceHighlight, borderColor: c.border, color: c.textPrimary }]} placeholder="••••••••" placeholderTextColor={c.textTertiary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
            </View>
          )}

          <TouchableOpacity testID="auth-submit-btn" style={[styles.submitBtn, { backgroundColor: c.primary }, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={c.background} /> : (
              <Text style={[styles.submitBtnText, { color: c.background }]}>{isLogin ? 'Autentifică-te' : 'Înregistrare'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: c.textSecondary }]}>{isLogin ? 'Nu ai cont? ' : 'Ai deja cont? '}</Text>
            <TouchableOpacity testID="auth-toggle-btn" onPress={() => setIsLogin(!isLogin)}>
              <Text style={[styles.toggleLink, { color: c.primary }]}>{isLogin ? 'Înregistrare' : 'Autentificare'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 16 },
  closeBtn: { alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginVertical: 24, gap: 8 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 16, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textInput: { borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1 },
  passwordInput: { flex: 1, fontSize: 16, paddingVertical: 14 },
  nameRow: { flexDirection: 'row', gap: 16 },
  roleRow: { flexDirection: 'row', gap: 16 },
  roleOption: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 16, borderRadius: 12, borderWidth: 1 },
  roleLabel: { fontSize: 16, fontWeight: '600' },
  roleDesc: { fontSize: 14 },
  submitBtn: { paddingVertical: 16, borderRadius: 999, alignItems: 'center', marginTop: 24 },
  submitBtnText: { fontSize: 16, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  toggleText: { fontSize: 16 },
  toggleLink: { fontSize: 16, fontWeight: '700' },
});
