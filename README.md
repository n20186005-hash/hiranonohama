# 平野の浜｜山中湖と富士山の絶景ガイド

平野の浜を紹介する日本語専用の静的観光ガイドです。Astro、Tailwind CSS、TypeScript、Cloudflare Workers Static Assets で構成しています。

## 開発

```bash
pnpm install
pnpm dev
```

## ビルド

```bash
pnpm build
pnpm preview
```

## Cloudflare Workers へデプロイ

```bash
pnpm deploy
```

初回は Wrangler の認証案内に従ってください。カスタムドメインは Cloudflare Dashboard 側で Worker に割り当てます。

## URL設定

既定URLは `src/config/site.ts` にあります。登録前・ステージング環境では、ビルド時に環境変数で差し替えられます。

```bash
PUBLIC_SITE_URL=https://example.pages.dev pnpm build
```

## コンテンツ運用

- データベース、ログイン、CMSは使用していません。
- ページ本文は `src/pages`、共通情報は `src/data` で直接編集します。
- 写真は `public/images` に保存され、ページ表示時に外部画像サービスへ接続しません。
- 写真カード機能はブラウザ内で処理し、画像をサーバーへ送信しません。
- GA4 測定IDは `src/config/site.ts` にあります。
