import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, ActivityIndicator, Animated
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { sendOtp, verifyOtp, clearError, resetOtpSent } from '../store/slices/authSlice';
import { useTheme } from '../theme/ThemeContext';

export default function LoginScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { loading, error, otpSent, email: savedEmail, devOtp } = useSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const otpSlide = useRef(new Animated.Value(20)).current;
  const otpFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: false }),
    ]).start();
  }, []);

  useEffect(() => {
    if (otpSent) {
      otpSlide.setValue(20);
      otpFade.setValue(0);
      Animated.parallel([
        Animated.timing(otpFade, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(otpSlide, { toValue: 0, duration: 500, useNativeDriver: false }),
      ]).start();
    }
  }, [otpSent]);

  useEffect(() => { dispatch(clearError()); }, [email, otp]);

  const s = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      overflow: 'hidden',
    },
    orb1: {
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: 200,
      top: '-5%',
      left: '-15%',
      backgroundColor: isDark ? '#10b981' : '#d97706',
      opacity: isDark ? 0.06 : 0.07,
      filter: 'blur(80px)',
    },
    orb2: {
      position: 'absolute',
      width: 350,
      height: 350,
      borderRadius: 175,
      bottom: '-8%',
      right: '-10%',
      backgroundColor: isDark ? '#6ee7b7' : '#f59e0b',
      opacity: isDark ? 0.05 : 0.08,
      filter: 'blur(80px)',
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: isDark ? 'rgba(17,17,17,0.92)' : 'rgba(255,253,245,0.95)',
      borderRadius: 24,
      padding: 36,
      borderWidth: 1,
      borderColor: theme.border,
      boxShadow: isDark
        ? '0 24px 60px rgba(0,0,0,0.7)'
        : '0 24px 60px rgba(120,80,10,0.1)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    brandIcon: {
      backgroundColor: theme.primaryLight,
      padding: 10,
      borderRadius: 12,
      marginRight: 10,
    },
    brandName: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.3,
    },
    themeBtn: {
      backgroundColor: theme.primaryLight,
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    headline: {
      fontSize: 30,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      letterSpacing: -0.8,
    },
    subline: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 21,
      marginBottom: 28,
    },
    notice: {
      flexDirection: 'row',
      backgroundColor: theme.primaryLight,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#1a3d2e' : '#fde68a',
      padding: 12,
      marginBottom: 24,
      alignItems: 'flex-start',
    },
    noticeText: {
      flex: 1,
      fontSize: 12,
      color: isDark ? '#6ee7b7' : '#92400e',
      marginLeft: 10,
      lineHeight: 18,
      fontWeight: '500',
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 6,
    },
    inputRowFocused: {
      borderColor: theme.primary,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 15,
      color: theme.text,
      outlineWidth: 0,
      marginLeft: 10,
    },
    hint: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 20,
      marginLeft: 4,
    },
    btn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    btnDisabled: {
      opacity: 0.6,
    },
    btnText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '700',
      marginRight: 8,
    },
    secondaryBtn: {
      marginTop: 12,
      alignItems: 'center',
      paddingVertical: 10,
    },
    secondaryBtnText: {
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    errorBanner: {
      flexDirection: 'row',
      backgroundColor: theme.dangerLight,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.danger + '30',
      padding: 12,
      marginBottom: 16,
      alignItems: 'center',
    },
    errorText: {
      flex: 1,
      color: theme.danger,
      fontSize: 13,
      marginLeft: 10,
      fontWeight: '500',
    },
    devBadge: {
      marginTop: 20,
      backgroundColor: isDark ? '#1a1a00' : '#fefce8',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#404000' : '#fde68a',
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    devCode: {
      marginLeft: 10,
      color: isDark ? '#fbbf24' : '#92400e',
      fontSize: 13,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 24,
    },
  });

  return (
    <View style={s.root}>
      <View style={s.orb1} />
      <View style={s.orb2} />

      <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={s.header}>
          <View style={s.brand}>
            <View style={s.brandIcon}>
              <Feather name="layers" size={20} color={theme.primary} />
            </View>
            <Text style={s.brandName}>TaskFlow</Text>
          </View>
          <TouchableOpacity style={s.themeBtn} onPress={toggleTheme}>
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <Text style={s.headline}>{otpSent ? 'Check your inbox' : 'Welcome back'}</Text>
        <Text style={s.subline}>
          {otpSent
            ? `We sent a 6-digit code to ${savedEmail}. Enter it below to sign in.`
            : 'Sign in or create an account using your email. No password needed.'}
        </Text>

        {!process.env.NODE_ENV || process.env.NODE_ENV !== 'production' ? (
          <View style={s.notice}>
            <Feather name="terminal" size={16} color={isDark ? '#10b981' : '#d97706'} />
            <Text style={s.noticeText}>
              Running in dev mode — OTP is printed to the backend terminal console. No email required.
            </Text>
          </View>
        ) : null}

        {error && (
          <View style={s.errorBanner}>
            <Feather name="alert-circle" size={16} color={theme.danger} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {!otpSent ? (
          <View>
            <Text style={s.label}>Email Address</Text>
            <View style={s.inputRow}>
              <Feather name="mail" size={18} color={theme.textSecondary} />
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Text style={s.hint}>A new account is created automatically for new emails.</Text>
            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={s.btnText}>Continue with Email</Text>
                    <Feather name="arrow-right" size={18} color="#fff" />
                  </>
              }
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={{ opacity: otpFade, transform: [{ translateY: otpSlide }] }}>
            <Text style={s.label}>Verification Code</Text>
            <View style={s.inputRow}>
              <Feather name="shield" size={18} color={theme.textSecondary} />
              <TextInput
                style={s.input}
                placeholder="000000"
                placeholderTextColor={theme.textSecondary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <Text style={s.hint}>Code expires in 5 minutes.</Text>
            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={s.btnText}>Verify & Sign In</Text>
                    <Feather name="check-circle" size={18} color="#fff" />
                  </>
              }
            </TouchableOpacity>
            <TouchableOpacity style={s.secondaryBtn} onPress={() => dispatch(resetOtpSent())}>
              <Text style={s.secondaryBtnText}>← Use a different email</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {otpSent && devOtp && (
          <View style={s.devBadge}>
            <Feather name="zap" size={16} color={isDark ? '#fbbf24' : '#d97706'} />
            <Text style={s.devCode}>DEV OTP: <Text style={{ fontWeight: '800', fontSize: 16 }}>{devOtp}</Text></Text>
          </View>
        )}
      </Animated.View>
    </View>
  );

  function handleSendOtp() { if (email) dispatch(sendOtp(email)); }
  function handleVerifyOtp() { if (otp) dispatch(verifyOtp({ email: savedEmail, otp })); }
}
