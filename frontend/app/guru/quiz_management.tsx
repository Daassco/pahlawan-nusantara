import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Modal, TextInput, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../src/config/supabase';
import { QUIZ_QUESTIONS } from '../../src/data/quiz';
import { COLORS, RADIUS, SHADOWS } from '../../src/theme/colors';
import { ChevronLeft, UploadCloud, Edit, Trash2, BookOpen, Plus, X, AlertTriangle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react-native';

interface SoalItem {
  id?: number | string;
  pertanyaan: string;
  pilihan_jawaban: string[];
  jawaban_benar: number;
  pembahasan: string;
}

export default function ManajemenSoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState<SoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const [pertanyaan, setPertanyaan] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [jawabanBenar, setJawabanBenar] = useState(0);
  const [pembahasan, setPembahasan] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('soal_kuis').select('*').order('id', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      showPopup('error', 'Gagal', 'Tidak dapat mengambil data soal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

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

  const executeUpload = async () => {
    try {
      setUploading(true);
      closePopup();

      const formattedData = QUIZ_QUESTIONS.map((q) => ({
        pertanyaan: q.question,
        pilihan_jawaban: q.options,
        jawaban_benar: q.correctIndex,
        pembahasan: q.explanation,
      }));

      const { error } = await supabase.from('soal_kuis').insert(formattedData);
      if (error) throw error;

      showPopup('success', 'Sukses!', '20 soal berhasil masuk ke database.');
      fetchQuestions();
    } catch (error: any) {
      showPopup('error', 'Gagal Upload', error.message);
    } finally {
      setUploading(false);
    }
  };

  const confirmUpload = () => {
    showPopup('confirm', 'Upload Soal', 'Yakin ingin memasukkan 20 soal bawaan ke database?', executeUpload);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setPertanyaan('');
    setOptions(['', '', '', '']);
    setJawabanBenar(0);
    setPembahasan('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (item: SoalItem) => {
    setEditingId(item.id || null);
    setPertanyaan(item.pertanyaan);
    setOptions(Array.isArray(item.pilihan_jawaban) ? [...item.pilihan_jawaban] : ['', '', '', '']);
    setJawabanBenar(item.jawaban_benar ?? 0);
    setPembahasan(item.pembahasan || '');
    setModalVisible(true);
  };

  const handleSaveSoal = async () => {
    if (!pertanyaan.trim()) {
      showPopup('warning', 'Peringatan', 'Pertanyaan tidak boleh kosong.');
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      showPopup('warning', 'Peringatan', 'Semua 4 opsi jawaban harus diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        pertanyaan: pertanyaan.trim(),
        pilihan_jawaban: options.map((o) => o.trim()),
        jawaban_benar: jawabanBenar,
        pembahasan: pembahasan.trim(),
      };

      if (editingId) {
        const { error } = await supabase.from('soal_kuis').update(payload).eq('id', editingId);
        if (error) throw error;
        showPopup('success', 'Sukses', 'Soal berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('soal_kuis').insert([payload]);
        if (error) throw error;
        showPopup('success', 'Sukses', 'Soal baru berhasil ditambahkan!');
      }

      setModalVisible(false);
      fetchQuestions();
    } catch (error: any) {
      showPopup('error', 'Gagal Menyimpan', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async (id: number | string) => {
    try {
      const { error } = await supabase.from('soal_kuis').delete().eq('id', id);
      if (error) throw error;
      showPopup('success', 'Berhasil', 'Soal telah dihapus.');
      fetchQuestions();
    } catch (error: any) {
      showPopup('error', 'Gagal Hapus', error.message);
    }
  };

  const confirmDelete = (id: number | string) => {
    showPopup('confirm', 'Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus soal ini?', () => executeDelete(id));
  };

  const renderItem = ({ item, index }: { item: SoalItem; index: number }) => (
    <View style={styles.card}>
      <Text style={styles.questionText}>
        {index + 1}. {item.pertanyaan}
      </Text>
      <Text style={styles.optionText}>Jawaban Benar: {item.pilihan_jawaban?.[item.jawaban_benar] ?? '-'}</Text>
      {!!item.pembahasan && <Text style={styles.explanationText}>Bahasan: {item.pembahasan}</Text>}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEditModal(item)}>
          <Edit size={16} color="#8B0000" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id!)}>
          <Trash2 size={16} color="#E63946" />
          <Text style={styles.deleteBtnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getPopupConfig = () => {
    switch (popup.type) {
      case 'success':
        return { icon: <CheckCircle2 size={56} color="#10B981" />, color: '#10B981' };
      case 'warning':
        return { icon: <AlertTriangle size={56} color="#F59E0B" />, color: '#F59E0B' };
      case 'confirm':
        // 🔥 PERBAIKAN: Ubah warna pop-up konfirmasi menjadi MERAH TEGAS
        return { icon: <HelpCircle size={56} color="#CE1126" />, color: '#CE1126' };
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
            <Text style={styles.headerTitle}>Manajemen Soal</Text>
            <Text style={styles.headerSubtitle}>Kelola Bank Soal & Pembahasan</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#8B0000" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>Belum ada soal di database.</Text>

              <TouchableOpacity style={styles.uploadButton} onPress={confirmUpload} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <UploadCloud size={20} color="#FFF" />
                    <Text style={styles.uploadButtonText}>Upload 20 Soal Lokal</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fabButton} activeOpacity={0.85} onPress={handleOpenAddModal}>
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.formModalOverlay}>
          <View style={styles.formModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Pertanyaan</Text>
              <TextInput style={[styles.input, { height: 70 }]} multiline placeholder="Masukkan soal..." placeholderTextColor="#9CA3AF" value={pertanyaan} onChangeText={setPertanyaan} />

              <Text style={styles.label}>Pilihan Jawaban</Text>
              {options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isCorrect = jawabanBenar === idx;
                return (
                  <View key={idx} style={styles.optionInputRow}>
                    <TouchableOpacity style={[styles.radioBtn, isCorrect && styles.radioBtnActive]} onPress={() => setJawabanBenar(idx)}>
                      <Text style={[styles.radioText, isCorrect && styles.radioTextActive]}>{label}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder={`Opsi ${label}`}
                      placeholderTextColor="#9CA3AF"
                      value={opt}
                      onChangeText={(txt) => {
                        const newOpts = [...options];
                        newOpts[idx] = txt;
                        setOptions(newOpts);
                      }}
                    />
                  </View>
                );
              })}
              <Text style={styles.helperText}>*Klik lingkaran huruf A/B/C/D untuk menentukan Jawaban Benar.</Text>

              <Text style={styles.label}>Pembahasan (Opsional)</Text>
              <TextInput style={[styles.input, { height: 60 }]} multiline placeholder="Penjelasan ringkas..." placeholderTextColor="#9CA3AF" value={pembahasan} onChangeText={setPembahasan} />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSoal} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>{editingId ? 'Update Soal' : 'Simpan Soal'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  headerTextWrap: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  headerSubtitle: { color: '#D4AF37', fontSize: 11, fontWeight: '600', marginTop: 2 },

  listContainer: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: RADIUS.medium || 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  questionText: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 8, lineHeight: 22 },
  optionText: { fontSize: 13, color: '#2A9D8F', marginBottom: 4, fontWeight: '600' },
  explanationText: { fontSize: 12, color: '#64748B', marginBottom: 12, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, gap: 10 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  editBtnText: { color: '#8B0000', fontSize: 13, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  deleteBtnText: { color: '#E63946', fontSize: 13, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#64748B', fontSize: 14 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B0000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.medium || 12,
    gap: 8,
    marginTop: 12,
  },
  uploadButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#CE1126',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    elevation: 6,
  },

  formModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.medium || 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  optionInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  radioBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioBtnActive: { backgroundColor: '#2A9D8F', borderColor: '#2A9D8F' },
  radioText: { fontWeight: '800', color: '#64748B' },
  radioTextActive: { color: '#FFF' },
  helperText: { fontSize: 11, color: '#64748B', fontStyle: 'italic', marginBottom: 8 },
  saveBtn: {
    backgroundColor: '#CE1126',
    paddingVertical: 14,
    borderRadius: RADIUS.medium || 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

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
