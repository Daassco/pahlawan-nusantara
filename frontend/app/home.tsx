import { useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Platform, ActivityIndicator, Modal } from 'react-native';
import { useRouter as useExpoRouter, useFocusEffect as useExpoFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ScanLine, Users, HelpCircle, BookOpen, Info, ChevronRight, QrCode, LogOut, LayoutDashboard, Smile, Trophy, AlertTriangle } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';
import { HEROES } from '../src/data/heroes';
import { getLearnedHeroes, getQuizHighScore } from '../src/utils/progress';
import HeroPortrait from '../src/components/HeroPortrait';
import { supabase } from '../src/config/supabase';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_W = (width - 16 * 2 - CARD_GAP) / 2;

interface MenuCardProps {
  testID?: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

export default function HomeScreen() {
  const router = useExpoRouter();
  const insets = useSafeAreaInsets();

  const [learnedCount, setLearnedCount] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // State & Refs untuk Custom Logout Modal
  const [logoutPopup, setLogoutPopup] = useState(false);
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoadingUser(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase.from('profiles').select('nama, role').eq('id', user.id).single();

        if (data && !error) {
          setUserName(data.nama || 'Siswa');
          setUserRole(data.role || 'siswa');
        } else {
          setUserRole('siswa');
        }
      } else {
        setUserRole('siswa');
      }
    } catch (error) {
      console.log('Error fetch user:', error);
      setUserRole('siswa');
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  const doLogout = async () => {
    try {
      closeLogoutConfirm();
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.replace('/login');
      }, 300);
    } catch (error) {
      console.error('Error logout:', error);
    }
  };

  const showLogoutConfirm = () => {
    setLogoutPopup(true);
    iconScale.setValue(0);
    Animated.parallel([
      Animated.spring(popupScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, tension: 40, friction: 5, delay: 150, useNativeDriver: true }),
    ]).start();
  };

  const closeLogoutConfirm = () => {
    Animated.parallel([Animated.timing(popupScale, { toValue: 0.8, duration: 200, useNativeDriver: true }), Animated.timing(popupOpacity, { toValue: 0, duration: 200, useNativeDriver: true })]).start(() => setLogoutPopup(false));
  };

  const handleLogout = () => {
    showLogoutConfirm();
  };

  const loadProgress = useCallback(async () => {
    const learned = await getLearnedHeroes();
    const hs = await getQuizHighScore();
    setLearnedCount(learned.length);
    setHighScore(hs);

    await fetchUserData();

    Animated.timing(progressAnim, {
      toValue: learned.length / HEROES.length,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, fetchUserData]);

  useExpoFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (isMounted) {
        loadProgress();
      }

      return () => {
        isMounted = false;
      };
    }, [loadProgress]),
  );

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (isLoadingUser || userRole === null) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#CE1126" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <LinearGradient colors={['#CE1126', '#A60D1D', '#8B0000']} style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.greeting}>Halo, {userName}</Text>
              <Smile size={16} color="rgba(255,255,255,0.95)" />
              <Text style={styles.roleBadge}>| {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Siswa'}</Text>
            </View>
            <Text style={styles.appTitle}>Pahlawan Nusantara</Text>
            <Text style={styles.appSub}>Tokoh Bersejarah Magelang</Text>
          </View>

          {/* 🔥 SKOR 0/10 DI SINI SUDAH DIHAPUS */}
          <View style={styles.headerRightActions}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {userRole === 'guru' && (
                <TouchableOpacity onPress={() => router.push('/dashboard-guru')} style={styles.logoutBtn}>
                  <LayoutDashboard size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <LogOut size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.progressBox} testID="progress-tracker">
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress Belajar</Text>
            <Text style={styles.progressCount}>
              {learnedCount}/{HEROES.length} Pahlawan
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
              <LinearGradient colors={['#FFD700', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 16 }]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/scan')} style={styles.heroCard}>
          <LinearGradient colors={['#D4AF37', '#B8860B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.heroCardContent}>
            <View style={styles.heroIconCircle}>
              <ScanLine size={30} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Mulai Scan AR</Text>
              <Text style={styles.heroDesc}>Pindai QR Code untuk melihat pahlawan dalam AR</Text>
            </View>
            <ChevronRight size={24} color="#FFFFFF" />
          </View>
          <View style={styles.heroPattern} />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Jelajahi Materi</Text>

        <View style={styles.grid}>
          <MenuCard testID="main-menu-heroes-button" title="Daftar Pahlawan" desc="20 Tokoh Nasional" icon={<Users size={24} color={COLORS.primary} />} color={COLORS.primary} onPress={() => router.push('/heroes')} />
          <MenuCard testID="main-menu-quiz-button" title="Kuis Interaktif" desc="10 Soal Pilihan" icon={<HelpCircle size={24} color="#2A9D8F" />} color="#2A9D8F" onPress={() => router.push('/quiz')} />
          <MenuCard testID="main-menu-leaderboard-button" title="Peringkat" desc="Top Skor Pemain" icon={<Trophy size={24} color="#F59E0B" />} color="#F59E0B" onPress={() => router.push('/leaderboard')} />

          {userRole === 'guru' && (
            <MenuCard testID="main-menu-dashboard-button" title="Dashboard Guru" desc="Panel Kontrol & Nilai" icon={<LayoutDashboard size={24} color="#E67E22" />} color="#E67E22" onPress={() => router.push('/dashboard-guru')} />
          )}

          <MenuCard testID="main-menu-guide-button" title="Panduan" desc="Cara Penggunaan" icon={<BookOpen size={24} color="#1E3A8A" />} color="#1E3A8A" onPress={() => router.push('/guide')} />
          <MenuCard testID="main-menu-about-button" title="Tentang" desc="Info Aplikasi" icon={<Info size={24} color="#6A0572" />} color="#6A0572" onPress={() => router.push('/about')} />
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/qr-codes')} style={styles.qrCard}>
          <View style={styles.qrIconWrap}>
            <QrCode size={22} color="#D4AF37" />
          </View>
          <View style={styles.qrTextWrap}>
            <Text style={styles.qrTitle}>QR Code Pahlawan</Text>
            <Text style={styles.qrDesc}>Lihat & cetak 20 QR untuk dipindai</Text>
          </View>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Pahlawan Pilihan</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
          {HEROES.slice(0, 5).map((hero) => (
            <TouchableOpacity key={hero.id} activeOpacity={0.85} style={styles.featureCard} onPress={() => router.push(`/hero/${hero.id}`)}>
              <HeroPortrait hero={hero} style={styles.featureImage} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.featureGradient} />
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>{hero.emoji}</Text>
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureName} numberOfLines={2}>
                  {hero.name}
                </Text>
                <Text style={styles.featureSub} numberOfLines={1}>
                  {hero.birthPlace}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🇮🇩 Dirgahayu Indonesia • Untuk Magelang Tercinta</Text>
        </View>
      </ScrollView>

      {/* CUSTOM MODAL LOGOUT */}
      <Modal visible={logoutPopup} transparent animationType="none" onRequestClose={closeLogoutConfirm}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: popupOpacity, transform: [{ scale: popupScale }] }]}>
            <Animated.View style={[styles.modalIconWrap, { transform: [{ scale: iconScale }] }]}>
              <LogOut size={56} color="#EF4444" />
            </Animated.View>

            <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Keluar Akun?</Text>
            <Text style={styles.modalMessage}>Apakah Anda yakin ingin keluar dari Pahlawan Nusantara AR?</Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={closeLogoutConfirm}>
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBtnConfirm} onPress={doLogout}>
                <Text style={styles.modalBtnConfirmText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function MenuCard({ testID, title, desc, icon, color, onPress }: MenuCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.menuCard, { width: CARD_W }]} onPress={onPress} testID={testID}>
      <View style={[styles.menuIconWrap, { backgroundColor: color + '15' }]}>{icon}</View>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuDesc}>{desc}</Text>
      <View style={[styles.menuAccent, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.md,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: { flex: 1 },
  headerRightActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  greeting: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  roleBadge: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  appSub: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 1,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 6,
    borderRadius: 10,
  },
  progressBox: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    padding: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  progressCount: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingTop: 16 },
  heroCard: {
    borderRadius: RADIUS.large,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.gold,
    minHeight: 95,
  },
  heroCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  heroIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroTextWrap: { flex: 1 },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.9),',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  heroPattern: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 12,
    minHeight: 110,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  menuDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  menuAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    width: '40%',
    borderTopRightRadius: 3,
  },
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  qrIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTextWrap: { flex: 1 },
  qrTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  qrDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  featureCard: {
    width: 140,
    height: 190,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#000',
    ...SHADOWS.md,
  },
  featureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featureGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  featureBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadgeText: { fontSize: 14 },
  featureTextWrap: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  featureName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  featureSub: {
    color: '#D4AF37',
    fontSize: 10,
    marginTop: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
  },

  modalOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 15 },
  modalIconWrap: { marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 28, lineHeight: 20 },

  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
