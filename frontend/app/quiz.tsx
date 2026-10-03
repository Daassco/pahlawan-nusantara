import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, X, Trophy, RotateCw, ChevronRight, Sparkles, Clock } from 'lucide-react-native';
// KODE BARU: Import library audio bawaan Expo 57
import { useAudioPlayer } from 'expo-audio';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';
import { QUIZ_QUESTIONS } from '../src/data/quiz';
import { saveQuizScore } from '../src/utils/progress';
import { supabase } from '../src/config/supabase';

const { width } = Dimensions.get('window');
const WAKTU_PER_SOAL = 15; // Dalam detik

interface QuestionItem {
  id?: string | number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State Kuis & Loading Data Supabase
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State Pengerjaan
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // State Timer
  const [timeLeft, setTimeLeft] = useState(WAKTU_PER_SOAL);
  const isProcessingRef = useRef(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 🔥 KODE BARU: Setup Player Suara yang Aman & Bebas Crash 🔥
  const correctSound = useAudioPlayer(require('../assets/correct.mp3'));
  const wrongSound = useAudioPlayer(require('../assets/wrong.mp3'));

  // 1. Ambil Data dari tabel `soal_kuis` di Supabase
  const loadAndSyncQuizData = async () => {
    try {
      setLoading(true);
      const { data: fetchedQuestions, error } = await supabase.from('soal_kuis').select('*').order('id', { ascending: true });

      if (error) throw error;

      if (fetchedQuestions && fetchedQuestions.length > 0) {
        const formatted: QuestionItem[] = fetchedQuestions.map((q) => ({
          id: q.id,
          question: q.pertanyaan,
          options: typeof q.pilihan_jawaban === 'string' ? JSON.parse(q.pilihan_jawaban) : q.pilihan_jawaban,
          correctIndex: q.jawaban_benar ?? 0,
          explanation: q.pembahasan || '',
        }));
        setQuestions(formatted);
      } else {
        const fallbackData = QUIZ_QUESTIONS.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }));
        setQuestions(fallbackData);
      }
    } catch (err: any) {
      console.error('Gagal mengambil data dari soal_kuis:', err.message || err);
      setQuestions(QUIZ_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAndSyncQuizData();
  }, []);

  // 🔥 KODE BARU: Fungsi Pemutar Suara yang Jauh Lebih Ringkas 🔥
  const playSound = (isCorrect: boolean) => {
    if (Platform.OS === 'web') return;
    try {
      if (isCorrect) {
        correctSound.seekTo(0);
        correctSound.play();
      } else {
        wrongSound.seekTo(0);
        wrongSound.play();
      }
    } catch (error) {
      console.log('Gagal memutar suara:', error);
    }
  };

  // Timer Hitung Mundur
  useEffect(() => {
    if (loading || showFeedback || completed) return;

    if (timeLeft === 0) {
      handleTimeOut();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, showFeedback, completed, loading]);

  const handleTimeOut = () => {
    if (isProcessingRef.current || selectedIdx !== null || showFeedback) return;
    isProcessingRef.current = true;

    setSelectedIdx(-1);
    playSound(false);
    setShowFeedback(true);
  };

  const total = questions.length;
  const question = questions[currentIdx];

  useEffect(() => {
    if (total === 0) return;
    Animated.timing(progressAnim, {
      toValue: (currentIdx + (showFeedback ? 1 : 0)) / total,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentIdx, showFeedback, total, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleSelect = (idx: number) => {
    if (isProcessingRef.current || selectedIdx !== null || showFeedback) return;
    isProcessingRef.current = true;

    setSelectedIdx(idx);
    const correct = idx === question.correctIndex;

    if (correct) setScore((s) => s + 1);
    playSound(correct);

    setTimeout(() => setShowFeedback(true), 250);
  };

  const handleNext = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(async () => {
      if (currentIdx + 1 >= total) {
        const finalScore = score;
        const hs = await saveQuizScore(finalScore);
        setHighScore(hs);
        setCompleted(true);

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const nilaiSkala100 = Math.round((finalScore / total) * 100);
            const { data: existingData } = await supabase.from('nilai').select('id').eq('siswa_id', user.id).eq('nama_materi', 'Kuis Pahlawan Nasional').maybeSingle();

            if (existingData) {
              await supabase.from('nilai').update({ skor: nilaiSkala100 }).eq('id', existingData.id);
            } else {
              await supabase.from('nilai').insert([{ siswa_id: user.id, nama_materi: 'Kuis Pahlawan Nasional', skor: nilaiSkala100 }]);
            }

            const { data: profileData } = await supabase.from('profiles').select('skor').eq('id', user.id).single();
            const currentHighScore = profileData?.skor || 0;

            if (nilaiSkala100 > currentHighScore) {
              await supabase.from('profiles').update({ skor: nilaiSkala100 }).eq('id', user.id);
            }
          }
        } catch (err) {
          console.error('Terjadi kesalahan saat menyimpan nilai:', err);
        }
      } else {
        setCurrentIdx((i) => i + 1);
        setSelectedIdx(null);
        setShowFeedback(false);
        setTimeLeft(WAKTU_PER_SOAL);
        isProcessingRef.current = false;
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleRestart = () => {
    Alert.alert('Mulai Ulang Kuis?', 'Apakah Anda yakin ingin mengulang kuis? Jika Anda menyelesaikannya lagi, nilai Anda yang baru akan menimpa nilai sebelumnya.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Ulangi',
        style: 'destructive',
        onPress: () => {
          setCurrentIdx(0);
          setSelectedIdx(null);
          setScore(0);
          setShowFeedback(false);
          setCompleted(false);
          setTimeLeft(WAKTU_PER_SOAL);
          isProcessingRef.current = false;
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingCenter, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary || '#8B0000'} />
        <Text style={styles.loadingText}>Menyiapkan Soal Kuis...</Text>
      </View>
    );
  }

  if (completed) {
    const percent = (score / total) * 100;
    const isPerfect = score === total;
    const grade = percent >= 90 ? 'Luar Biasa! 🏆' : percent >= 70 ? 'Bagus Sekali!' : percent >= 50 ? 'Cukup Baik' : 'Tetap Semangat!';
    const message =
      percent >= 90
        ? 'Kamu pahlawan sejati! Pengetahuan sejarahmu sangat hebat.'
        : percent >= 70
          ? 'Hampir sempurna! Pelajari lagi dan raih skor maksimal.'
          : percent >= 50
            ? 'Kamu di jalur yang benar. Yuk belajar lagi tentang pahlawan!'
            : 'Jangan menyerah. Baca biografi pahlawan untuk lebih memahami.';

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#CE1126', '#A60D1D', '#8B0000']} style={StyleSheet.absoluteFill} />
        <ScrollView contentContainerStyle={[styles.resultWrap, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.medalCircle}>
            <LinearGradient colors={['#FFD700', '#D4AF37', '#B8860B']} style={StyleSheet.absoluteFill} />
            <Trophy size={64} color="#FFFFFF" />
          </View>
          {isPerfect && (
            <View style={styles.perfectBadge}>
              <Sparkles size={14} color="#1A1A1A" />
              <Text style={styles.perfectText}>SKOR SEMPURNA!</Text>
            </View>
          )}
          <Text style={styles.resultGrade}>{grade}</Text>
          <Text style={styles.resultScore} testID="quiz-final-score">
            {score} / {total}
          </Text>
          <Text style={styles.resultPercent}>({percent.toFixed(0)}% Benar)</Text>
          <Text style={styles.resultMsg}>{message}</Text>
          {highScore > 0 && (
            <View style={styles.highScoreBox}>
              <Text style={styles.highScoreLabel}>Skor Tertinggi</Text>
              <Text style={styles.highScoreVal}>
                {highScore} / {total}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={handleRestart} style={styles.restartBtn} testID="quiz-restart-button">
            <RotateCw size={18} color={COLORS.primary} />
            <Text style={styles.restartText}>Ulangi Kuis</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.homeBtn} testID="quiz-home-button">
            <Text style={styles.homeBtnText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const isCorrectAnswered = selectedIdx === question?.correctIndex;
  const isTimeOut = selectedIdx === -1;
  const isTimerWarning = timeLeft <= 5 && !showFeedback;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="quiz-back-button">
          <ChevronLeft size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Kuis Pahlawan</Text>
          <Text style={styles.headerSub}>
            Soal {currentIdx + 1} dari {total} • Skor: {score}
          </Text>
        </View>
        <View style={[styles.timerBadge, isTimerWarning && styles.timerWarning]}>
          <Clock size={16} color={isTimerWarning ? '#FFFFFF' : COLORS.textMain} />
          <Text style={[styles.timerText, isTimerWarning && { color: '#FFFFFF' }]}>00:{timeLeft.toString().padStart(2, '0')}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
          <LinearGradient colors={['#FFD700', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.qNumChip}>
            <Text style={styles.qNumChipText}>SOAL {currentIdx + 1}</Text>
          </View>
          <Text style={styles.questionText} testID="quiz-question-text">
            {question?.question}
          </Text>

          <View style={styles.optionsCol}>
            {question?.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrectOpt = idx === question.correctIndex;
              let bg = COLORS.surface;
              let borderColor = COLORS.border;
              let textColor = COLORS.textMain;

              if (showFeedback) {
                if (isCorrectOpt) {
                  bg = '#E6F7F4';
                  borderColor = '#2A9D8F';
                  textColor = '#1A6F66';
                } else if (isSelected) {
                  bg = '#FDECEC';
                  borderColor = '#E63946';
                  textColor = '#C0151E';
                }
              } else if (isSelected) {
                bg = '#FFF8E1';
                borderColor = '#D4AF37';
              }

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(idx)}
                  disabled={selectedIdx !== null || showFeedback || isProcessingRef.current}
                  style={[styles.option, { backgroundColor: bg, borderColor }]}
                  testID={`quiz-option-${idx}`}
                >
                  <View style={[styles.optBadge, isSelected && { backgroundColor: borderColor }]}>
                    <Text style={[styles.optBadgeText, isSelected && { color: '#FFFFFF' }]}>{String.fromCharCode(65 + idx)}</Text>
                  </View>
                  <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                  {showFeedback && isCorrectOpt && <Check size={20} color="#2A9D8F" />}
                  {showFeedback && isSelected && !isCorrectOpt && <X size={20} color="#E63946" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {showFeedback && (
            <View style={[styles.feedbackBox, { backgroundColor: isCorrectAnswered ? '#E6F7F4' : '#FDECEC', borderColor: isCorrectAnswered ? '#2A9D8F' : '#E63946' }]}>
              <Text style={[styles.feedbackTitle, { color: isCorrectAnswered ? '#1A6F66' : '#C0151E' }]}>{isCorrectAnswered ? '✅ Jawaban Benar!' : isTimeOut ? '⏰ Waktu Habis!' : '❌ Belum Tepat'}</Text>
              <Text style={styles.feedbackText}>{question?.explanation}</Text>
            </View>
          )}
        </ScrollView>

        {showFeedback && (
          <View style={[styles.bottomFab, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleNext} style={styles.nextBtn} testID="quiz-next-button">
              <LinearGradient colors={['#CE1126', '#A60D1D']} style={StyleSheet.absoluteFill} />
              <Text style={styles.nextBtnText}>{currentIdx + 1 >= total ? 'Lihat Hasil' : 'Soal Berikutnya'}</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  loadingCenter: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textMain },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border },
  timerWarning: { backgroundColor: '#E63946', borderColor: '#C0151E' },
  timerText: { fontWeight: '900', fontSize: 14, color: COLORS.textMain, fontVariant: ['tabular-nums'] },
  progressTrack: { height: 6, marginHorizontal: 16, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  body: { flex: 1 },
  bodyContent: { padding: 16 },
  qNumChip: { alignSelf: 'flex-start', backgroundColor: '#FFF8E1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#D4AF37' },
  qNumChipText: { color: '#B8860B', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  questionText: { fontSize: 19, fontWeight: '800', color: COLORS.textMain, lineHeight: 27, marginTop: 12, marginBottom: 20 },
  optionsCol: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.medium, borderWidth: 2, ...SHADOWS.sm },
  optBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  optBadgeText: { fontWeight: '900', fontSize: 13, color: COLORS.textMain },
  optText: { fontSize: 14, flex: 1, fontWeight: '600' },
  feedbackBox: { marginTop: 16, padding: 14, borderRadius: RADIUS.medium, borderWidth: 1.5, borderLeftWidth: 4 },
  feedbackTitle: { fontSize: 14, fontWeight: '900', marginBottom: 6 },
  feedbackText: { fontSize: 13, color: COLORS.textMain, lineHeight: 20 },
  bottomFab: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: COLORS.backgroundAlt, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 999, overflow: 'hidden', ...SHADOWS.md },
  nextBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  resultWrap: { padding: 24, alignItems: 'center', paddingTop: 60 },
  medalCircle: { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', ...SHADOWS.gold, borderWidth: 4, borderColor: '#FFFFFF' },
  perfectBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginTop: 16 },
  perfectText: { color: '#1A1A1A', fontSize: 11, fontWeight: '900' },
  resultGrade: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 16, textAlign: 'center' },
  resultScore: { color: '#D4AF37', fontSize: 64, fontWeight: '900', marginTop: 12 },
  resultPercent: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 0 },
  resultMsg: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 20, paddingHorizontal: 20 },
  highScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
  },
  highScoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  highScoreVal: { color: '#D4AF37', fontWeight: '900', fontSize: 16 },
  restartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999, marginTop: 28, width: '100%', ...SHADOWS.md },
  restartText: { color: COLORS.primary, fontWeight: '900', fontSize: 14 },
  homeBtn: { marginTop: 12 },
  homeBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
});
