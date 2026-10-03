import { useEffect, useRef, useState, Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Easing, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ChevronLeft, X, ScanLine, AlertTriangle, Camera, ListChecks, RotateCw, BookOpen } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';
import { findHeroByQRCode, HEROES } from '../src/data/heroes';

// MENYIMPAN PROGRESS (HYBRID)
import { markHeroAsLearned } from '../src/utils/progress';

// --- MESIN 3D UNTUK LIVE AR ---
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei/native';

const { width } = Dimensions.get('window');
const SCAN_BOX = width * 0.7;

// Komponen Pembaca Model 3D
function LiveARModel({ heroData }: { heroData: any }) {
  const gltf = useGLTF(heroData.model3D) as any;

  const baseScale = heroData.modelScale || 1.5;
  const finalScale = typeof baseScale === 'number' ? baseScale * 0.9 : [baseScale[0] * 0.9, baseScale[1] * 0.9, baseScale[2] * 0.9];
  const pos = heroData.modelPosition || [0, -0.2, 0];

  return <primitive object={gltf.scene} scale={finalScale} position={pos} rotation={[0.3, 0, 0]} />;
}

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);

  const [activeHero, setActiveHero] = useState<any | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(lineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [lineAnim]);

  // Fungsi saat QR Code terbaca
  const handleScan = (data: string) => {
    if (activeHero) return;
    const hero = findHeroByQRCode(data);
    if (hero) {
      setError(null);
      setActiveHero(hero);

      // PENYESUAIAN: Sertakan hero.name untuk sinkronisasi hybrid ke Supabase
      markHeroAsLearned(hero.id, hero.name);
    } else {
      setError(`QR Code "${data}" tidak dikenali.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const lineY = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_BOX - 4],
  });

  // Tampilan ketika Izin Kamera Ditolak
  if (!permission || !permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#1a1a1a', '#000000']} style={StyleSheet.absoluteFill} />
        <View style={styles.permRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnDark} testID="scan-back-button">
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.permContent} showsVerticalScrollIndicator={false}>
          <View style={styles.permIcon}>
            <Camera size={48} color="#D4AF37" />
          </View>
          <Text style={styles.permTitle}>Izin Kamera Diperlukan</Text>
          <Text style={styles.permDesc}>Untuk memindai QR Code dan memunculkan pahlawan secara Live AR, aplikasi membutuhkan akses ke kamera perangkat Anda.</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permBtn} testID="grant-camera-permission-button">
            <LinearGradient colors={['#D4AF37', '#B8860B']} style={StyleSheet.absoluteFill} />
            <Text style={styles.permBtnText}>Izinkan Kamera</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ATAU</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.altTitle}>Mode Tanpa AR</Text>
          <Text style={styles.altDesc}>Tetap bisa belajar tentang pahlawan tanpa menggunakan kamera</Text>
          <TouchableOpacity onPress={() => router.push('/heroes')} style={styles.altBtn} testID="non-ar-mode-button">
            <ListChecks size={20} color="#D4AF37" />
            <Text style={styles.altBtnText}>Buka Daftar Pahlawan</Text>
          </TouchableOpacity>

          <Text style={styles.tipsTitle}>Coba Akses Cepat Live AR:</Text>
          <View style={styles.permShortcutRow}>
            {HEROES.slice(0, 5).map((h) => (
              <TouchableOpacity
                key={h.id}
                onPress={() => {
                  setActiveHero(h);
                  // PENYESUAIAN: Kirim nama pahlawan
                  markHeroAsLearned(h.id, h.name);
                }}
                style={styles.permShortcutChip}
                testID={`shortcut-scan-${h.id}`}
              >
                <Text style={styles.shortcutText}>{h.emoji}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => router.push('/qr-codes')} style={[styles.permShortcutChip, styles.shortcutMore]} testID="open-qr-codes-shortcut">
              <Text style={styles.shortcutMoreText}>+15</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. KAMERA LIVE BACKGROUND */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={activeHero ? undefined : ({ data }) => handleScan(data)} />

      {/* 2. RENDER 3D JIKA PAHLAWAN TERDETEKSI */}
      {activeHero ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Canvas style={{ flex: 1, width: width, height: Dimensions.get('window').height }} camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 10]} intensity={2} />
            <Suspense fallback={null}>
              <LiveARModel heroData={activeHero} />
              <Environment preset="city" />
            </Suspense>
            <OrbitControls enablePan={false} autoRotate={autoRotate} autoRotateSpeed={3} enableZoom={false} />
          </Canvas>

          {/* Panel Informasi Pahlawan AR */}
          <View style={[styles.arResultPanel, { paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.arHeroBadge, { borderColor: activeHero.color }]}>
              <Text style={styles.arHeroEmoji}>{activeHero.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.arHeroName}>{activeHero.name}</Text>
                <Text style={styles.arHeroTitle}>{activeHero.title}</Text>
              </View>
            </View>

            <View style={styles.arActionRow}>
              <TouchableOpacity onPress={() => setAutoRotate(!autoRotate)} style={styles.arSecondaryBtn}>
                <RotateCw size={18} color="#FFF" />
                <Text style={styles.arBtnText}>{autoRotate ? 'Matikan Putar' : 'Putar 3D'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push(`/hero/${activeHero.id}`)} style={styles.arPrimaryBtn}>
                <BookOpen size={18} color="#1A1A1A" />
                <Text style={styles.arPrimaryText}>Baca Biografi</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setActiveHero(null)} style={styles.scanAgainBtn}>
              <Text style={styles.scanAgainText}>🔄 Scan Kartu Lain</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* 3. TAMPILAN SCANNER SEBELUM TERBACA */
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Animated.View style={[styles.scanLine, { transform: [{ translateY: lineY }] }]}>
                <LinearGradient colors={['transparent', '#D4AF37', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </Animated.View>
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>
      )}

      {/* Header Tombol Kembali */}
      <View style={[styles.headerWrap, { top: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="scan-close-button">
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <ScanLine size={16} color="#D4AF37" />
          <Text style={styles.titlePillText}>{activeHero ? 'Live AR Terdeteksi!' : 'Arahkan ke QR Code'}</Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {/* Bar Instruksi Bawah */}
      {!activeHero && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          {error ? (
            <View style={styles.errorBox} testID="scan-error">
              <AlertTriangle size={18} color="#FFFFFF" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.instructionTitle}>Posisikan QR di dalam Bingkai</Text>
              <Text style={styles.instructionDesc}>Objek 3D pahlawan akan langsung muncul secara Live di kamera.</Text>
            </>
          )}
          <View style={styles.shortcutRow}>
            {HEROES.slice(0, 5).map((h) => (
              <TouchableOpacity
                key={h.id}
                onPress={() => {
                  setActiveHero(h);
                  // PENYESUAIAN: Sertakan nama pahlawan
                  markHeroAsLearned(h.id, h.name);
                }}
                style={styles.shortcutChip}
                testID={`shortcut-scan-${h.id}`}
              >
                <Text style={styles.shortcutText}>{h.emoji}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => router.push('/qr-codes')} style={[styles.shortcutChip, styles.shortcutMore]} testID="open-qr-codes-shortcut">
              <Text style={styles.shortcutMoreText}>+15</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.shortcutHint}>💡 Tap emoji untuk simulasi Live AR tanpa QR fisik</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayMiddle: { flexDirection: 'row', height: SCAN_BOX },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayBottom: { flex: 1.5, backgroundColor: 'rgba(0,0,0,0.6)' },
  scanBox: { width: SCAN_BOX, height: SCAN_BOX, overflow: 'hidden' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#D4AF37' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 3 },
  headerWrap: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  titlePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.5)' },
  titlePillText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 18,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.3)',
    zIndex: 10,
  },
  instructionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  instructionDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 12, textAlign: 'center', marginTop: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E63946', padding: 12, borderRadius: 12, marginBottom: 8 },
  errorText: { color: '#FFFFFF', flex: 1, fontSize: 12 },
  shortcutRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 14 },
  shortcutChip: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)' },
  shortcutText: { fontSize: 18 },
  shortcutMore: { backgroundColor: 'rgba(212,175,55,0.2)' },
  shortcutMoreText: { color: '#D4AF37', fontWeight: '900', fontSize: 12 },
  shortcutHint: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
  arResultPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.85)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderTopWidth: 1.5, borderTopColor: '#D4AF37', zIndex: 10 },
  arHeroBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 14, borderWidth: 1.5, marginBottom: 14 },
  arHeroEmoji: { fontSize: 28 },
  arHeroName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  arHeroTitle: { color: '#D4AF37', fontSize: 11, fontWeight: '700', marginTop: 2 },
  arActionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  arSecondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 12, borderRadius: 12 },
  arPrimaryBtn: { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#D4AF37', paddingVertical: 12, borderRadius: 12 },
  arBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  arPrimaryText: { color: '#1A1A1A', fontWeight: '900', fontSize: 13 },
  scanAgainBtn: { alignItems: 'center', paddingVertical: 8 },
  scanAgainText: { color: '#D4AF37', fontWeight: '800', fontSize: 13 },
  permRow: { paddingHorizontal: 16, paddingTop: 8 },
  backBtnDark: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  permContent: { paddingHorizontal: 24, paddingVertical: 24, alignItems: 'center' },
  permIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(212,175,55,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 2, borderColor: 'rgba(212,175,55,0.4)' },
  permTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  permDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 12 },
  permBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999, overflow: 'hidden', ...SHADOWS.gold },
  permBtnText: { color: '#1A1A1A', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 28, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  altTitle: { color: '#D4AF37', fontSize: 16, fontWeight: '800' },
  altDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center', marginTop: 4 },
  altBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, borderWidth: 1.5, borderColor: '#D4AF37' },
  altBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  tipsTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 28, alignSelf: 'flex-start' },
  permShortcutRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  permShortcutChip: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)' },
});
