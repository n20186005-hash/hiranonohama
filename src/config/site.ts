export const DEFAULT_SITE_URL = 'https://HiranonoHama.com';

export const siteConfig = {
  name: '平野の浜',
  title: '平野の浜｜山中湖と富士山の絶景ガイド',
  description:
    '山中湖・平野の浜の見どころ、富士山撮影、ダイヤモンド富士、アクセス、周辺の食事と立ち寄り先をまとめた非公式観光ガイド。',
  locale: 'ja_JP',
  language: 'ja',
  ga4Id: 'G-HXM22WWPKP',
  defaultImage: '/images/og.webp',
  coordinates: {
    latitude: 35.4247002,
    longitude: 138.9008237,
  },
  address: '山梨県南都留郡山中湖村平野',
} as const;

export const navigation = [
  { href: '/access/', label: 'アクセス' },
  { href: '/photo/', label: '撮影ガイド' },
  { href: '/diamond-fuji/', label: 'ダイヤモンド富士' },
  { href: '/food/', label: '食べる' },
  { href: '/nearby/', label: '周辺案内' },
  { href: '/faq/', label: 'よくある質問' },
] as const;
