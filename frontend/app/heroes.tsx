import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Search, CheckCircle2, MapPin } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../src/theme/colors';
import { HEROES } from '../src/data/heroes';
import { getLearnedHeroes, markHeroAsLearned } from '../src/utils/progress';
import HeroPortrait from '../src/components/HeroPortrait';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_W = (width - 16 * 2 - CARD_GAP) / 2;

export default function HeroesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [learned, setLearned] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getLearnedHeroes().then(setLearned);
    }, []),
  );

  const handleSelectHero = async (hero: (typeof HEROES)[0]) => {
    // Simpan progres secara silent (hybrid) lalu navigasi
    await markHeroAsLearned(hero.id, hero.name);
    router.push(`/hero/${hero.id}`);
  };

  const filtered = HEROES.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()) || h.birthPlace.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <LinearGradient colors={['#CE1126', '#A60D1D']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="heroes-back-button">
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Daftar Pahlawan</Text>
            <Text style={styles.headerSub}>
              {learned.length}/{HEROES.length} dipelajari • Mode tanpa AR
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Cari nama pahlawan..." placeholderTextColor={COLORS.textMuted} style={styles.searchInput} testID="heroes-search-input" />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filtered.map((hero, idx) => {
            // Pencocokan tanda centang berdasarkan id atau nama
            const isLearned = learned.includes(hero.id) || learned.includes(hero.name);

            return (
              <TouchableOpacity key={hero.id} activeOpacity={0.85} style={[styles.card, { width: CARD_W }]} onPress={() => handleSelectHero(hero)} testID={`hero-list-item-${hero.id}`}>
                <View style={styles.imageWrap}>
                  <HeroPortrait hero={hero} style={styles.image} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.imageGradient} />
                  <View style={[styles.numberBadge, { backgroundColor: hero.color }]}>
                    <Text style={styles.numberText}>{idx + 1}</Text>
                  </View>
                  {isLearned && (
                    <View style={styles.learnedBadge}>
                      <CheckCircle2 size={18} color="#2A9D8F" fill="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {hero.name}
                  </Text>
                  <View style={styles.cardLocation}>
                    <MapPin size={11} color={COLORS.textMuted} />
                    <Text style={styles.cardLocText} numberOfLines={1}>
                      {hero.birthPlace}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Tidak ada pahlawan ditemukan</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  headerSub: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMain,
    height: '100%',
  },
  list: { padding: 16, paddingTop: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrap: {
    width: '100%',
    height: 170,
    backgroundColor: '#F1F3F5',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  numberBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  numberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  learnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 10 },
  cardName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
    minHeight: 36,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardLocText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
