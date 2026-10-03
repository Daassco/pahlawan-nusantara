import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Platform, Animated, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Users, Search, Trash2, Mail, User, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react-native';
import { supabase } from '../../src/config/supabase';
import { COLORS, RADIUS, SHADOWS } from '../../src/theme/colors';

interface StudentProfile {
  id: string;
  nama: string;
  email: string;
  role?: string;
  created_at?: string;
}

export default function SiswaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);
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

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, nama, email, role, created_at').or('role.eq.siswa,role.is.null').order('nama', { ascending: true });

      if (error) throw error;

      const studentData = data || [];
      setStudents(studentData);
      setFilteredStudents(studentData);
    } catch (err: any) {
      console.error('Error fetching students:', err.message);
      showPopup('error', 'Gagal Memuat Data', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter((s) => (s.nama && s.nama.toLowerCase().includes(query)) || (s.email && s.email.toLowerCase().includes(query)));
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  // Eksekusi hapus setelah dikonfirmasi dari Pop-up
  const executeDelete = async (id: string, nama: string) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;

      showPopup('success', 'Berhasil', `Akun siswa "${nama}" telah dihapus.`);
      fetchStudents();
    } catch (err: any) {
      showPopup('error', 'Gagal Menghapus', err.message);
    }
  };

  const handleDeleteStudent = (id: string, nama: string) => {
    showPopup('confirm', 'Hapus Akun Siswa', `Apakah Anda yakin ingin menghapus akun "${nama}"? Tindakan ini tidak dapat dibatalkan.`, () => executeDelete(id, nama));
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

      <LinearGradient colors={['#CE1126', '#A60D1D', '#8B0000']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Data Akun Siswa</Text>
            <Text style={styles.headerSubtitle}>Kelola & pantau akun siswa terdaftar</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#888" />
          <TextInput placeholder="Cari nama atau email siswa..." placeholderTextColor="#888" style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || '#8B0000'} />
          <Text style={styles.loadingText}>Memuat data siswa...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchStudents();
              }}
              colors={[COLORS.primary || '#8B0000']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Users size={48} color="#CCC" />
              <Text style={styles.emptyTitle}>Siswa Tidak Ditemukan</Text>
              <Text style={styles.emptySub}>{searchQuery ? 'Coba gunakan kata kunci pencarian yang lain' : 'Belum ada akun siswa yang terdaftar'}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatarCircle}>
                <User size={22} color={COLORS.primary || '#8B0000'} />
              </View>
              <View style={styles.infoWrap}>
                <Text style={styles.studentName}>{item.nama || 'Tanpa Nama'}</Text>
                <View style={styles.emailRow}>
                  <Mail size={12} color="#666" />
                  <Text style={styles.studentEmail}>{item.email || '-'}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteStudent(item.id, item.nama || 'Siswa')}>
                <Trash2 size={18} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* 🔥 CUSTOM POPUP NOTIFIKASI / KONFIRMASI */}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    ...SHADOWS.sm,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrap: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FDEDEC',
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
  },

 
  popupOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', padding: 24 },
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
