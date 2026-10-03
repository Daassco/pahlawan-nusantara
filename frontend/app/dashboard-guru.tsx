import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Users, BarChart3, Award, BookOpen, ShieldAlert, ChevronRight } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';

export default function DashboardGuruScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <LinearGradient colors={['#CE1126', '#A60D1D', '#8B0000']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn} testID="dashboard-guru-back">
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Panel Kontrol Guru</Text>
            <Text style={styles.headerSubtitle}>Pusat Manajemen Pembelajaran</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Menu Utama Guru</Text>

        <View style={styles.menuList}>
          <MenuCard title="Rekap Nilai" desc="Daftar & Skor Siswa" icon={<Award size={24} color="#D4AF37" />} color="#D4AF37" onPress={() => router.push('/guru/kuis')} />

          <MenuCard title="Monitoring" desc="Pantau Aktivitas Kelas" icon={<BarChart3 size={24} color="#2A9D8F" />} color="#2A9D8F" onPress={() => router.push('/guru/monitoring')} />

          <MenuCard title="Data Siswa" desc="Kelola Akun Siswa" icon={<Users size={24} color="#E67E22" />} color="#E67E22" onPress={() => router.push('/guru/siswa')} />

          <MenuCard title="Kelola Soal" desc="Tambah & Edit Soal Kuis" icon={<BookOpen size={24} color="#4A90E2" />} color="#4A90E2" onPress={() => router.push('/guru/quiz_management')} />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <ShieldAlert size={22} color="#8B0000" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>Akses Khusus Pengajar</Text>
            <Text style={styles.infoDesc}>Gunakan menu di atas untuk mengawasi progres belajar peserta didik dan menyusun bahan evaluasi secara real-time.</Text>
          </View>
        </View>

        <View style={styles.footerBanner}>
          <Text style={styles.footerBannerText}>Platform Edukasi Pahlawan Nusantara v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MenuCard({ title, desc, icon, color, onPress }: any) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.menuCard} onPress={onPress}>
      <View style={[styles.menuIconWrap, { backgroundColor: color + '15' }]}>{icon}</View>
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDesc}>{desc}</Text>
      </View>
      <ChevronRight size={20} color={COLORS.textMuted} />
      <View style={[styles.menuAccent, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  menuList: {
    gap: 10,
    marginBottom: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 14,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    gap: 12,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  menuDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  menuAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: RADIUS.medium,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginBottom: 14,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B0000',
  },
  infoDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  footerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  footerBannerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
