import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
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
        await register(firstName.trim(), lastName.trim(), email.trim(), password, phone.trim(), role);
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Eroare', e.message || 'A apărut o eroare');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity testID="auth-close-btn" style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="diamond" size={32} color={colors.primary} />
            <Text style={styles.title}>{isLogin ? 'Autentificare' : 'Înregistrare'}</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Bine ai revenit pe Lumina' : 'Creează un cont pentru a începe'}
            </Text>
          </View>

          {/* Role Selection (Register only) - like ouido.ro */}
          {!isLogin && (
            <View style={styles.field}>
              <Text style={styles.label}>Sunt un...</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  testID="role-client-btn"
                  style={[styles.roleOption, role === 'client' && styles.roleActive]}
                  onPress={() => setRole('client')}
                >
                  <Ionicons name="search" size={22} color={role === 'client' ? colors.primary : colors.textTertiary} />
                  <Text style={[styles.roleLabel, role === 'client' && styles.roleLabelActive]}>Client</Text>
                  <Text style={styles.roleDesc}>Caut locații</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="role-owner-btn"
                  style={[styles.roleOption, role === 'owner' && styles.roleActive]}
                  onPress={() => setRole('owner')}
                >
                  <Ionicons name="business" size={22} color={role === 'owner' ? colors.primary : colors.textTertiary} />
                  <Text style={[styles.roleLabel, role === 'owner' && styles.roleLabelActive]}>Proprietar</Text>
                  <Text style={styles.roleDesc}>Am locații</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Name fields */}
          {!isLogin && (
            <View style={styles.nameRow}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Prenume *</Text>
                <TextInput testID="auth-firstname-input" style={styles.textInput} placeholder="Ion" placeholderTextColor={colors.textTertiary} value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Nume *</Text>
                <TextInput testID="auth-lastname-input" style={styles.textInput} placeholder="Popescu" placeholderTextColor={colors.textTertiary} value={lastName} onChangeText={setLastName} />
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput testID="auth-email-input" style={styles.textInput} placeholder="email@exemplu.com" placeholderTextColor={colors.textTertiary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          {!isLogin && (
            <View style={styles.field}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput testID="auth-phone-input" style={styles.textInput} placeholder="+40 7xx xxx xxx" placeholderTextColor={colors.textTertiary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Parolă *</Text>
            <View style={styles.passwordWrap}>
              <TextInput testID="auth-password-input" style={styles.passwordInput} placeholder="••••••••" placeholderTextColor={colors.textTertiary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity testID="toggle-password" onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {!isLogin && (
            <View style={styles.field}>
              <Text style={styles.label}>Confirmă parola *</Text>
              <TextInput testID="auth-confirm-password" style={styles.textInput} placeholder="••••••••" placeholderTextColor={colors.textTertiary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
            </View>
          )}

          <TouchableOpacity testID="auth-submit-btn" style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.background} /> : (
              <Text style={styles.submitBtnText}>{isLogin ? 'Autentifică-te' : 'Înregistrare'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>{isLogin ? 'Nu ai cont? ' : 'Ai deja cont? '}</Text>
            <TouchableOpacity testID="auth-toggle-btn" onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleLink}>{isLogin ? 'Înregistrare' : 'Autentificare'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.md },
  closeBtn: { alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginVertical: spacing.lg, gap: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.bodyLg, color: colors.textSecondary, textAlign: 'center' },
  field: { marginBottom: spacing.md },
  label: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  textInput: { backgroundColor: colors.surfaceHighlight, borderRadius: radius.lg, padding: spacing.md, color: colors.textPrimary, ...typography.bodyLg, borderWidth: 1, borderColor: colors.border },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceHighlight, borderRadius: radius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  passwordInput: { flex: 1, ...typography.bodyLg, color: colors.textPrimary, paddingVertical: 14 },
  nameRow: { flexDirection: 'row', gap: spacing.md },
  roleRow: { flexDirection: 'row', gap: spacing.md },
  roleOption: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.border },
  roleActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  roleLabel: { ...typography.bodyLg, color: colors.textSecondary, fontWeight: '600' },
  roleLabelActive: { color: colors.primary },
  roleDesc: { ...typography.bodySm, color: colors.textTertiary },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.lg },
  submitBtnText: { ...typography.bodyLg, color: colors.background, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  toggleText: { ...typography.bodyLg, color: colors.textSecondary },
  toggleLink: { ...typography.bodyLg, color: colors.primary, fontWeight: '700' },
});
