import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { rf, rw, PAGE_PADDING, KAV_BEHAVIOR, isSmallScreen } from '../../config/responsive';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
});

const primaryColor = '#2563eb';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, googleLogin } = useAuth();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        if (result.unverified) {
          navigation.navigate('Register', { email, requireVerification: true });
        } else {
          setError(result.error || 'Login failed.');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      const result = await googleLogin(idToken);
      if (!result.success) {
        setError(result.error || 'Google Login failed.');
      }
    } catch (err) {
      if (err.code !== 'SIGN_IN_CANCELLED') {
        setError('Google Login failed. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={KAV_BEHAVIOR}>
      <StatusBar barStyle="dark-content" backgroundColor="#eff6ff" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.title}>BookEase</Text>
            <Text style={styles.subtitle}>Universal Appointment Platform</Text>
          </View>

          <Text style={styles.formTitle}>Sign in</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeIcon size={rw(20)} color="#94a3b8" />
                  ) : (
                    <EyeSlashIcon size={rw(20)} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google" size={rw(20)} color="#0f172a" style={{ marginRight: rw(10) }} />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: PAGE_PADDING,
    paddingVertical: rw(24),
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: rw(24),
    padding: rw(isSmallScreen ? 18 : 24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: rw(24),
  },
  logo: {
    width: rw(60),
    height: rw(60),
    backgroundColor: primaryColor,
    borderRadius: rw(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rw(12),
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    color: '#ffffff',
    fontSize: rf(26),
    fontWeight: 'bold',
  },
  title: {
    fontSize: rf(24),
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: rf(13),
    color: '#64748b',
  },
  formTitle: {
    fontSize: rf(20),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: rw(16),
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: rw(12),
    marginBottom: rw(16),
  },
  errorText: {
    color: '#b91c1c',
    fontSize: rf(13),
    lineHeight: rf(18),
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: rw(16),
  },
  label: {
    fontSize: rf(14),
    fontWeight: '500',
    color: '#334155',
    marginBottom: rw(6),
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: rw(12),
    paddingHorizontal: rw(14),
    paddingVertical: rw(13),
    fontSize: rf(15),
    color: '#0f172a',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
    paddingRight: rw(44),
  },
  eyeIcon: {
    position: 'absolute',
    right: rw(14),
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: rw(14),
  },
  forgotPasswordText: {
    color: primaryColor,
    fontSize: rf(13),
    fontWeight: '500',
  },
  button: {
    backgroundColor: primaryColor,
    borderRadius: rw(12),
    paddingVertical: rw(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rw(4),
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: rf(15),
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: rw(18),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  dividerText: {
    color: '#64748b',
    paddingHorizontal: rw(10),
    fontSize: rf(11),
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: rw(12),
    paddingVertical: rw(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rw(6),
    flexDirection: 'row',
    width: '100%',
  },
  googleButtonText: {
    color: '#0f172a',
    fontSize: rf(15),
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rw(20),
  },
  footerText: {
    color: '#64748b',
    fontSize: rf(13),
  },
  linkText: {
    color: primaryColor,
    fontSize: rf(13),
    fontWeight: '600',
  },
});

export default LoginScreen;
