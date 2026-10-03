import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield } from 'lucide-react-native';
import { COLORS } from '../src/theme/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.6), []);
  const slideAnim = useMemo(() => new Animated.Value(30), []);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);
  const dotsAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    let isMounted = true;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.timing(dotsAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();

    const t = setTimeout(() => {
      if (isMounted) {
        router.replace('/login');
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [router, fadeAnim, scaleAnim, slideAnim, rotateAnim, dotsAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container} testID="splash-screen">
      <LinearGradient colors={['#8B0000', '#CE1126', '#A60D1D']} style={StyleSheet.absoluteFill} />

      {/* Dekorasi lingkaran */}
      <Animated.View style={[styles.decorCircle, styles.circleTop, { transform: [{ rotate }] }]} />
      <View style={[styles.decorCircle, styles.circleBottom]} />

      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Shield size={48} color={COLORS.primary} fill={COLORS.secondary} />
          </View>
        </View>
        <View style={styles.goldRing} />
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
          marginTop: 32,
          paddingHorizontal: 24,
        }}
      >
        <Text style={styles.title}>PAHLAWAN</Text>
        <Text style={styles.titleAccent}>NUSANTARA</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Pengenalan Tokoh Pahlawan Nasional di Magelang</Text>
        <Text style={styles.subtitleSmall}>Berbasis Augmented Reality (AR)</Text>
      </Animated.View>

      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => {
            const o = dotsAnim.interpolate({
              inputRange: [0, 0.33 + i * 0.15, 0.66 + i * 0.15, 1],
              outputRange: [0.3, 1, 0.3, 0.3],
            });
            return <Animated.View key={i} style={[styles.dot, { opacity: o }]} />;
          })}
        </View>
        <Text style={styles.loadingText}>Memuat materi pembelajaran...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circleTop: {
    width: width * 1.4,
    height: width * 1.4,
    top: -width * 0.7,
    right: -width * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  circleBottom: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: -width * 0.3,
    left: -width * 0.3,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  goldRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.5)',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 20,
    fontWeight: '300',
    color: '#D4AF37',
    letterSpacing: 12,
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#D4AF37',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontWeight: '500',
  },
  subtitleSmall: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 1,
  },
});
