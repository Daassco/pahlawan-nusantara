import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, Animated, Easing, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LockKeyhole, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '../src/config/supabase';

const { width } = Dimensions.get('window');

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState({ visible: false, type: 'error', title: '', message: '' });
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(30), []);

  useEffect(() => {
    Animated.parallel([Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }), Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 100, useNativeDriver: true })]).start();
  }, [fadeAnim, slideAnim]);

  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({ visible: true, type, title, message });
    Animated.parallel([Animated.spring(popupScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }), Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: true })]).start();
  };

  const closePopup = (shouldRedirect: boolean = false) => {
    Animated.parallel([Animated.timing(popupScale, { toValue: 0.8, duration: 200, useNativeDriver: true }), Animated.timing(popupOpacity, { toValue: 0, duration: 200, useNativeDriver: true })]).start(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
      if (shouldRedirect) router.replace('/home');
    });
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      showPopup('error', 'Password Lemah', 'Password baru harus memiliki minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showPopup('success', 'Berhasil!', 'Password Anda telah diperbarui. Mengalihkan ke beranda...');
    } catch (error: any) {
      showPopup('error', 'Gagal', error.message || 'Terjadi kesalahan saat memperbarui password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#8B0000', '#CE1126', '#A60D1D']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.formContainer}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%' }}>
            <View style={styles.iconWrap}>
              <LockKeyhole size={56} color="#D4AF37" />
            </View>

            <Text style={styles.title}>Password Baru</Text>
            <Text style={styles.subtitle}>Silakan buat password baru untuk akun Anda.</Text>

            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password Baru (Min. 6 Karakter)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Ketik password baru..." placeholderTextColor="#94A3B8" value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIconContainer}>
                    {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleUpdatePassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>SIMPAN PASSWORD</Text>}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={popup.visible} transparent animationType="none" onRequestClose={() => closePopup(popup.type === 'success')}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: popupOpacity, transform: [{ scale: popupScale }] }]}>
            <View style={{ marginBottom: 16 }}>{popup.type === 'success' ? <CheckCircle2 size={56} color="#10B981" /> : <XCircle size={56} color="#EF4444" />}</View>
            <Text style={[styles.modalTitle, { color: popup.type === 'success' ? '#10B981' : '#EF4444' }]}>{popup.title}</Text>
            <Text style={styles.modalMessage}>{popup.message}</Text>

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: popup.type === 'success' ? '#10B981' : '#EF4444' }]} onPress={() => closePopup(popup.type === 'success')}>
              <Text style={styles.modalButtonText}>{popup.type === 'success' ? 'Selesai' : 'Coba Lagi'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B0000' },
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
  rightIconContainer: { paddingRight: 16, justifyContent: 'center' },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 15 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
