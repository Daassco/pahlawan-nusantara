export interface StudentReport {
  id: string;
  nama: string;
  email: string;
  total_scan: number;
  nilai: {
    nama_materi: string;
    skor: number;
    created_at: string;
  }[];
  progress_scan: {
    nama_pahlawan: string;
    waktu_scan: string;
  }[];
}

export interface SoalKuis {
  id: number;
  pertanyaan: string;
  pilihan_jawaban: string[];
  jawaban_benar: number;
  pembahasan?: string | null;
  created_at?: string;
}

export type SoalKuisInput = Omit<SoalKuis, 'id' | 'created_at'>;
