/**
 * 把 dist-single/ 的 index.html + app.css + app.js 合成一個可雙擊開啟的 HTML。
 * 用法：npm run build:single
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist-single';
const files = readdirSync(dir, { recursive: true }).map(String);
const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));
if (!jsFile) throw new Error('找不到 build 產物，請先跑 vite build');

// IIFE 模式下 Vite 會把 CSS 直接注入 JS，因此 .css 檔可能不存在。
const css = cssFile ? readFileSync(join(dir, cssFile), 'utf8') : '';
const js = readFileSync(join(dir, jsFile), 'utf8').replace(/\/\/# sourceMappingURL=.*/g, '');
const icon = readFileSync('public/icons/icon-192.svg', 'utf8');
const iconUrl = 'data:image/svg+xml;base64,' + Buffer.from(icon).toString('base64');

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0e0f14">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="玄空紫白">
<link rel="icon" href="${iconUrl}">
<link rel="apple-touch-icon" href="${iconUrl}">
<title>玄空紫白</title>
<style>
${css}
</style>
</head>
<body>
<div id="app"></div>
<noscript>本 App 需要 JavaScript，請用 Safari / Chrome / Edge 開啟。</noscript>
<script>
${js}
</script>
</body>
</html>
`;

writeFileSync('玄空紫白.html', html);
console.log('已產生 玄空紫白.html（' + (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB）');
