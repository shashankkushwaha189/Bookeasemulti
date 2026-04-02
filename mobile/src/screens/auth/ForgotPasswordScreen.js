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
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from 'react-native-heroicons/outline';
import { authAPI } from '../../api';
import { rf, rw, PAGE_PADDING, KAV_BEHAVIOR, isSmallScreen } from '../../config/responsive';

const primaryColor = '#2563eb';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async () => {
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      setMessage(res.data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setMessage('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ email, otp, newPassword });
      setMessage(res.data.message || 'Password reset successfully. Redirecting to login...');
      setTimeout(() => navigation.navigate('Login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
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
              <LockClosedIcon size={rw(28)} color="#ffffff" />
            </View>
            <Text style={styles.title}>
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'We\'ll send a verification code to your email' : 'Enter the code and your new password'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{message}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {step === 1 ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Registered Email</Text>
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

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>6-Digit OTP</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="------"
                    maxLength={6}
                    value={otp}
                    onChangeText={(val) => setOtp(val.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChangeText={setNewPassword}
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
                  style={[styles.button, (loading || otp.length < 6) && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading || otp.length < 6}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.backContainer}>
                  <TouchableOpacity onPress={() => setStep(1)}>
                    <Text style={styles.backText}>← Back to email</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Back to Sign in</Text>
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
    marginBottom: rw(14),
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: rf(22),
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: rw(6),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: rf(13),
    color: '#64748b',
    textAlign: 'center',
    lineHeight: rf(19),
    paddingHorizontal: rw(8),
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
  successContainer: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: rw(12),
    marginBottom: rw(16),
  },
  successText: {
    color: '#059669',
    fontSize: rf(13),
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
  otpInput: {
    textAlign: 'center',
    fontSize: rf(24),
    letterSpacing: rw(8),
    marginTop: rw(8),
    fontWeight: '700',
    color: primaryColor,
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
  backContainer: {
    alignItems: 'center',
    marginTop: rw(14),
  },
  backText: {
    color: '#64748b',
    fontSize: rf(13),
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rw(22),
  },
  linkText: {
    color: primaryColor,
    fontSize: rf(13),
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
