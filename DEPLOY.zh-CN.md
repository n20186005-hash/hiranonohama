# 部署说明

## 1. 本地运行

```bash
corepack enable
corepack prepare pnpm@10.15.1 --activate
pnpm install
pnpm dev
```

开发地址通常为 `http://localhost:4321`。

## 2. 构建

```bash
pnpm build
pnpm preview
```

Astro 会生成纯静态文件到 `dist/`。本项目没有数据库、登录、CMS 或服务端接口。

## 3. 部署到 Cloudflare Workers

```bash
npx wrangler login
pnpm deploy
```

`wrangler.jsonc` 已配置为 Workers Static Assets，部署内容来自 `dist/`，并使用项目内的 `404.html`。

## 4. 域名配置

默认站点 URL 只保存在：

```text
src/config/site.ts
```

默认值为用户指定的域名，但页面正文和页脚不会显示域名。它只用于 canonical、Open Graph、sitemap 和 robots 等机器可读元数据。

域名尚未注册时，可在构建命令中临时覆盖：

```bash
PUBLIC_SITE_URL=https://your-worker-name.workers.dev pnpm build
```

正式注册后，在 Cloudflare Dashboard 为 Worker 添加 Custom Domain，并用正式 URL 重新构建、部署。

## 5. GA4

GA4 Measurement ID 位于：

```text
src/config/site.ts
```

当前已设置为：

```text
G-HXM22WWPKP
```

所有页面通过统一 Layout 自动加载 GA4，不需要逐页添加。

## 6. 更新内容

- 页面：`src/pages/`
- 全局组件：`src/components/`
- 景点、美食、FAQ 数据：`src/data/content.ts`
- 颜色与排版：`src/styles/global.css`
- 照片：`public/images/`
- 默认域名与 GA4：`src/config/site.ts`

更新照片时，请同步维护 `PHOTO_SOURCES.md` 中的授权记录。
