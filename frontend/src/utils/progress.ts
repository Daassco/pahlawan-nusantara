import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../config/supabase';

const OFFLINE_SCANS_KEY = '@pending_hero_scans';
const OFFLINE_QUIZ_KEY = '@pending_quiz_scores';

// Helper: Mendapatkan ID user login
const getUserId = async (): Promise<string> => {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user ? data.user.id : 'guest';
  } catch {
    return 'guest';
  }
};

// Helper: Cek koneksi internet
const isOnline = async (): Promise<boolean> => {
  const netState = await NetInfo.fetch();
  return Boolean(netState.isConnected && netState.isInternetReachable !== false);
};

// ----------------------------------------------------
// 0. SINKRONISASI DATA PENDING (OFFLINE -> ONLINE)
// ----------------------------------------------------
export const syncPendingData = async (): Promise<void> => {
  const online = await isOnline();
  const userId = await getUserId();

  if (!online || userId === 'guest') return;

  try {
    // 1. Sync Pending Scans
    const pendingScansRaw = await AsyncStorage.getItem(OFFLINE_SCANS_KEY);
    const pendingScans: Array<{ nama_pahlawan: string; waktu_scan: string }> = pendingScansRaw ? JSON.parse(pendingScansRaw) : [];

    if (pendingScans.length > 0) {
      const payload = pendingScans.map((item) => ({
        siswa_id: userId,
        nama_pahlawan: item.nama_pahlawan,
        waktu_scan: item.waktu_scan,
      }));

      const { error } = await supabase.from('progress_scan').insert(payload);
      if (!error) {
        await AsyncStorage.removeItem(OFFLINE_SCANS_KEY);
      }
    }

    // 2. Sync Pending Quiz Scores
    const pendingQuizRaw = await AsyncStorage.getItem(OFFLINE_QUIZ_KEY);
    const pendingQuiz: Array<{ judul_kuis: string; skor: number; waktu_selesai: string }> = pendingQuizRaw ? JSON.parse(pendingQuizRaw) : [];

    if (pendingQuiz.length > 0) {
      const payload = pendingQuiz.map((item) => ({
        siswa_id: userId,
        judul_kuis: item.judul_kuis,
        skor: item.skor,
        waktu_selesai: item.waktu_selesai,
      }));

      const { error } = await supabase.from('quiz_scores').insert(payload);
      if (!error) {
        await AsyncStorage.removeItem(OFFLINE_QUIZ_KEY);
      }
    }
  } catch (e) {
    console.error('Gagal melakukan sinkronisasi data pending:', e);
  }
};

// ----------------------------------------------------
// 1. SIMPAN SCAN PAHLAWAN (HYBRID)
// ----------------------------------------------------
export const markHeroAsLearned = async (heroId: string, namaPahlawan?: string): Promise<void> => {
  try {
    const userId = await getUserId();
    const PROGRESS_KEY = `@pahlawan_progress_${userId}`;
    const targetName = namaPahlawan || heroId;

    // 1. Simpan ke Lokal dulu (UI langsung responsif)
    const learned = await getLearnedHeroes();
    if (!learned.includes(heroId) && !learned.includes(targetName)) {
      learned.push(heroId);
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(learned));
    }

    // 2. Cek Koneksi & Kirim ke Supabase / Masukkan ke Antrean
    const online = await isOnline();

    if (online && userId !== 'guest') {
      const { data: existing } = await supabase.from('progress_scan').select('id').eq('siswa_id', userId).eq('nama_pahlawan', targetName).maybeSingle();

      if (!existing) {
        await supabase.from('progress_scan').insert([
          {
            siswa_id: userId,
            nama_pahlawan: targetName,
            waktu_scan: new Date().toISOString(),
          },
        ]);
      }
      // Coba sync antrean lama jika ada
      await syncPendingData();
    } else if (userId !== 'guest') {
      // Jika Offline: simpan ke pending queue
      const pendingRaw = await AsyncStorage.getItem(OFFLINE_SCANS_KEY);
      const pendingList = pendingRaw ? JSON.parse(pendingRaw) : [];

      const isAlreadyInQueue = pendingList.some((item: { nama_pahlawan: string }) => item.nama_pahlawan === targetName);

      if (!isAlreadyInQueue) {
        pendingList.push({
          nama_pahlawan: targetName,
          waktu_scan: new Date().toISOString(),
        });
        await AsyncStorage.setItem(OFFLINE_SCANS_KEY, JSON.stringify(pendingList));
      }
    }
  } catch (e) {
    console.error('Gagal menyimpan progress scan:', e);
  }
};

