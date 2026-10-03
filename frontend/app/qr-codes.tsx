import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Printer, Info, X, Download, ScanLine } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';
import { HEROES } from '../src/data/heroes';

export default function QRCodesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedHero, setSelectedHero] = useState<any>(null);
  const qrRef = useRef<any>(null);

  const handlePrint = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
              h1 { color: #333; }
              .grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
              .card { border: 2px solid #D4AF37; border-radius: 8px; padding: 15px; width: 200px; margin: 10px; background: #fff; }
              .name { font-weight: bold; font-size: 14px; margin-top: 10px; color: #111; }
              .qr-image { margin: 10px 0; width: 120px; height: 120px; }
              .code { font-size: 10px; color: #666; margin-top: 4px; }
            </style>
          </head>
          <body>
            <h1>Katalog QR Code Pahlawan Nusantara</h1>
            <p>Scan QR code di bawah ini menggunakan aplikasi Pahlawan Nusantara AR</p>
            <div class="grid">
              ${HEROES.map(
                (hero) => `
                <div class="card">
                  <div class="name">${hero.name}</div>
                  <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(hero.qrCode)}" alt="QR Code" />
                  <div class="code">${hero.qrCode}</div>
                </div>
              `,
              ).join('')}
            </div>
          </body>
        </html>
      `;
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error('Gagal mencetak:', error);
      Alert.alert('Error', 'Gagal membuka fitur cetak/print.');
    }
  };

  // 🔥 PERBAIKAN: Menggunakan Dynamic Import agar aman dari Error Native Module & Web 🔥
  const handleSaveQR = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Informasi', 'Penyimpanan langsung ke galeri hanya didukung di perangkat Android/iOS.');
      return;
    }

    if (!qrRef.current) {
      Alert.alert('Mohon Tunggu', 'QR Code belum siap, silakan coba lagi dalam beberapa detik.');
      return;
    }

    try {
      if (typeof qrRef.current.toDataURL !== 'function') {
        Alert.alert('Error Komponen', 'Fungsi simpan gambar tidak didukung oleh versi library ini.');
        return;
      }

      qrRef.current.toDataURL(async (base64Data: string) => {
        try {
          // Import modul secara dinamis saat tombol diklik
          const MediaLibrary = await import('expo-media-library');
          const FileSystem = await import('expo-file-system/legacy');

          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Izin Ditolak', 'Dibutuhkan izin galeri untuk menyimpan QR Code.');
            return;
          }

          const heroName = selectedHero?.name || 'Pahlawan';
          const safeFilename = `QR_${heroName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
          const fileUri = FileSystem.cacheDirectory + safeFilename;

          let cleanBase64 = base64Data;
          if (cleanBase64.includes(',')) {
            cleanBase64 = cleanBase64.split(',')[1];
          }
          cleanBase64 = cleanBase64.replace(/\s/g, '');

          await FileSystem.writeAsStringAsync(fileUri, cleanBase64, {
            encoding: 'base64',
          });

          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync('Pahlawan Nusantara', asset, false);

          Alert.alert('Berhasil! 🎉', `QR Code ${heroName} telah disimpan ke galeri Anda.`);
        } catch (error: any) {
          console.error('Error internal penyimpanan:', error);
          Alert.alert('Gagal Menyimpan', error.message || 'Terjadi kesalahan sistem saat menyimpan ke perangkat.');
        }
      });
    } catch (error: any) {
      console.error('Error memproses QR:', error);
      Alert.alert('Gagal Memproses QR', 'Terjadi kesalahan sistem saat membaca gambar QR.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#D4AF37', '#B8860B']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="qr-codes-back-button">
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>QR Code Pahlawan</Text>
            <Text style={styles.headerSub}>{HEROES.length} kode untuk dipindai</Text>
          </View>
          <TouchableOpacity onPress={handlePrint} testID="print-button">
            <Printer size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Info size={18} color="#1E3A8A" />
          <Text style={styles.infoText}>Tampilkan QR di layar lain (laptop/tablet) atau cetak untuk dipindai dengan kamera. Tap kartu untuk menyimpan atau melihat AR-nya.</Text>
        </View>

        <View style={styles.grid}>
          {HEROES.map((hero, idx) => (
            <TouchableOpacity key={hero.id} activeOpacity={0.85} onPress={() => setSelectedHero(hero)} style={styles.qrCard} testID={`qr-card-${hero.id}`}>
              <View style={[styles.qrCardHeader, { backgroundColor: hero.color }]}>
                <Text style={styles.qrNum}>#{idx + 1}</Text>
                <Text style={styles.qrEmoji}>{hero.emoji}</Text>
              </View>
              <View style={styles.qrCanvas}>
                <QRCode value={hero.qrCode} size={130} color="#1A1A1A" backgroundColor="#FFFFFF" />
              </View>
              <View style={styles.qrInfo}>
                <Text style={styles.qrName} numberOfLines={2}>
                  {hero.name}
                </Text>
                <Text style={styles.qrCodeText} numberOfLines={1}>
                  {hero.qrCode}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>📚 Cara Penggunaan</Text>
          <Text style={styles.footerLine}>1. Cetak halaman ini, atau tampilkan di perangkat lain</Text>
          <Text style={styles.footerLine}>2. Buka menu "Mulai Scan AR" di aplikasi</Text>
          <Text style={styles.footerLine}>3. Arahkan kamera ke salah satu QR Code di atas</Text>
          <Text style={styles.footerLine}>4. Pahlawan akan muncul dalam tampilan AR 3D!</Text>
        </View>
      </ScrollView>

      <Modal visible={!!selectedHero} transparent animationType="fade" onRequestClose={() => setSelectedHero(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedHero(null)}>
              <X size={24} color="#666" />
            </TouchableOpacity>

            {selectedHero && (
              <>
                <Text style={styles.modalTitle}>{selectedHero.name}</Text>
                <Text style={styles.modalSubtitle}>{selectedHero.qrCode}</Text>

                <View style={styles.modalQrWrapper}>
                  <QRCode value={selectedHero.qrCode} size={200} getRef={(c) => (qrRef.current = c)} />
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1E3A8A' }]} onPress={handleSaveQR}>
                    <Download size={20} color="#FFF" />
                    <Text style={styles.actionBtnText}>Simpan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#D4AF37' }]}
                    onPress={() => {
                      const id = selectedHero.id;
                      setSelectedHero(null);
                      router.push(`/ar/${id}`);
                    }}
                  >
                    <ScanLine size={20} color="#FFF" />
                    <Text style={styles.actionBtnText}>Buka AR</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.gold,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  headerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  body: { padding: 16, paddingTop: 18 },
  infoCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F1F8FF',
    padding: 14,
    borderRadius: RADIUS.medium,
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMain,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  qrCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrCardHeader: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrNum: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  qrEmoji: { fontSize: 16 },
  qrCanvas: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  qrInfo: { padding: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  qrName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMain,
    minHeight: 32,
  },
  qrCodeText: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  footerCard: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.medium,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B8860B',
    marginBottom: 8,
  },
  footerLine: {
    fontSize: 12,
    color: COLORS.textMain,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 6,
    marginBottom: 20,
  },
  modalQrWrapper: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    ...SHADOWS.sm,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
