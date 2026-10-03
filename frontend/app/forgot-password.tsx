import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, Animated, Easing, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyRound, ChevronLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '../src/config/supabase';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // State untuk Custom Popup
  const [popup, setPopup] = useState({ visible: false, type: 'error', title: '', message: '' });
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  // 🔥 TAMBAHAN: Animasi Ikon Memantul (Sama dengan Login)
  const iconScale = useRef(new Animated.Value(0)).current;

  // Animasi Latar
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(30), []);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }), Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 100, useNativeDriver: true })]).start();

    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [fadeAnim, slideAnim, rotateAnim]);

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
      // 🔥 TAMBAHAN: Eksekusi animasi memantul
      Animated.spring(iconScale, { toValue: 1, tension: 40, friction: 5, delay: 150, useNativeDriver: true }),
    ]).start();
  };

  const closePopup = (shouldRedirect: boolean = false) => {
    Animated.parallel([Animated.timing(popupScale, { toValue: 0.8, duration: 200, useNativeDriver: true }), Animated.timing(popupOpacity, { toValue: 0, duration: 200, useNativeDriver: true })]).start(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
      if (shouldRedirect) router.replace('/login');
    });
  };

  const handleResetPassword = async () => {
    if (!email) {
      showPopup('warning', 'Peringatan', 'Harap masukkan alamat email Anda.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'pahlawanar://update-password',
      });
      if (error) throw error;

      showPopup('success', 'Email Terkirim!', 'Silakan cek kotak masuk atau folder spam email Anda untuk instruksi reset password.');
    } catch (error: any) {
      showPopup('error', 'Gagal', error.message || 'Terjadi kesalahan saat mengirim link reset.');
    } finally {
      setLoading(false);
    }
  };

  const getPopupStyles = () => {
    switch (popup.type) {
      case 'success':
        return { icon: <CheckCircle2 size={56} color="#10B981" />, color: '#10B981', btnText: 'Kembali ke Login' };
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

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.formContainer}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%' }}>
            <View style={styles.iconWrap}>
              <KeyRound size={48} color="#D4AF37" />
            </View>

            <Text style={styles.title}>Lupa Password?</Text>
            <Text style={styles.subtitle}>Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.</Text>

            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Terdaftar</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Masukkan email Anda..." placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>KIRIM LINK RESET</Text>}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={popup.visible} transparent animationType="none" onRequestClose={() => closePopup(popup.type === 'success')}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: popupOpacity, transform: [{ scale: popupScale }] }]}>
            {/* 🔥 TAMBAHAN: Bungkus Ikon dengan Animated.View agar bisa memantul */}
            <Animated.View style={[styles.modalIconWrap, { transform: [{ scale: iconScale }] }]}>{popupStyle.icon}</Animated.View>

            <Text style={[styles.modalTitle, { color: popupStyle.color }]}>{popup.title}</Text>
            <Text style={styles.modalMessage}>{popup.message}</Text>

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: popupStyle.color }]} onPress={() => closePopup(popup.type === 'success')}>
              <Text style={styles.modalButtonText}>{popupStyle.btnText}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B0000', overflow: 'hidden' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 20, padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  decorCircle: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.05)' },
  circleTop: { width: width * 1.4, height: width * 1.4, top: -width * 0.7, right: -width * 0.4, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  circleBottom: { width: width * 0.8, height: width * 0.8, bottom: -width * 0.3, left: -width * 0.3 },
  formContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 10 },
  iconWrap: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 32, lineHeight: 22, paddingHorizontal: 16 },
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
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#8B0000', marginBottom: 8, letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  input: { flex: 1, padding: 16, fontSize: 15, color: '#1E293B' },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 1 },

  // 🔥 PERBAIKAN: Background transparan ('transparent') tanpa hitam gelap
  modalOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 15 },
  modalIconWrap: { marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
