import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Trophy, Medal } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../src/config/supabase';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Mengambil data dari tabel nilai dan join ke profiles
      const { data, error } = await supabase
        .from('nilai')
        .select(
          `
          id,
          skor,
          siswa_id,
          profiles:siswa_id ( nama )
        `,
        )
        .order('skor', { ascending: false });

      if (error) throw error;

      if (data) {
        // Ambil skor tertinggi per siswa
        const highestScoresMap = new Map<string, { id: string; nama: string; skor: number }>();

        data.forEach((item: any) => {
          const siswaId = item.siswa_id;
          const currentSkor = item.skor || 0;
          const namaSiswa = item.profiles?.nama || 'Siswa Pahlawan';

          if (!highestScoresMap.has(siswaId)) {
            highestScoresMap.set(siswaId, {
              id: item.id.toString(),
              nama: namaSiswa,
              skor: currentSkor,
            });
          } else {
            const existing = highestScoresMap.get(siswaId)!;
            if (currentSkor > existing.skor) {
              highestScoresMap.set(siswaId, {
                ...existing,
                skor: currentSkor,
              });
            }
          }
        });

        const sortedLeaderboard = Array.from(highestScoresMap.values())
          .sort((a, b) => b.skor - a.skor)
          .slice(0, 10);

        setLeaderboardData(sortedLeaderboard);
      }
    } catch (error: any) {
      console.error('Gagal mengambil data leaderboard:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isTop3 = index < 3;

    return (
      <View style={[styles.card, isTop3 && styles.top3Card]}>
        <View style={styles.rankContainer}>
          {index === 0 ? <Medal size={28} color="#FFD700" /> : index === 1 ? <Medal size={28} color="#C0C0C0" /> : index === 2 ? <Medal size={28} color="#CD7F32" /> : <Text style={styles.rankText}>#{index + 1}</Text>}
        </View>

        <View style={styles.nameContainer}>
          <Text style={[styles.nameText, isTop3 && styles.top3Text]} numberOfLines={1}>
            {item.nama}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.skor} Pts</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={['#CE1126', '#A60D1D']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Papan Peringkat</Text>
            <Text style={styles.headerSub}>Top 10 Skor Kuis Siswa</Text>
          </View>
          <View style={styles.trophyIcon}>
            <Trophy size={24} color="#D4AF37" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#CE1126" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={leaderboardData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data peringkat kuis.</Text>}
          />
        )}
      </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  headerSub: { color: '#D4AF37', fontSize: 11, fontWeight: '600', marginTop: 2 },
  trophyIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  listContainer: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.medium,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  top3Card: { borderColor: '#D4AF37', backgroundColor: '#FFFAF0', borderWidth: 2 },
  rankContainer: { width: 40, alignItems: 'center' },
  rankText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMuted },
  nameContainer: { flex: 1, paddingHorizontal: 12 },
  nameText: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  top3Text: { fontWeight: '900' },
  scoreContainer: {
    backgroundColor: 'rgba(206, 17, 38, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  scoreText: { color: '#CE1126', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40 },
});
