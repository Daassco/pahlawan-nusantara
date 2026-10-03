import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, Animated, Easing, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '../src/config/supabase';

const { width } = Dimensions.get('window');

const translateError = (errorMsg: string) => {
  if (!errorMsg) return 'Terjadi kesalahan yang tidak diketahui.';
  const msg = errorMsg.toLowerCase();

  if (msg.includes('invalid login credentials')) return 'Email atau password yang Anda masukkan salah. Silakan periksa kembali.';
  if (msg.includes('email not confirmed')) return 'Email Anda belum diverifikasi. Silakan cek kotak masuk email Anda.';
  if (msg.includes('network') || msg.includes('fetch')) return 'Terjadi masalah jaringan. Pastikan perangkat Anda terhubung ke internet.';
  if (msg.includes('rate limit')) return 'Anda terlalu sering mencoba login. Tunggu beberapa saat sebelum mencoba lagi.';

  return errorMsg;
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [popup, setPopup] = useState({ visible: false, type: 'error', title: '', message: '' });
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  // 🔥 TAMBAHAN: Animasi khusus untuk Ikon di dalam Pop-up
  const iconScale = useRef(new Animated.Value(0)).current;

  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.6), []);
  const slideAnim = useMemo(() => new Animated.Value(30), []);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 30, friction: 6, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [fadeAnim, scaleAnim, slideAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const showPopup = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setPopup({ visible: true, type, title, message });
    iconScale.setValue(0); // Reset animasi ikon
    Animated.parallel([
      Animated.spring(popupScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      // 🔥 TAMBAHAN: Efek memantul pada ikon setelah delay sebentar
      Animated.spring(iconScale, { toValue: 1, tension: 40, friction: 5, delay: 150, useNativeDriver: true }),
    ]).start();
  };

  const closePopup = () => {
    Animated.parallel([Animated.timing(popupScale, { toValue: 0.8, duration: 200, useNativeDriver: true }), Animated.timing(popupOpacity, { toValue: 0, duration: 200, useNativeDriver: true })]).start(() =>
      setPopup((prev) => ({ ...prev, visible: false })),
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showPopup('warning', 'Peringatan', 'Email dan password tidak boleh kosong!');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Data pengguna tidak ditemukan.');
      }

      showPopup('success', 'Berhasil', 'Login sukses! Mengalihkan ke Beranda...');
      setTimeout(() => {
        closePopup();
        router.replace('/home');
      }, 1500);
    } catch (error: any) {
      const detailError = translateError(error.message);
      showPopup('error', 'Gagal Login', detailError);
    } finally {
      setLoading(false);
    }
  };

  const getPopupStyles = () => {
    switch (popup.type) {
      case 'success':
        return { icon: <CheckCircle2 size={56} color="#10B981" />, color: '#10B981', btnText: 'Selesai' };
      case 'warning':
        return { icon: <AlertTriangle size={56} color="#F59E0B" />, color: '#F59E0B', btnText: 'Mengerti' };
      default:
        return { icon: <XCircle size={56} color="#EF4444" />, color: '#EF4444', btnText: 'Coba Lagi' };
    }
  };

  const popupStyle = getPopupStyles();

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <LinearGradient colors={['#8B0000', '#CE1126', '#A60D1D']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.decorCircle, styles.circleTop, { transform: [{ rotate }] }]} />
      <View style={[styles.decorCircle, styles.circleBottom]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.formContainer}>
          <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Shield size={40} color="#D4AF37" fill="#FFF8E1" />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%' }}>
            <Text style={styles.title}>PAHLAWAN</Text>
            <Text style={styles.titleAccent}>NUSANTARA</Text>

            <View style={styles.divider} />
            <Text style={styles.subtitle}>Silakan masuk dengan akun Anda</Text>

            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Masukkan email..." placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Masukkan password..." placeholderTextColor="#94A3B8" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIconContainer}>
                    {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotPasswordWrap}>
                  <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>MASUK</Text>}
              </TouchableOpacity>

              <View style={styles.registerPrompt}>
                <Text style={styles.registerPromptText}>Belum punya akun? </Text>
                <TouchableOpacity onPress={() => router.replace('/register')}>
                  <Text style={styles.registerPromptLink}>Daftar di sini</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={popup.visible} transparent animationType="none" onRequestClose={closePopup}>
        {/* 🔥 PERBAIKAN: Background transparan tanpa warna hitam */}
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: popupOpacity, transform: [{ scale: popupScale }] }]}>
            {/* 🔥 PERBAIKAN: Wrapper Icon diberi animasi memantul */}
            <Animated.View style={[styles.modalIconWrap, { transform: [{ scale: iconScale }] }]}>{popupStyle.icon}</Animated.View>

            <Text style={[styles.modalTitle, { color: popupStyle.color }]}>{popup.title}</Text>
            <Text style={styles.modalMessage}>{popup.message}</Text>

            {popup.type !== 'success' && (
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: popupStyle.color }]} onPress={closePopup}>
                <Text style={styles.modalButtonText}>{popupStyle.btnText}</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B0000', overflow: 'hidden' },
  decorCircle: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.05)' },
  circleTop: { width: width * 1.4, height: width * 1.4, top: -width * 0.7, right: -width * 0.4, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  circleBottom: { width: width * 0.8, height: width * 0.8, bottom: -width * 0.3, left: -width * 0.3 },
  formContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 10 },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4, textAlign: 'center' },
  titleAccent: { fontSize: 16, fontWeight: '300', color: '#D4AF37', letterSpacing: 8, textAlign: 'center', marginTop: -4 },
  divider: { width: 40, height: 2, backgroundColor: '#D4AF37', alignSelf: 'center', marginVertical: 12 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 32, fontWeight: '500' },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#8B0000', marginBottom: 8, letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  input: { flex: 1, padding: 16, fontSize: 15, color: '#1E293B' },
  rightIconContainer: { paddingRight: 16, justifyContent: 'center' },

  forgotPasswordWrap: { alignSelf: 'flex-end', marginTop: 10 },
  forgotPasswordText: { color: '#8B0000', fontSize: 13, fontWeight: '700' },

  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  registerPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerPromptText: { color: '#64748B', fontSize: 14 },
  registerPromptLink: { color: '#8B0000', fontSize: 14, fontWeight: '700' },

  // 🔥 PERBAIKAN: Hapus background 'rgba(0,0,0,0.6)'
  modalOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 15 },
  modalIconWrap: { marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
