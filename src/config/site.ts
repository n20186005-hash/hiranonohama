export const DEFAULT_SITE_URL = 'https://hiranonohama.com';

// Google Maps 共有短縮リンク（評価・口コミ・地図の出典）
export const MAPS_SHARE_URL = 'https://maps.app.goo.gl/vs3tGxvQdvXPZrnY9';

// Google Maps 埋め込み用 src（アクセスページで再利用）
export const MAPS_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3251.2151412661515!2d138.9008237!3d35.4247002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60196fec8ed01c37%3A0xaea15f41d50a234a!2z5bmz6YeO44Gu5rWc!5e0!3m2!1sja!2sjp!4v1785404715977!5m2!1sja!2sjp';

// 評価・口コミの出典（Google マップ ユーザー評価より同期）
// 注意：評価はページ上の表示のみとし、JSON-LD には含めない（Google ポリシー配慮）
export const reviews = {
  rating: 4.6,
  count: 2019,
  bestRating: 5,
  syncMonth: '2026年10月',
  source: 'Google マップ',
  mapsUrl: MAPS_SHARE_URL,
} as const;

// 単一観光地の実体（エンティティ）束縛用設定
export const entity = {
  fullName: '平野の浜（Hirano beach）',
  shortName: '平野の浜',
  romanized: 'Hirano no Hama',
  domain: 'hiranonohama.com',
  city: '山中湖村',
  stateProvince: '山梨県',
  country: '日本',
  countryCode: 'JP',
  postalCode: '401-0502',
  streetAddress: '山梨県南都留郡山中湖村平野13',
  mapsShareUrl: MAPS_SHARE_URL,
  mapsEmbedSrc: MAPS_EMBED_SRC,
  // 山梨県 公式観光ポータル（地域・行政の権威リンク）
  govtTourismUrl: 'https://www.yamanashi-kankou.jp/',
  // 山中湖観光協会（ダイヤモンド富士の公式目安時期を公開）
  lakeYamanakakoUrl: 'https://www.lake-yamanakako.com/',
} as const;

export const siteConfig = {
  name: '平野の浜',
  domain: entity.domain,
  title: '平野の浜（山中湖）｜駐車場・アクセス・富士山撮影ガイド',
  description:
    '山中湖の絶景スポット「平野の浜」を紹介。駐車場・アクセス・富士山の撮影時間・逆さ富士・ダイヤモンド富士の見頃など、訪問前に知りたい情報をまとめました。',
  locale: 'ja_JP',
  language: 'ja',
  ga4Id: 'G-HXM22WWPKP',
  defaultImage: '/images/og.webp',
  coordinates: {
    latitude: 35.4247002,
    longitude: 138.9008237,
  },
  address: '山梨県南都留郡山中湖村平野',
  entity,
  reviews,
} as const;

export const navigation = [
  { href: '/access/', label: 'アクセス' },
  { href: '/photo/', label: '撮影ガイド' },
  { href: '/diamond-fuji/', label: 'ダイヤモンド富士' },
  { href: '/food/', label: '食べる' },
  { href: '/nearby/', label: '周辺案内' },
  { href: '/guide/', label: '過ごし方' },
  { href: '/faq/', label: 'よくある質問' },
] as const;
