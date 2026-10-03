import { useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { Hero } from '../data/heroes';

interface Props {
  hero: Hero;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

/**
 * Portrait component yang sudah disesuaikan untuk GAMBAR LOKAL.
 * Jika gambar lokal gagal dimuat, akan pakai ui-avatars.
 */
export default function HeroPortrait({ hero, style, resizeMode = 'cover' }: Props) {
  const [hasError, setHasError] = useState(false);

  // Bikin singkatan nama untuk fallback
  const safeName = encodeURIComponent(hero.name.replace(/Dr\.|Ir\.|R\.A\.|KH|W\.R\./g, '').trim());
  const bg = hero.color.replace('#', '');
  const fallbackUrl = `https://ui-avatars.com/api/?name=${safeName}&size=600&background=${bg}&color=fff&bold=true&format=png&font-size=0.4&length=2`;

  // --- LOGIKA BARU UNTUK GAMBAR LOKAL ---
  // Kita gunakan hero.photo (hasil dari require).
  // Kalau hasError bernilai true, baru kita pakai fallbackUrl.
  const source = hasError || !hero.photo ? { uri: fallbackUrl } : hero.photo;

  return <Image source={source} style={style} resizeMode={resizeMode} onError={() => setHasError(true)} />;
}
