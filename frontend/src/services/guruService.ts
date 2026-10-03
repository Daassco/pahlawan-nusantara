import { supabase } from '../config/supabase';
import { StudentReport, SoalKuis, SoalKuisInput } from '../types/guru';

// --- MONITORING & SISWA ---
export const getRekapSiswa = async (): Promise<StudentReport[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      nama,
      email,
      nilai ( nama_materi, skor, created_at ),
      progress_scan ( nama_pahlawan, waktu_scan )
    `,
    )
    .eq('role', 'siswa')
    .order('nama', { ascending: true });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    ...item,
    total_scan: item.progress_scan ? item.progress_scan.length : 0,
  }));
};

export const deleteStudentAccount = async (studentId: string): Promise<void> => {
  const { error } = await supabase.from('profiles').delete().eq('id', studentId);
  if (error) throw error;
};

// --- MANAJEMEN KUIS ---
export const getSoalKuisList = async (): Promise<SoalKuis[]> => {
  const { data, error } = await supabase.from('soal_kuis').select('*').order('id', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addSoalKuis = async (soal: SoalKuisInput): Promise<void> => {
  const { error } = await supabase.from('soal_kuis').insert([soal]);
  if (error) throw error;
};

export const updateSoalKuis = async (id: number, soal: SoalKuisInput): Promise<void> => {
  const { error } = await supabase.from('soal_kuis').update(soal).eq('id', id);
  if (error) throw error;
};

export const deleteSoalKuis = async (id: number): Promise<void> => {
  const { error } = await supabase.from('soal_kuis').delete().eq('id', id);
  if (error) throw error;
};
