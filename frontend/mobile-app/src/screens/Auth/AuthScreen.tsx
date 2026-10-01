// AuthScreen — login / register / password reset.
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AuthService } from '../../services';
import { SIGNAL } from '../../utils/theme';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

type Mode = 'login' | 'register' | 'reset';

export default function AuthScreen() {
  const { t, resolved } = useTheme();
  const setUser = useAuthStore((s) => s.setUser);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const u = await AuthService.login(email, password);
        setUser(u);
      } else if (mode === 'register') {
        const u = await AuthService.register(email, password, name, phone);
        setUser(u);
      } else {
        await AuthService.resetPassword(email);
        setSuccess('Password reset email sent.');
      }
    } catch (err) {
      setError(AuthService.cleanError(err));
    } finally {
      setLoading(false);
    }
  };

  const input = {
    backgroundColor: resolved === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(23,26,33,0.04)',
    borderColor: resolved === 'dark' ? 'rgba(255, 255, 255, 0.09)' : '#E2E8F0',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: t.text,
    fontSize: 14,
    marginBottom: 12,
  } as const;

  const title = mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Reset password';
  const subtitle =
    mode === 'login'
      ? 'Access your emergency profile'
      : mode === 'register'
      ? 'Join the ResQLink network'
      : 'Enter your email and we’ll send a reset link';
  const cta =
    loading ? 'Processing…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset email';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.bg }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoOuter}>
            <View style={styles.logoMiddle}>
              <View style={styles.logoInner}>
                <Feather name="radio" size={22} color="#F0F1F3" />
              </View>
            </View>
          </View>
          <Text style={{ color: '#F0F1F3', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 }}>ResQLink</Text>
          <Text style={{ color: '#767C87', fontSize: 13, marginTop: 4, fontWeight: '600' }}>Emergency Rescue Network</Text>
        </View>

        {/* Card */}
        <View style={{ padding: 20, flex: 1 }}>
          <View
            style={{
              backgroundColor: resolved === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
              borderRadius: 26,
              borderWidth: 1,
              borderColor: resolved === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(23,26,33,0.08)',
              borderTopColor: resolved === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.9)',
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: resolved === 'dark' ? 0.3 : 0.08,
              shadowRadius: 28,
              elevation: 6,
            }}
          >
            <Text style={{ color: t.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
            <Text style={{ color: t.dim, fontSize: 13, marginTop: 4, marginBottom: 20 }}>{subtitle}</Text>

            {!!error && (
              <View style={[styles.errorBox, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Feather name="alert-triangle" size={14} color="#f87171" />
                <Text style={{ color: '#f87171', fontSize: 13, flex: 1 }}>{error}</Text>
              </View>
            )}
            {!!success && (
              <View style={[styles.successBox, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Feather name="check-circle" size={14} color="#34d399" />
                <Text style={{ color: '#34d399', fontSize: 13, flex: 1 }}>{success}</Text>
              </View>
            )}

            {mode === 'register' && (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={t.dim}
                style={input}
              />
            )}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={t.dim}
              autoCapitalize="none"
              keyboardType="email-address"
              style={input}
            />
            {mode === 'register' && (
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number (optional)"
                placeholderTextColor={t.dim}
                keyboardType="phone-pad"
                style={input}
              />
            )}
            {mode !== 'reset' && (
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={t.dim}
                secureTextEntry
                style={input}
              />
            )}

            <Pressable
              onPress={submit}
              disabled={loading}
              style={({ pressed }) => [styles.primaryBtn, { opacity: loading || pressed ? 0.7 : 1 }]}
            >
              {loading ? (
                <ActivityIndicator color="#07080A" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.primaryBtnText}>{cta}</Text>
                  <Feather name="arrow-right" size={15} color="#07080A" />
                </View>
              )}
            </Pressable>

            {mode === 'login' && (
              <>
                <Pressable onPress={() => setMode('register')} style={[styles.ghostBtn, { borderColor: t.border2 }]}>
                  <Text style={{ color: t.soft, fontSize: 14 }}>New user? Create account</Text>
                </Pressable>
                <Pressable onPress={() => setMode('reset')} style={styles.linkBtn}>
                  <Text style={{ color: t.dim, fontSize: 13 }}>Forgot password?</Text>
                </Pressable>
              </>
            )}
            {mode !== 'login' && (
              <Pressable onPress={() => setMode('login')} style={[styles.linkBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }]}>
                <Feather name="arrow-left" size={12} color={t.dim} />
                <Text style={{ color: t.dim, fontSize: 13 }}>Back to sign in</Text>
              </Pressable>
            )}

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#0A0B10',
  },
  logoOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoMiddle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: SIGNAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SIGNAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  errorBox: {
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48,0.1)',
    borderColor: 'rgba(255, 59, 48,0.25)',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
  },
  successBox: {
    padding: 12,
    backgroundColor: 'rgba(63,203,140,0.1)',
    borderColor: 'rgba(63,203,140,0.25)',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: SIGNAL,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: SIGNAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 3,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  ghostBtn: {
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  linkBtn: { paddingVertical: 10, alignItems: 'center' },
});
