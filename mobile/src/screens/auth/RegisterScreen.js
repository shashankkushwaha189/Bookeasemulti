import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
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

const RegisterScreen = ({ navigation, route }) => {
  const [form, setForm] = useState({
    name: '',
    email: route?.params?.email || '',
    password: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(route?.params?.requireVerification || false);
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const { register, verifyOtp, googleLogin, triggerNavigation } = useAuth();

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in required fields (Name, Email, Password)');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await register({ ...form, role: 'CUSTOMER' });
      if (!result.success) {
        setError(result.error || 'Registration failed.');
      } else {
        setIsOtpSent(true);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (directOtp = null) => {
    setError('');
    setSuccess('');
    const codeToVerify = directOtp || otp;
    if (codeToVerify.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOtp(form.email, codeToVerify);
      if (!result.success) {
        setError(result.error || 'Verification failed.');
      } else {
        setSuccess('Account verified successfully! Redirecting...');
        setTimeout(() => triggerNavigation(), 1000);
      }
    } catch {
      setError('Unexpected error during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);
    try {
      await register({ ...form, role: 'CUSTOMER' });
      setSuccess('New OTP sent to your email!');
      setOtp('');
    } catch (err) {
      setError(err.error || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
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
        setError(result.error || 'Google Authentication failed.');
      }
    } catch (err) {
      if (err.code !== 'SIGN_IN_CANCELLED') {
        setError('Google Authentication failed. ' + err.message);
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.title}>BookEase</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <Text style={styles.formTitle}>
            {isOtpSent ? 'Verify your email' : 'Create account'}
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          {!isOtpSent ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jane Smith"
                  value={form.name}
                  onChangeText={(val) => updateForm('name', val)}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  value={form.email}
                  onChangeText={(val) => updateForm('email', val)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChangeText={(val) => updateForm('phone', val)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChangeText={(val) => updateForm('password', val)}
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

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Create account</Text>
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
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.linkText}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Enter the 6-digit code sent to{'\n'}
                  <Text style={{ color: primaryColor, fontWeight: '600' }}>{form.email}</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(val) => {
                    const numericVal = val.replace(/\D/g, '');
                    setOtp(numericVal);
                    if (numericVal.length === 6) handleVerifyOtp(numericVal);
                  }}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => handleVerifyOtp()}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading} activeOpacity={0.8}>
                  <Text style={styles.resendText}>
                    {resendLoading ? 'Sending...' : "Didn't receive the code? Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                  <Text style={styles.linkText}>← Back to Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    marginBottom: rw(20),
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
    marginBottom: rw(14),
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: rw(12),
    marginBottom: rw(14),
  },
  errorText: {
    color: '#b91c1c',
    fontSize: rf(13),
    lineHeight: rf(18),
  },
  successContainer: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: rw(12),
    marginBottom: rw(14),
  },
  successText: {
    color: '#059669',
    fontSize: rf(13),
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: rw(14),
  },
  label: {
    fontSize: rf(14),
    fontWeight: '500',
    color: '#334155',
    marginBottom: rw(6),
    lineHeight: rf(20),
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
  otpInput: {
    textAlign: 'center',
    fontSize: rf(28),
    letterSpacing: rw(8),
    marginTop: rw(10),
    fontWeight: '700',
    color: primaryColor,
  },
  button: {
    backgroundColor: primaryColor,
    borderRadius: rw(12),
    paddingVertical: rw(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rw(8),
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
    marginVertical: rw(16),
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
    flexWrap: 'wrap',
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
  resendContainer: {
    alignItems: 'center',
    marginTop: rw(14),
  },
  resendText: {
    color: primaryColor,
    fontSize: rf(13),
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default RegisterScreen;
