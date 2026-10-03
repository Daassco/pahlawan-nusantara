import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { ChevronLeft, Volume2, VolumeX, Calendar, MapPin, Award, Sparkles, Box, Building2 } from 'lucide-react-native';

import { COLORS, RADIUS, SHADOWS } from '../../src/theme/colors';
import { findHeroById } from '../../src/data/heroes';
import { markHeroAsLearned } from '../../src/utils/progress';
import HeroPortrait from '../../src/components/HeroPortrait';

const { width } = Dimensions.get('window');

export default function HeroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hero = findHeroById(id || '');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (hero) {
      // PENYESUAIAN: Kirim hero.id dan hero.name untuk sinkronisasi hybrid
      markHeroAsLearned(hero.id, hero.name);
    }
    return () => {
      Speech.stop();
    };
  }, [hero]);

  if (!hero) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Pahlawan tidak ditemukan</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.notFoundBtn}>
          <Text style={styles.notFoundBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const narrativeText = `${hero.name}, ${hero.title}. Lahir di ${hero.birthPlace} pada tanggal ${hero.birthDate}, wafat pada ${hero.deathDate}. Riwayat perjuangan: ${hero.story} Jasa terhadap Indonesia: ${hero.contributions} Hubungan dengan Kota Magelang: ${hero.magelangConnection}`;

  const toggleNarration = async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      Speech.speak(narrativeText, {
        language: 'id-ID',
        rate: 0.92,
        pitch: 1.0,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageWrap}>
          <HeroPortrait hero={hero} style={styles.image} />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(255,255,255,1)']} locations={[0, 0.3, 0.6, 1]} style={StyleSheet.absoluteFill} />
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 8 }]} testID="hero-detail-back-button">
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={[styles.emojiBadge, { top: insets.top + 8 }]}>
            <Text style={styles.emojiText}>{hero.emoji}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.titleCard, { borderTopColor: hero.color }]}>
            <Text style={styles.heroName} testID="hero-detail-name">
              {hero.name}
            </Text>
            <Text style={styles.heroTitle}>{hero.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Calendar size={13} color={COLORS.primary} />
                <Text style={styles.metaText}>{hero.birthDate}</Text>
              </View>
              <View style={styles.metaChip}>
                <MapPin size={13} color={COLORS.primary} />
                <Text style={styles.metaText}>{hero.birthPlace}</Text>
              </View>
            </View>
            <Text style={styles.deathDate}>Wafat: {hero.deathDate}</Text>
          </View>

          {/* Narration Button */}
          <TouchableOpacity activeOpacity={0.85} onPress={toggleNarration} style={styles.narrationBtn} testID="play-audio-narration-button">
            <LinearGradient colors={isPlaying ? ['#2A9D8F', '#1A6F66'] : ['#D4AF37', '#B8860B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={styles.narrationContent}>
              {isPlaying ? <VolumeX size={24} color="#FFFFFF" /> : <Volume2 size={24} color="#FFFFFF" />}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.narrationTitle}>{isPlaying ? 'Hentikan Narasi' : 'Putar Narasi Suara'}</Text>
                <Text style={styles.narrationSub}>{isPlaying ? 'Sedang membacakan biografi...' : 'Dengarkan biografi dalam Bahasa Indonesia'}</Text>
              </View>
              <Sparkles size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* AR View Button */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(`/ar/${hero.id}`)} style={styles.arBtn} testID="hero-detail-ar-button">
            <Box size={20} color={COLORS.primary} />
            <Text style={styles.arBtnText}>Lihat dalam AR 3D</Text>
          </TouchableOpacity>

          {/* Sections */}
          <Section icon={<Award size={18} color={COLORS.primary} />} title="Riwayat Perjuangan">
            <Text style={styles.bodyText}>{hero.story}</Text>
          </Section>

          <Section icon={<Sparkles size={18} color={COLORS.secondary} />} title="Jasa Terhadap Indonesia" color={COLORS.secondary}>
            <Text style={styles.bodyText}>{hero.contributions}</Text>
          </Section>

          <Section icon={<Building2 size={18} color="#2A9D8F" />} title="Hubungan dengan Magelang" color="#2A9D8F">
            <Text style={styles.bodyText}>{hero.magelangConnection}</Text>
          </Section>

          <View style={styles.qrInfo}>
            <Text style={styles.qrInfoLabel}>Kode QR</Text>
            <Text style={styles.qrInfoCode}>{hero.qrCode}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ icon, title, children, color = COLORS.primary }: { icon: React.ReactNode; title: string; children: React.ReactNode; color?: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: color + '15' }]}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={[styles.sectionLine, { backgroundColor: color }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: COLORS.textMuted, marginBottom: 16 },
  notFoundBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 100,
  },
  notFoundBtnText: { color: '#FFFFFF', fontWeight: '700' },
  imageWrap: { width: '100%', height: width * 1.0, backgroundColor: '#000' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBadge: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  emojiText: { fontSize: 22 },
  content: {
    paddingHorizontal: 16,
    marginTop: -40,
  },
  titleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.large,
    padding: 18,
    borderTopWidth: 4,
    ...SHADOWS.lg,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textMain,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaText: { fontSize: 12, color: COLORS.textMain, fontWeight: '600' },
  deathDate: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  narrationBtn: {
    marginTop: 16,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.gold,
  },
  narrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  narrationTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  narrationSub: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 2 },
  arBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.medium,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  arBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  sectionLine: { width: 36, height: 2, marginBottom: 10, borderRadius: 2 },
  bodyText: {
    color: COLORS.textMain,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'justify',
  },
  qrInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  qrInfoLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
  },
  qrInfoCode: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: '800',
    marginTop: 2,
    fontFamily: 'monospace',
  },
});
