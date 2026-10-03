import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, ScrollView, Animated, Easing, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../src/config/supabase';

const { width } = Dimensions.get('window');
const KODE_RAHASIA_GURU = 'GURU-PAHLAWAN2026';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'siswa' });
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 STATE & REF UNTUK POP-UP MODAL (Disamakan dengan LoginScreen)
  const [popup, setPopup] = useState({ visible: false, type: 'error', title: '', message: '' });
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  // Deklarasi Animated Values
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

  // 🔥 FUNGSI KONTROL POP-UP
  const showPopup = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setPopup({ visible: true, type, title, message });
    iconScale.setValue(0);
    Animated.parallel([
      Animated.spring(popupScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, tension: 40, friction: 5, delay: 150, useNativeDriver: true }),
    ]).start();
  };

  const closePopup = () => {
    Animated.parallel([Animated.timing(popupScale, { toValue: 0.8, duration: 200, useNativeDriver: true }), Animated.timing(popupOpacity, { toValue: 0, duration: 200, useNativeDriver: true })]).start(() =>
      setPopup((prev) => ({ ...prev, visible: false })),
    );
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

  const updateForm = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    const { nama, email, password, role } = form;

    if (!nama || !email || !password) {
      return showPopup('warning', 'Peringatan', 'Semua kolom wajib diisi!');
    }
    if (password.length < 6) {
      return showPopup('warning', 'Peringatan', 'Password minimal 6 karakter!');
    }

    if (role === 'guru') {
      if (!secretCode) return showPopup('warning', 'Peringatan', 'Masukkan kode akses rahasia khusus guru!');
      if (secretCode.trim() !== KODE_RAHASIA_GURU) return showPopup('error', 'Akses Ditolak', 'Kode rahasia guru salah!');
    }

    setLoading(true);

    try {
      const emailClean = email.trim();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signUp({
        email: emailClean,
        password,
        options: { emailRedirectTo: 'pahlawanar://login' },
      });

      if (authError || !user) throw new Error(authError?.message || 'Gagal membuat akun.');

      const { error: profileError } = await supabase.from('profiles').insert([{ id: user.id, nama, email: emailClean, role }]);
      if (profileError) throw new Error('Gagal menyimpan profil pengguna.');

      showPopup('success', 'Pendaftaran Berhasil! 🎉', 'Link verifikasi telah dikirim ke email Anda. Silakan cek kotak masuk Anda.');
      setTimeout(() => {
        closePopup();
        router.replace('/login');
      }, 2500);
    } catch (error: any) {
      showPopup('error', 'Gagal Mendaftar', error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#8B0000', '#CE1126', '#A60D1D']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.decorCircle, styles.circleTop, { transform: [{ rotate }] }]} />
      <View style={[styles.decorCircle, styles.circleBottom]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.formContainer, { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom, 20) + 20 }]} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.headerWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.logoWrap}>
              <UserPlus size={40} color="#D4AF37" />
            </View>
            <Text style={styles.title}>BUAT AKUN</Text>
            <Text style={styles.titleAccent}>PAHLAWAN NUSANTARA</Text>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>Lengkapi data diri Anda di bawah ini</Text>
          </Animated.View>

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.label}>Daftar Sebagai</Text>
            <View style={styles.roleContainer}>
              {['siswa', 'guru'].map((r) => (
                <TouchableOpacity key={r} style={[styles.roleButton, form.role === r && styles.roleActive]} onPress={() => updateForm('role', r)}>
                  <Text style={[styles.roleText, form.role === r && styles.roleTextActive]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {form.role === 'guru' && (
              <View style={styles.secretCodeCard}>
                <Text style={styles.secretCodeLabel}>Kode Akses Khusus Guru</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.inputField, { color: '#B8860B', fontWeight: 'bold' }]}
                    placeholder="Masukkan kode rahasia..."
                    placeholderTextColor="#D4AF37"
                    secureTextEntry
                    autoCapitalize="characters"
                    value={secretCode}
                    onChangeText={setSecretCode}
                  />
                  <View style={styles.iconContainer}>
                    <ShieldCheck size={20} color="#D4AF37" />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.inputField} placeholder="Masukkan nama..." placeholderTextColor="#94A3B8" value={form.nama} onChangeText={(v) => updateForm('nama', v)} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.inputField} placeholder="Masukkan email..." placeholderTextColor="#94A3B8" value={form.email} onChangeText={(v) => updateForm('email', v)} autoCapitalize="none" keyboardType="email-address" />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.inputField} placeholder="Minimal 6 karakter..." placeholderTextColor="#94A3B8" value={form.password} onChangeText={(v) => updateForm('password', v)} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
                  {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>DAFTAR SEKARANG</Text>}
            </TouchableOpacity>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginPromptLink}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 🔥 MODAL POP-UP (Persis seperti di LoginScreen) */}
      <Modal visible={popup.visible} transparent animationType="none" onRequestClose={closePopup}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: popupOpacity, transform: [{ scale: popupScale }] }]}>
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
  container: { flex: 1, backgroundColor: '#8B0000' },
  decorCircle: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.05)' },
  circleTop: { width: width * 1.4, height: width * 1.4, top: -width * 0.7, right: -width * 0.4, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  circleBottom: { width: width * 0.8, height: width * 0.8, bottom: -width * 0.3, left: -width * 0.3 },
  formContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, zIndex: 10 },
  headerWrap: { alignItems: 'center', marginBottom: 16 },
  logoWrap: { marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4, textAlign: 'center' },
  titleAccent: { fontSize: 16, fontWeight: '300', color: '#D4AF37', letterSpacing: 6, textAlign: 'center', marginTop: -4 },
  divider: { width: 40, height: 2, backgroundColor: '#D4AF37', alignSelf: 'center', marginVertical: 12 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24, fontWeight: '500' },
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
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#F8F9FA' },
  roleActive: { backgroundColor: '#8B0000', borderColor: '#8B0000' },
  roleText: { fontWeight: '700', color: '#64748B', fontSize: 14 },
  roleTextActive: { color: '#FFFFFF' },
  secretCodeCard: { marginBottom: 20, backgroundColor: '#FFFDF0', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#D4AF37' },
  secretCodeLabel: { fontSize: 13, fontWeight: '700', color: '#B8860B', marginBottom: 8, letterSpacing: 0.5 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#8B0000', marginBottom: 8, letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  inputField: { flex: 1, padding: 16, fontSize: 15, color: '#1E293B' },
  iconContainer: { paddingRight: 16, justifyContent: 'center' },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  loginPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginPromptText: { color: '#64748B', fontSize: 14 },
  loginPromptLink: { color: '#8B0000', fontSize: 14, fontWeight: '700' },

  // 🔥 STYLE MODAL (Disamakan persis dengan LoginScreen)
  modalOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 15 },
  modalIconWrap: { marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
