import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { User, Mail, Shield, Trash2, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';
import { supabase } from '../src/config/supabase';

export default function PengaturanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState({
    nama: 'Memuat...',
    email: 'Memuat...',
    role: 'siswa',
  });
  const [loading, setLoading] = useState(false);

  // Ambil data profil dari Supabase
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('nama, role').eq('id', user.id).single();

        setUserData({
          nama: data?.nama || 'Pengguna',
          email: user.email || 'Tidak ada email',
          role: data?.role || 'siswa',
        });
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    }
  };

  // Fungsi untuk Menghapus Cache / Reset Progress Belajar
  const handleClearCache = () => {
    Alert.alert('Reset Progress & Cache', 'Apakah Anda yakin ingin mereset semua progress belajar pahlawan dan skor kuis yang tersimpan di perangkat ini? Tindakan ini tidak dapat dibatalkan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Reset',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await AsyncStorage.removeItem('learned_heroes');
            await AsyncStorage.removeItem('quiz_high_score');

            Alert.alert('Berhasil', 'Cache dan progress belajar berhasil direset.');
            router.replace('/home');
          } catch (error) {
            console.log('Error clearing cache:', error);
            Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus cache.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient colors={['#CE1126', '#A60D1D', '#8B0000']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          {/* Diubah menggunakan router.replace('/home') */}
          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pengaturan Akun</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Info Profil Akun */}
        <Text style={styles.sectionLabel}>Informasi Pengguna</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <User size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Nama Lengkap</Text>
              <Text style={styles.infoValue}>{userData.nama}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Mail size={20} color="#2A9D8F" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Email Akun</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Shield size={20} color="#E67E22" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Peran (Role)</Text>
              <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{userData.role}</Text>
            </View>
          </View>
        </View>

        {/* Pengaturan Aplikasi / Cache */}
        <Text style={styles.sectionLabel}>Data & Penyimpanan</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={handleClearCache} disabled={loading}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Trash2 size={20} color="#EF4444" />
            </View>
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: '#EF4444', fontWeight: '700' }]}>Hapus Cache & Reset Progress</Text>
              <Text style={styles.infoValue}>Mereset data progress belajar pahlawan & skor kuis</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  content: { padding: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
});
