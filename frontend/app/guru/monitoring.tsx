import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../src/config/supabase';
import { Users, ChevronLeft, BookOpen, CheckCircle } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../../src/theme/colors';

interface StudentLiteracyProgress {
  siswa_id: string;
  student_name: string;
  pahlawan_list: string[];
  total_pahlawan: number;
  last_active: string;
}

export default function MonitoringScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [studentProgress, setStudentProgress] = useState<StudentLiteracyProgress[]>([]);

  const fetchLiteracyProgress = async () => {
    try {
      setLoading(true);

      // Ambil riwayat scan HANYA UNTUK ROLE SISWA menggunakan !inner join
      const { data, error } = await supabase
        .from('progress_scan')
        .select(
          `
          id,
          nama_pahlawan,
          waktu_scan,
          siswa_id,
          profiles!inner ( nama, role )
        `,
        )
        .eq('profiles.role', 'siswa') // FILTER KUNCI: Hanya ambil yang rolenya 'siswa'
        .order('waktu_scan', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setStudentProgress([]);
        return;
      }

      // Kelompokkan data pahlawan yang dibaca berdasarkan Siswa
      const groupedMap = new Map<string, StudentLiteracyProgress>();

      data.forEach((item: any) => {
        const siswaId = item.siswa_id;
        const studentName = item.profiles?.nama || 'Siswa Pahlawan';
        const pahlawan = item.nama_pahlawan;

        if (!groupedMap.has(siswaId)) {
          groupedMap.set(siswaId, {
            siswa_id: siswaId,
            student_name: studentName,
            pahlawan_list: pahlawan ? [pahlawan] : [],
            total_pahlawan: pahlawan ? 1 : 0,
            last_active: item.waktu_scan
              ? new Date(item.waktu_scan).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '-',
          });
        } else {
          const currentData = groupedMap.get(siswaId)!;
          // Tambahkan pahlawan ke daftar jika belum ada (menghindari duplikat)
          if (pahlawan && !currentData.pahlawan_list.includes(pahlawan)) {
            currentData.pahlawan_list.push(pahlawan);
            currentData.total_pahlawan = currentData.pahlawan_list.length;
          }
        }
      });

      setStudentProgress(Array.from(groupedMap.values()));
    } catch (error: any) {
      console.error('Gagal memuat data progres literasi:', error.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiteracyProgress();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiteracyProgress();
  };

  const renderItem = ({ item }: { item: StudentLiteracyProgress }) => (
    <View style={styles.card}>
      {/* Header Kartu: Nama Siswa & Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <View style={styles.avatarIcon}>
            <Users size={18} color="#B91C1C" />
          </View>
          <View>
            <Text style={styles.studentName}>{item.student_name}</Text>
            <Text style={styles.activeTime}>Aktivitas terakhir: {item.last_active}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.total_pahlawan} Pahlawan</Text>
        </View>
      </View>

      {/* Detail Pahlawan yang Sudah Dibaca */}
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Pahlawan yang Sudah Dipelajari:</Text>
        <View style={styles.pahlawanChipsContainer}>
          {item.pahlawan_list.length > 0 ? (
            item.pahlawan_list.map((pahlawan, index) => (
              <View key={index} style={styles.chip}>
                <CheckCircle size={13} color="#047857" />
                <Text style={styles.chipText}>{pahlawan}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyPahlawanText}>Belum ada pahlawan yang dibaca</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Header Seragam dengan LinearGradient & Tombol Kembali Bulat */}
      <LinearGradient colors={['#CE1126', '#A60D1D']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="monitoring-back-button">
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Progres Literasi Pahlawan</Text>
            <Text style={styles.headerSub}>Monitoring aktivitas membaca siswa</Text>
          </View>
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#CE1126" />
        </View>
      ) : (
        <FlatList
          data={studentProgress}
          keyExtractor={(item) => item.siswa_id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#CE1126']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BookOpen size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Belum Ada Aktivitas Baca</Text>
              <Text style={styles.emptyText}>Data pahlawan yang dibaca oleh siswa akan muncul di sini.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.md,
  },
  headerRow: {
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
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  headerSub: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentName: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  activeTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  contentSection: { marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  pahlawanChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 5,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#065F46' },
  emptyPahlawanText: { fontSize: 12, fontStyle: 'italic', color: COLORS.textMuted },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain, marginTop: 8 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 32 },
});