// ----------------------------------------------------
// 2. AMBIL DAFTAR PAHLAWAN TERPELAJARI (HYBRID)
// ----------------------------------------------------
export const getLearnedHeroes = async (): Promise<string[]> => {
  try {
    const userId = await getUserId();
    const PROGRESS_KEY = `@pahlawan_progress_${userId}`;

    // Ambil data lokal terlebih dahulu
    const stored = await AsyncStorage.getItem(PROGRESS_KEY);
    let localLearned: string[] = stored ? JSON.parse(stored) : [];

    // Jika Online & Bukan Guest, tarik data terbaru dari Supabase & gabungkan
    const online = await isOnline();
    if (online && userId !== 'guest') {
      await syncPendingData();

      const { data } = await supabase.from('progress_scan').select('nama_pahlawan').eq('siswa_id', userId);

      if (data && data.length > 0) {
        const remoteNames = data.map((item) => item.nama_pahlawan);
        const combined = Array.from(new Set([...localLearned, ...remoteNames]));

        // Perbarui cache lokal
        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(combined));
        return combined;
      }
    }

    return localLearned;
  } catch (e) {
    console.error('Gagal memuat progress scan:', e);
    return [];
  }
};

// ----------------------------------------------------
// 3. RESET PROGRESS LOKAL
// ----------------------------------------------------
export const resetProgress = async (): Promise<void> => {
  try {
    const userId = await getUserId();
    const PROGRESS_KEY = `@pahlawan_progress_${userId}`;
    await AsyncStorage.removeItem(PROGRESS_KEY);
  } catch (e) {
    console.error('Gagal mereset progress:', e);
  }
};

// ----------------------------------------------------
// 4. SIMPAN SKOR KUIS (HYBRID)
// ----------------------------------------------------
export const saveQuizScore = async (score: number, quizTitle?: string): Promise<number> => {
  try {
    const userId = await getUserId();
    const QUIZ_HIGH_SCORE_KEY = `@pahlawan_quiz_high_score_${userId}`;
    const title = quizTitle || 'Kuis Pahlawan Nusantara';

    // 1. Simpan High Score ke Lokal
    const stored = await AsyncStorage.getItem(QUIZ_HIGH_SCORE_KEY);
    const high = stored ? parseInt(stored, 10) : 0;
    const newHigh = score > high ? score : high;

    if (score > high) {
      await AsyncStorage.setItem(QUIZ_HIGH_SCORE_KEY, score.toString());
    }

    // 2. Kirim ke Supabase / Antrean Offline
    const online = await isOnline();
    const timeNow = new Date().toISOString();

    if (online && userId !== 'guest') {
      await supabase.from('quiz_scores').insert([
        {
          siswa_id: userId,
          judul_kuis: title,
          skor: score,
          waktu_selesai: timeNow,
        },
      ]);
      await syncPendingData();
    } else if (userId !== 'guest') {
      const pendingRaw = await AsyncStorage.getItem(OFFLINE_QUIZ_KEY);
      const pendingList = pendingRaw ? JSON.parse(pendingRaw) : [];

      pendingList.push({
        judul_kuis: title,
        skor: score,
        waktu_selesai: timeNow,
      });

      await AsyncStorage.setItem(OFFLINE_QUIZ_KEY, JSON.stringify(pendingList));
    }

    return newHigh;
  } catch (e) {
    console.error('Gagal menyimpan skor kuis:', e);
    return score;
  }
};

// ----------------------------------------------------
// 5. AMBIL HIGH SCORE KUIS (HYBRID)
// ----------------------------------------------------
export const getQuizHighScore = async (): Promise<number> => {
  try {
    const userId = await getUserId();
    const QUIZ_HIGH_SCORE_KEY = `@pahlawan_quiz_high_score_${userId}`;

    const stored = await AsyncStorage.getItem(QUIZ_HIGH_SCORE_KEY);
    let localHigh = stored ? parseInt(stored, 10) : 0;

    const online = await isOnline();
    if (online && userId !== 'guest') {
      await syncPendingData();

      const { data } = await supabase.from('quiz_scores').select('skor').eq('siswa_id', userId).order('skor', { ascending: false }).limit(1).maybeSingle();

      if (data && data.skor > localHigh) {
        localHigh = data.skor;
        await AsyncStorage.setItem(QUIZ_HIGH_SCORE_KEY, localHigh.toString());
      }
    }

    return localHigh;
  } catch (e) {
    console.error('Gagal memuat skor kuis:', e);
    return 0;
  }
};
