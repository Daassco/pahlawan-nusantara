import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Animated, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, Award, BookOpen, User, Calendar, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react-native';
import { supabase } from '../../src/config/supabase';
import { COLORS, RADIUS, SHADOWS } from '../../src/theme/colors';

interface ScoreItem {
  id: string;
  nama_siswa?: string;
  nama_materi?: string;
  skor: number;
  created_at?: string;
  profiles?: {
    nama: string;
    email: string;
  };
}

export default function RekapNilaiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [filteredScores, setFilteredScores] = useState<ScoreItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 State Custom Popup Dinamis
  const [popup, setPopup] = useState({
    visible: false,
    type: 'error' as 'success' | 'error' | 'warning' | 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  // Fungsi memunculkan pop-up
  const showPopup = (type: 'success' | 'error' | 'warning' | 'confirm', title: string, message: string, onConfirm = () => {}) => {
    setPopup({ visible: true, type, title, message, onConfirm });
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

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('nilai')
        .select(
          `
          id,
          skor,
          nama_materi,
          created_at,
          profiles:siswa_id (nama, email)
        `,
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      const scoreData = data || [];
      setScores(scoreData);
      setFilteredScores(scoreData);
    } catch (err: any) {
      console.error('Error fetching scores:', err.message);
      // 🔥 Gunakan Pop-up untuk menampilkan error ke pengguna
      showPopup('error', 'Gagal Memuat Data', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredScores(scores);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = scores.filter((item) => {
        const studentName = item.profiles?.nama || item.nama_siswa || '';
        const materiName = item.nama_materi || '';
        return studentName.toLowerCase().includes(query) || materiName.toLowerCase().includes(query);
      });
      setFilteredScores(filtered);
    }
  }, [searchQuery, scores]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Config untuk tampilan Popup
  const getPopupConfig = () => {
    switch (popup.type) {
      case 'success':
        return { icon: <CheckCircle2 size={56} color="#10B981" />, color: '#10B981' };
      case 'warning':
        return { icon: <AlertTriangle size={56} color="#F59E0B" />, color: '#F59E0B' };
      case 'confirm':
        return { icon: <HelpCircle size={56} color="#3B82F6" />, color: '#3B82F6' };
      default:
        return { icon: <XCircle size={56} color="#EF4444" />, color: '#EF4444' };
    }
  };
  const popupConfig = getPopupConfig();

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Header dengan Gradasi Tema Pahlawan Nusantara */}
      <LinearGradient colors={['#CE1126', '#A60D1D', '#8B0000']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Rekap Nilai Siswa</Text>
            <Text style={styles.headerSubtitle}>Daftar skor & evaluasi kuis peserta didik</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#888" />
          <TextInput placeholder="Cari nama siswa atau materi kuis..." placeholderTextColor="#888" style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      {/* Konten Daftar Nilai */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>Memuat rekap nilai...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredScores}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchScores();
              }}
              colors={['#8B0000']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Award size={48} color="#CCC" />
              <Text style={styles.emptyTitle}>Belum Ada Nilai</Text>
              <Text style={styles.emptySub}>{searchQuery ? 'Tidak ditemukan hasil untuk kata kunci tersebut' : 'Belum ada siswa yang menyelesaikan kuis'}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const studentName = item.profiles?.nama || item.nama_siswa || 'Siswa Tanpa Nama';
            const materiName = item.nama_materi || 'Kuis Pahlawan Nusantara';
            const scoreValue = item.skor ?? 0;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.studentInfo}>
                    <View style={styles.avatarMini}>
                      <User size={14} color="#8B0000" />
                    </View>
                    <Text style={styles.studentName}>{studentName}</Text>
                  </View>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{scoreValue}</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <View style={styles.metaItem}>
                    <BookOpen size={13} color="#666" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {materiName}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Calendar size={13} color="#666" />
                    <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>

                <View style={styles.cardAccent} />
              </View>
            );
          }}
        />
      )}

      {/* 🔥 CUSTOM POPUP NOTIFIKASI */}
      <Modal visible={popup.visible} transparent animationType="none" onRequestClose={closePopup}>
        <View style={styles.popupOverlay}>
          <Animated.View style={[styles.popupContent, { opacity: popupOpacity, transform: [{ scale: popupScale }] }]}>
            <Animated.View style={[styles.popupIconWrap, { transform: [{ scale: iconScale }] }]}>{popupConfig.icon}</Animated.View>

            <Text style={[styles.popupTitle, { color: popupConfig.color }]}>{popup.title}</Text>
            <Text style={styles.popupMessage}>{popup.message}</Text>

            {popup.type === 'confirm' ? (
              <View style={styles.popupActionRow}>
                <TouchableOpacity style={styles.popupBtnCancel} onPress={closePopup}>
                  <Text style={styles.popupBtnCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.popupBtnConfirm, { backgroundColor: popupConfig.color }]}
                  onPress={() => {
                    popup.onConfirm();
                  }}
                >
                  <Text style={styles.popupBtnConfirmText}>Yakin</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.popupBtnConfirm, { width: '100%', backgroundColor: popupConfig.color }]} onPress={closePopup}>
                <Text style={styles.popupBtnConfirmText}>Mengerti</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt || '#F8F9FA',
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: RADIUS.medium || 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    padding: 0,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.medium || 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#222',
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D4AF37',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#D4AF37',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // 🔥 CUSTOM POPUP STYLES (Background Transparan/Blur)
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  popupContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 15 },
  popupIconWrap: { marginBottom: 16 },
  popupTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  popupMessage: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  popupActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  popupBtnCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  popupBtnCancelText: { color: '#475569', fontSize: 15, fontWeight: '700' },
  popupBtnConfirm: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  popupBtnConfirmText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
