import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar'; // <--- 1. Import StatusBar
import { ChevronLeft, ScanLine, Users, HelpCircle, QrCode, Camera, BookOpen, Volume2, Trophy } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';

const STEPS = [
  {
    icon: <Camera size={22} color="#FFFFFF" />,
    title: 'Buka Halaman Scan AR',
    desc: 'Tap tombol "Mulai Scan AR" di menu utama. Berikan izin kamera saat diminta.',
    color: '#CE1126',
  },
  {
    icon: <QrCode size={22} color="#FFFFFF" />,
    title: 'Arahkan ke QR Code Pahlawan',
    desc: 'Posisikan QR Code di dalam bingkai emas. Pastikan pencahayaan cukup.',
    color: '#D4AF37',
  },
  {
    icon: <ScanLine size={22} color="#FFFFFF" />,
    title: 'Scan Otomatis',
    desc: 'Aplikasi akan otomatis mendeteksi QR. Tidak perlu menekan tombol apapun.',
    color: '#2A9D8F',
  },
  {
    icon: <Users size={22} color="#FFFFFF" />,
    title: 'Lihat Pahlawan dalam AR',
    desc: 'Pahlawan akan muncul dalam tampilan 3D. Geser untuk memutar, gunakan tombol zoom.',
    color: '#1E3A8A',
  },
  {
    icon: <Volume2 size={22} color="#FFFFFF" />,
    title: 'Putar Narasi Biografi',
    desc: 'Tap tombol "Suara" untuk mendengarkan biografi pahlawan dalam Bahasa Indonesia.',
    color: '#6A0572',
  },
  {
    icon: <BookOpen size={22} color="#FFFFFF" />,
    title: 'Baca Biografi Lengkap',
    desc: 'Tap "Baca Biografi Lengkap" untuk membaca riwayat perjuangan, jasa, dan hubungan dengan Magelang.',
    color: '#FF8C00',
  },
  {
    icon: <Trophy size={22} color="#FFFFFF" />,
    title: 'Uji Pengetahuan dengan Kuis',
    desc: 'Setelah belajar, kerjakan 10 soal kuis interaktif. Skor tertinggi akan tersimpan.',
    color: '#8B0000',
  },
];

export default function GuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* 2. Tambahkan StatusBar transparan agar warna header menembus ke atas */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <LinearGradient colors={['#CE1126', '#A60D1D']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="guide-back-button">
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Panduan Penggunaan</Text>
            <Text style={styles.headerSub}>Langkah demi langkah belajar pahlawan</Text>
          </View>
          <HelpCircle size={28} color="#D4AF37" />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Selamat Datang! 👋</Text>
          <Text style={styles.introText}>
            Aplikasi ini menggunakan teknologi Augmented Reality (AR) untuk memperkenalkan tokoh-tokoh pahlawan nasional, khususnya yang memiliki kaitan dengan Kota Magelang. Ikuti langkah-langkah di bawah untuk pengalaman terbaik.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>LANGKAH PENGGUNAAN</Text>

        {STEPS.map((step, idx) => (
          <View key={idx} style={styles.stepCard}>
            <View style={[styles.stepIcon, { backgroundColor: step.color }]}>{step.icon}</View>
            <View style={{ flex: 1 }}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumChip}>
                  <Text style={styles.stepNumText}>LANGKAH {idx + 1}</Text>
                </View>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.tipsBox}>
          <Text style={styles.tipsHeader}>💡 Tips & Trik</Text>
          <Text style={styles.tipsItem}>• Pastikan pencahayaan cukup saat scan QR Code</Text>
          <Text style={styles.tipsItem}>• Jaga jarak 15-30 cm antara kamera & QR Code</Text>
          <Text style={styles.tipsItem}>• Gunakan headset untuk pengalaman narasi terbaik</Text>
          <Text style={styles.tipsItem}>• Mode Tanpa AR tersedia di Daftar Pahlawan</Text>
          <Text style={styles.tipsItem}>• Cetak QR Code dari menu QR Code Pahlawan untuk dipindai</Text>
        </View>

        <View style={styles.faqBox}>
          <Text style={styles.faqHeader}>❓ Pertanyaan Umum</Text>
          <FAQ q="Apakah aplikasi ini bisa digunakan offline?" a="Ya, semua materi pahlawan dan kuis dapat diakses tanpa internet." />
          <FAQ q="Bagaimana jika saya tidak punya QR Code fisik?" a="Buka menu 'QR Code Pahlawan' atau gunakan tombol pintas di halaman Scan." />
          <FAQ q="Apakah ada bahaya menggunakan AR untuk mata?" a="Aman. Tetap istirahat secara berkala saat penggunaan lama." />
          <FAQ q="Bagaimana cara mereset progress saya?" a="Saat ini progress disimpan otomatis. Hapus aplikasi untuk reset." />
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/scan')} style={styles.ctaBtn} testID="guide-cta-scan">
          <LinearGradient colors={['#D4AF37', '#B8860B']} style={StyleSheet.absoluteFill} />
          <ScanLine size={20} color="#1A1A1A" />
          <Text style={styles.ctaText}>Mulai Scan Sekarang</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.faqQ}>{q}</Text>
      <Text style={styles.faqA}>{a}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  headerSub: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  body: { padding: 16, paddingTop: 18 },
  introCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.sm,
    borderTopWidth: 4,
    borderTopColor: '#D4AF37',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  introText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  stepCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.medium,
    marginBottom: 10,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeader: { flexDirection: 'row', marginBottom: 4 },
  stepNumChip: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  stepNumText: {
    fontSize: 9,
    color: '#B8860B',
    fontWeight: '900',
    letterSpacing: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  tipsBox: {
    marginTop: 24,
    padding: 14,
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.medium,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  tipsHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B8860B',
    marginBottom: 8,
  },
  tipsItem: {
    fontSize: 12,
    color: COLORS.textMain,
    lineHeight: 22,
  },
  faqBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textMain,
    marginBottom: 12,
  },
  faqItem: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqQ: { fontSize: 13, fontWeight: '700', color: COLORS.textMain },
  faqA: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 24,
    overflow: 'hidden',
    ...SHADOWS.gold,
  },
  ctaText: { color: '#1A1A1A', fontWeight: '900', fontSize: 14 },
});
