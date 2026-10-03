import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar'; // <--- 1. Import StatusBar
import { ChevronLeft, GraduationCap, School, Code2, Heart, Shield } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';
import { HEROES } from '../src/data/heroes';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* 2. Tambahkan StatusBar transparan agar warna header menembus ke atas */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <LinearGradient colors={['#8B0000', '#CE1126', '#A60D1D']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="about-back-button">
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroLogo}>
          <View style={styles.logoCircle}>
            <Shield size={40} color="#CE1126" fill="#D4AF37" />
          </View>
          <View style={styles.goldRing} />
        </View>

        <Text style={styles.appName}>PAHLAWAN NUSANTARA</Text>
        <Text style={styles.appTag}>Augmented Reality Edition</Text>

        <View style={styles.versionPill}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.thesisCard}>
          <Text style={styles.cardLabel}>JUDUL SKRIPSI</Text>
          <Text style={styles.thesisTitle}>Pengembangan Media Pembelajaran Sekolah melalui Pengenalan Tokoh Pahlawan Nasional di Magelang dengan Media Augmented Reality (AR) Berbasis Android</Text>
        </View>

        <View style={styles.statsGrid}>
          <Stat icon={<School size={22} color={COLORS.primary} />} label="Pahlawan" value={HEROES.length.toString()} />
          <Stat icon={<GraduationCap size={22} color="#2A9D8F" />} label="Soal Kuis" value="10" />
          <Stat icon={<Code2 size={22} color="#1E3A8A" />} label="Bahasa" value="Indo" />
        </View>

        <SectionCard title="Pengembang" icon={<Heart size={18} color={COLORS.primary} />}>
          <Row label="Nama" value="Mahasiswa Skripsi" />
          <Row label="NIM" value="—" />
          <Row label="Program Studi" value="Pendidikan Sejarah / Teknologi Pendidikan" />
          <Row label="Pembimbing" value="Dosen Pembimbing Skripsi" />
        </SectionCard>

        <SectionCard title="Institusi" icon={<School size={18} color="#1E3A8A" />}>
          <Row label="Universitas" value="Universitas di Magelang" />
          <Row label="Fakultas" value="Fakultas Keguruan dan Ilmu Pendidikan" />
          <Row label="Tahun" value="2025/2026" />
          <Row label="Kota" value="Magelang, Jawa Tengah" />
        </SectionCard>

        <SectionCard title="Teknologi" icon={<Code2 size={18} color="#2A9D8F" />}>
          <View style={styles.techRow}>
            {['React Native', 'Expo SDK 54', 'Expo Router', 'TypeScript', 'Camera AR', 'Text-to-Speech', 'AsyncStorage', 'Lucide Icons', 'Linear Gradient'].map((t) => (
              <View key={t} style={styles.techChip}>
                <Text style={styles.techChipText}>{t}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Tujuan Aplikasi" icon={<GraduationCap size={18} color="#D4AF37" />}>
          <Text style={styles.bodyText}>
            Aplikasi ini bertujuan menjadi media pembelajaran sejarah yang interaktif dan modern untuk siswa sekolah di Magelang dan seluruh Indonesia. Melalui teknologi Augmented Reality (AR), pengenalan tokoh pahlawan nasional menjadi
            lebih menarik, mudah dipahami, dan membangkitkan rasa nasionalisme generasi muda.
          </Text>
        </SectionCard>

        <View style={styles.creditCard}>
          <Text style={styles.creditTitle}>Sumber Foto & Data</Text>
          <Text style={styles.creditText}>
            • Foto pahlawan: Wikimedia Commons (Public Domain){'\n'}• Data biografi: Berbagai literatur sejarah Indonesia{'\n'}• Hubungan Magelang: Dokumentasi sejarah lokal Karesidenan Kedu
          </Text>
        </View>

        <View style={styles.thanksCard}>
          <Heart size={24} color={COLORS.primary} fill={COLORS.primary} />
          <Text style={styles.thanksText}>Terima kasih kepada para pahlawan yang telah berjuang demi kemerdekaan Indonesia. Semoga aplikasi ini bermanfaat untuk pendidikan generasi muda.</Text>
        </View>

        <Text style={styles.footer}>🇮🇩 Dirgahayu Indonesia • Merdeka!</Text>
        <Text style={styles.footerSub}>© 2026 Pahlawan Nusantara - Skripsi Edu</Text>
      </ScrollView>
    </View>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...SHADOWS.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  heroLogo: { alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  goldRing: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.5)',
    borderStyle: 'dashed',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 14,
  },
  appTag: { color: '#D4AF37', fontSize: 12, marginTop: 2, letterSpacing: 2 },
  versionPill: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.5)',
  },
  versionText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  body: { padding: 16, paddingTop: 18 },
  thesisCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  thesisTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
    lineHeight: 22,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 14,
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: 20, fontWeight: '900', color: COLORS.textMain },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  sectionCard: {
    marginTop: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 14,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textMain,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 12, color: COLORS.textMuted, flex: 1 },
  rowValue: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  bodyText: {
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 20,
    textAlign: 'justify',
  },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techChip: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  techChipText: {
    color: '#B8860B',
    fontSize: 11,
    fontWeight: '700',
  },
  creditCard: {
    marginTop: 14,
    padding: 14,
    backgroundColor: '#F1F8FF',
    borderRadius: RADIUS.medium,
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
  },
  creditTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  creditText: { fontSize: 11, color: COLORS.textMuted, lineHeight: 18 },
  thanksCard: {
    marginTop: 14,
    padding: 16,
    backgroundColor: '#FFE8EB',
    borderRadius: RADIUS.medium,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  thanksText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMain,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textMain,
    fontWeight: '900',
    fontSize: 14,
    marginTop: 24,
  },
  footerSub: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
