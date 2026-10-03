# Pahlawan Nusantara AR - Mobile App PRD

## Overview
Aplikasi mobile Expo React Native edukasi sejarah Indonesia berjudul **"Pengembangan Media Pembelajaran Sekolah melalui Pengenalan Tokoh Pahlawan Nasional di Magelang dengan Media Augmented Reality (AR) Berbasis Android"**. Pengganti modern dari Unity/Vuforia menggunakan teknologi React Native Expo.

## Target User
Siswa sekolah Indonesia, terutama di Magelang, yang ingin belajar sejarah pahlawan nasional secara interaktif dengan teknologi AR.

## Core Features

### 1. Splash Screen (`/`)
- Logo aplikasi dengan animasi lingkaran emas berputar
- Judul "PAHLAWAN NUSANTARA"
- Animasi loading dots emas
- Auto-redirect ke /home setelah 3 detik

### 2. Halaman Utama (`/home`)
- Header gradient merah-hitam dengan greeting & medal score
- Progress Tracker bar emas: "X/20 Pahlawan Dipelajari"
- CTA besar gradien emas: "Mulai Scan AR"
- Bento grid 2x2: Daftar Pahlawan, Kuis, Panduan, Tentang
- Card khusus: QR Code Pahlawan
- Horizontal carousel 5 pahlawan pilihan (foto + nama)

### 3. QR Scanner (`/scan`)
- Camera view dengan expo-camera
- Bingkai scan emas dengan animated scan line
- Auto-detect QR → navigate ke /ar/[id]
- Mode tanpa kamera: tombol "Buka Daftar Pahlawan"
- Shortcut emoji untuk simulasi tanpa QR fisik

### 4. AR Viewer 3D (`/ar/[id]`)
- Tampilan AR-style dengan grid pattern dan gradient
- 3D Effect Card pahlawan: rotateY/X (manual swipe), auto-rotate, floating animation, wave animation
- Controls: Zoom In/Out, Reset, Suara (TTS narasi)
- Info pahlawan + tombol "Baca Biografi Lengkap"

### 5. Daftar Pahlawan (`/heroes`)
- Grid 2 kolom dengan 20 pahlawan
- Search input
- Badge nomor + status "dipelajari" (centang hijau)
- Foto pahlawan + lokasi lahir
- Mode tanpa AR

### 6. Detail Biografi (`/hero/[id]`)
- Hero image full width dengan gradient overlay
- Info: nama, gelar, tanggal lahir, tempat lahir, wafat
- Tombol "Putar Narasi Suara" (Text-to-Speech Bahasa Indonesia)
- Tombol "Lihat dalam AR 3D"
- Sections: Riwayat Perjuangan, Jasa Indonesia, Hubungan Magelang
- QR Code reference

### 7. Kuis Interaktif (`/quiz`)
- 10 soal pilihan ganda dengan progress bar
- Feedback langsung benar/salah dengan penjelasan
- Skor disimpan, high score tracking
- Hasil akhir dengan medali emas, grade, dan tombol "Ulangi Kuis"

### 8. Panduan (`/guide`)
- 7 langkah penggunaan dengan icon berwarna
- Tips & Trik
- FAQ
- CTA Mulai Scan

### 9. Tentang Aplikasi (`/about`)
- Logo + nama + tagline
- Card judul skripsi
- Stats grid (20 Pahlawan, 10 Kuis, Indo)
- Info pengembang & institusi
- Stack teknologi
- Sumber data & footer patriotik

### 10. QR Code Printable (`/qr-codes`)
- 20 QR Code untuk 20 pahlawan
- Generated dengan react-native-qrcode-svg
- Tap card → langsung ke AR
- Instruksi cara cetak/tampil

## Tech Stack
- **Frontend**: Expo SDK 54 + React Native 0.81
- **Navigation**: Expo Router (file-based)
- **Camera**: expo-camera (QR scan)
- **TTS**: expo-speech (Bahasa Indonesia)
- **Storage**: AsyncStorage (progress, scores)
- **Icons**: lucide-react-native
- **UI**: Linear Gradient, custom StyleSheet
- **QR**: react-native-qrcode-svg + react-native-svg

## Data Structure
**20 Pahlawan Nasional**: Diponegoro, Soedirman, Kartini, Ki Hajar Dewantara, Soekarno, Hatta, Cut Nyak Dien, Imam Bonjol, Hasanuddin, Pattimura, Dewi Sartika, Martha Christina Tiahahu, Sisingamangaraja XII, Sultan Agung, Ahmad Dahlan, Hasyim Asy'ari, Bung Tomo, Frans Kaisiepo, W.R. Supratman, Dr. Cipto Mangunkusumo.

Each hero: id, qrCode, name, title, birthPlace, birthDate, deathDate, story, contributions, magelangConnection, photoUrl, color, emoji.

**10 Quiz Questions**: Pertanyaan pilihan ganda 4 opsi tentang pahlawan dengan penjelasan.

## Color Theme (Patriotic Red & Gold)
- Primary: #CE1126 (Merah Indonesia)
- Secondary: #D4AF37 (Emas)
- Background: #FFFFFF, #F8F9FA
- Text: #121212, #6A6A6A

## Environment
- `expo-camera` requires CAMERA permission (declared in app.json)
- All data stored locally (no backend needed for offline use)
- Backend FastAPI exists for future extensions

## Future Enhancements (out of scope MVP)
- Sync progress dengan cloud
- Multiplayer quiz
- Lebih banyak pahlawan
- Real 3D models (.glb) dengan three.js
- Augmented Reality marker tracking
