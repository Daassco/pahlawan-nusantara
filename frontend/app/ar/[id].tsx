import { useEffect, useRef, useState, Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, PanResponder, ScrollView, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { X, RotateCw, ZoomIn, ZoomOut, Volume2, VolumeX, BookOpen, Hand, Sparkles } from 'lucide-react-native';
import { COLORS, RADIUS } from '../../src/theme/colors';
import { findHeroById } from '../../src/data/heroes';
import { markHeroAsLearned } from '../../src/utils/progress';
// Tambahkan di deretan import atas
import HeroPortrait from '../../src/components/HeroPortrait'; // (Sesuaikan path foldernya jika salah)

// --- IMPORT MESIN 3D ---
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei/native';

const { width, height } = Dimensions.get('window');

// --- KOMPONEN PEMBACA 3D ---
function PahlawanModel3D({ heroData, customZoom }: { heroData: any; customZoom: number }) {
  const gltf = useGLTF(heroData.model3D) as any;

  // Ambil pengaturan dari heroes.ts, kalikan dengan tombol zoom
  const baseScale = heroData.modelScale || 1.5;
  const finalScale = typeof baseScale === 'number' ? baseScale * customZoom : [baseScale[0] * customZoom, baseScale[1] * customZoom, baseScale[2] * customZoom];

  const pos = heroData.modelPosition || [0, -1, 0];

  return <primitive object={gltf.scene} scale={finalScale} position={pos} />;
}

export default function ARViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hero = findHeroById(id || '');

  // State untuk 3D & 2D
  const [scaleVal, setScaleVal] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Animasi untuk 2D Fallback
  const rotateY = useRef(new Animated.Value(0)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const auto = useRef(new Animated.Value(0)).current;
  const lastRotateY = useRef(0);
  const lastRotateX = useRef(0);

  useEffect(() => {
    if (hero) markHeroAsLearned(hero.id);
    return () => {
      Speech.stop();
    };
  }, [hero]);

  // Animasi 2D
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(wave, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [fade, float, wave]);

  useEffect(() => {
    if (autoRotate) {
      const a = Animated.loop(Animated.timing(auto, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true }));
      a.start();
      return () => a.stop();
    }
  }, [autoRotate, auto]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setAutoRotate(false),
      onPanResponderMove: (_, g) => {
        rotateY.setValue(lastRotateY.current + g.dx * 0.6);
        rotateX.setValue(lastRotateX.current - g.dy * 0.4);
      },
      onPanResponderRelease: (_, g) => {
        lastRotateY.current += g.dx * 0.6;
        lastRotateX.current -= g.dy * 0.4;
      },
    }),
  ).current;

  // Kontrol Tombol Zoom
  const handleZoomIn = () => {
    const next = Math.min(scaleVal + 0.2, 2.5);
    setScaleVal(next);
    Animated.spring(scale, { toValue: next, useNativeDriver: true }).start();
  };

  const handleZoomOut = () => {
    const next = Math.max(scaleVal - 0.2, 0.5);
    setScaleVal(next);
    Animated.spring(scale, { toValue: next, useNativeDriver: true }).start();
  };

  const handleReset = () => {
    lastRotateY.current = 0;
    lastRotateX.current = 0;
    setScaleVal(1);
    Animated.parallel([Animated.spring(rotateY, { toValue: 0, useNativeDriver: true }), Animated.spring(rotateX, { toValue: 0, useNativeDriver: true }), Animated.spring(scale, { toValue: 1, useNativeDriver: true })]).start();
    setAutoRotate(true);
  };

  const toggleNarration = () => {
    if (!hero) return;
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
      const greeting = `Halo, saya ${hero.name}. ${hero.title}. ${hero.story}`;
      setIsPlaying(true);
      Speech.speak(greeting, { language: 'id-ID', rate: 0.92, pitch: 1.0, onDone: () => setIsPlaying(false), onStopped: () => setIsPlaying(false), onError: () => setIsPlaying(false) });
    }
  };

  if (!hero) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Pahlawan tidak ditemukan</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Kalkulasi Rotasi 2D
  const finalYRotate = Animated.add(rotateY, auto.interpolate({ inputRange: [0, 1], outputRange: [0, 360] })).interpolate({ inputRange: [-720, 720], outputRange: ['-720deg', '720deg'] });
  const xRotate = rotateX.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });
  const waveRotate = wave.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient colors={[hero.color + '99', '#000000', hero.color + '40']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

      {/* Grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: (i / 8) * height }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: (i / 6) * width }]} />
        ))}
      </View>

      {/* Top Bar */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.arBadge}>
          <View style={styles.arDot} />
          <Text style={styles.arBadgeText}>{hero.model3D ? '3D MODE' : 'AR MODE'}</Text>
        </View>
        <TouchableOpacity onPress={() => setAutoRotate(!autoRotate)} style={[styles.iconBtn, autoRotate && styles.iconBtnActive]}>
          <RotateCw size={20} color={autoRotate ? '#1A1A1A' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>

      {/* AREA RENDER UTAMA */}
      <View style={styles.modelContainer}>
        {hero.model3D ? (
          // JIKA ADA 3D MODEL
          <Canvas style={{ flex: 1, width: width, height: height * 0.6 }} camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[10, 10, 10]} intensity={1.5} />
            <Suspense fallback={null}>
              <PahlawanModel3D heroData={hero} customZoom={scaleVal} />
              <Environment preset="city" />
            </Suspense>
            {/* OrbitControls untuk memutar 3D pakai jari */}
            <OrbitControls enablePan={false} autoRotate={autoRotate} autoRotateSpeed={2} enableZoom={false} />
          </Canvas>
        ) : (
          // JIKA TIDAK ADA 3D MODEL (FALLBACK 2D KARTU LAMA)
          <Animated.View
            style={[styles.modelWrap, { opacity: fade, transform: [{ translateY: floatY }, { perspective: 1000 }, { rotateY: finalYRotate }, { rotateX: xRotate }, { rotateZ: waveRotate }, { scale: scale }] }]}
            {...panResponder.panHandlers}
          >
            <View style={[styles.modelFace, { borderColor: hero.color }]}>
              <HeroPortrait hero={hero} style={styles.modelImage} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.modelGradient} />
              <View style={styles.modelInfo}>
                <Text style={styles.modelEmoji}>{hero.emoji}</Text>
                <Text style={styles.modelName} numberOfLines={2}>
                  {hero.name}
                </Text>
                <Text style={styles.modelSub} numberOfLines={1}>
                  {hero.birthPlace}
                </Text>
              </View>
              <View style={styles.sparkleTop}>
                <Sparkles size={16} color="#D4AF37" />
              </View>
              <View style={styles.sparkleBottom}>
                <Sparkles size={14} color="#D4AF37" />
              </View>
            </View>
            <View style={[styles.pedestal, { borderColor: hero.color }]}>
              <Text style={styles.pedestalText}>★ PAHLAWAN NASIONAL ★</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Panel Bawah */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.controlsRow}>
          <ControlButton icon={<ZoomIn size={20} color="#FFFFFF" />} onPress={handleZoomIn} label="Zoom +" />
          <ControlButton icon={<ZoomOut size={20} color="#FFFFFF" />} onPress={handleZoomOut} label="Zoom -" />
          <ControlButton icon={<RotateCw size={20} color="#FFFFFF" />} onPress={handleReset} label="Reset" />
          <ControlButton icon={isPlaying ? <VolumeX size={20} color="#FFFFFF" /> : <Volume2 size={20} color="#FFFFFF" />} onPress={toggleNarration} label={isPlaying ? 'Stop' : 'Suara'} highlight />
        </View>
        <ScrollView style={styles.infoCard} contentContainerStyle={styles.infoCardContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.infoTitle}>{hero.name}</Text>
          <Text style={styles.infoLabel}>{hero.title}</Text>
          <View style={styles.infoMetaRow}>
            <Text style={styles.infoMeta}>📅 {hero.birthDate}</Text>
            <Text style={styles.infoMeta}>📍 {hero.birthPlace}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(`/hero/${hero.id}`)} style={styles.detailBtn}>
          <BookOpen size={18} color="#1A1A1A" />
          <Text style={styles.detailBtnText}>Baca Biografi Lengkap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ControlButton({ icon, onPress, label, highlight, testID }: { icon: React.ReactNode; onPress: () => void; label: string; highlight?: boolean; testID?: string }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.ctrlBtn, highlight && styles.ctrlBtnHighlight]} testID={testID}>
      {icon}
      <Text style={styles.ctrlBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: '#FFF' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.15 },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#D4AF37' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#D4AF37' },
  topBar: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  iconBtnActive: { backgroundColor: '#D4AF37' },
  arBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.5)' },
  arDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2A9D8F' },
  arBadgeText: { color: '#FFF', fontWeight: '900', fontSize: 11, letterSpacing: 1.5 },
  modelContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, zIndex: 1 },
  modelWrap: { alignItems: 'center' },
  modelFace: {
    width: width * 0.7,
    height: width * 0.95,
    borderRadius: 16,
    backgroundColor: '#222',
    overflow: 'hidden',
    borderWidth: 3,
    backfaceVisibility: 'visible',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  modelImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  modelGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },
  modelInfo: { position: 'absolute', left: 14, right: 14, bottom: 14 },
  modelEmoji: { fontSize: 22, marginBottom: 4 },
  modelName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  modelSub: { color: '#D4AF37', fontSize: 11, marginTop: 2 },
  sparkleTop: { position: 'absolute', top: 8, right: 8 },
  sparkleBottom: { position: 'absolute', bottom: 8, left: 8 },
  pedestal: { width: width * 0.55, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', marginTop: 8, borderRadius: 8, borderWidth: 1.5 },
  pedestalText: { color: '#D4AF37', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.3)',
    zIndex: 10,
  },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  ctrlBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ctrlBtnHighlight: { backgroundColor: 'rgba(212,175,55,0.25)', borderColor: '#D4AF37' },
  ctrlBtnText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  infoCard: { maxHeight: 100, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 12 },
  infoCardContent: { padding: 12 },
  infoTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  infoLabel: { color: '#D4AF37', fontSize: 11, marginTop: 2 },
  infoMetaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  infoMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  detailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#D4AF37', paddingVertical: 12, borderRadius: RADIUS.medium },
  detailBtnText: { color: '#1A1A1A', fontWeight: '900', fontSize: 14 },
});
