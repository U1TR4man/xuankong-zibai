import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

function typescriptStringLiterals(source: string): string {
  const result: string[] = [];
  let index = 0;
  let quote: string | null = null;
  while (index < source.length) {
    const character = source[index]!;
    const following = source[index + 1] ?? '';
    if (quote !== null) {
      if (character === '\\') {
        index += 2;
        continue;
      }
      if (character === quote) quote = null;
      else result.push(character);
      index += 1;
      continue;
    }
    if (character === '/' && following === '/') {
      const end = source.indexOf('\n', index + 2);
      if (end === -1) break;
      index = end;
      continue;
    }
    if (character === '/' && following === '*') {
      const end = source.indexOf('*/', index + 2);
      if (end === -1) break;
      index = end + 2;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') quote = character;
    index += 1;
  }
  return result.join('');
}

describe('V2.1 離線品牌字體', () => {
  it('使用合法的小型 WOFF2，並以 base-safe preload 載入', () => {
    const fontPath = resolve(root, 'public/fonts/zibai-serif-medium.woff2');
    const font = readFileSync(fontPath);
    const html = readFileSync(resolve(root, 'index.html'), 'utf8');
    const css = readFileSync(resolve(root, 'src/styles.css'), 'utf8');
    const license = readFileSync(resolve(root, 'public/fonts/OFL.txt'), 'utf8');

    expect(font.subarray(0, 4).toString('ascii')).toBe('wOF2');
    expect(statSync(fontPath).size).toBeLessThan(300 * 1024);
    expect(html).toContain('%BASE_URL%fonts/zibai-serif-medium.woff2');
    expect(css).toContain("font-family: 'Zibai Serif'");
    expect(css).toContain("url('/fonts/zibai-serif-medium.woff2')");
    expect(license).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });

  it('每個可 focus 的九宮格子都把焦點框畫在內側', () => {
    // 全域 `:focus-visible` 的 outline-offset 是 +2px，焦點框畫在元素**外面**。
    // 九宮格子是等分 grid item，外框會疊到相鄰格、並在盤緣被 `.grid` 的
    // overflow: hidden 切掉，看起來像多了一圈殘缺的邊框——2026-08-11 實機回報過。
    // 只在關閉 sheet 之後出現，是因為 returnFocusSelector 用程式呼叫 .focus()。
    // 新增可 focus 的格子時必須同時補上內側 focus ring，本測試會擋下遺漏。
    const css = readFileSync(resolve(root, 'src/styles.css'), 'utf8');
    const srcRoot = resolve(root, 'src');
    const cellClasses = new Set<string>();
    for (const relative of readdirSync(srcRoot, { recursive: true }).map(String)) {
      if (!relative.endsWith('Grid.ts')) continue;
      const source = readFileSync(resolve(srcRoot, relative), 'utf8');
      if (!source.includes("el('button'")) continue;
      for (const match of source.matchAll(/'([a-z]+-cell)'/g)) cellClasses.add(match[1]!);
    }
    expect([...cellClasses].sort()).toEqual(['overlay-cell', 'selection-cell']);
    for (const cls of cellClasses) {
      expect(
        new RegExp(`\\.${cls}:focus-visible\\s*\\{[^}]*outline-offset:\\s*-`).test(css),
        `.${cls} 缺少內側 focus ring`,
      ).toBe(true);
    }
  });

  it('可重跑 glyph inventory 涵蓋所有目前靜態 UI 中文', () => {
    const inventory = readFileSync(resolve(root, 'public/fonts/zibai-serif-glyphs.txt'), 'utf8');
    const srcRoot = resolve(root, 'src');
    const sourceFiles = [
      ...readdirSync(srcRoot, { recursive: true }).map(String)
        .filter((path) => path.endsWith('.ts') || path.endsWith('.tsx'))
        .map((path) => resolve(srcRoot, path)),
      resolve(root, 'index.html'),
      resolve(root, 'vite.config.ts'),
    ];
    const uiChinese = new Set(
      sourceFiles.flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return [...(path.endsWith('.html') ? source : typescriptStringLiterals(source))];
      })
        .filter((character) => /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u.test(character)),
    );
    expect([...uiChinese].filter((character) => !inventory.includes(character))).toEqual([]);
    for (const sample of [
      '雙星用途參考', '僅篩選相關雙星斷語', '警示', '公曆元旦', '子初',
      '回到今', '全部六組', '交劍煞', '九七相會',
    ]) {
      expect([...sample].every((character) => inventory.includes(character))).toBe(true);
    }
    const staticUiText = sourceFiles.map((path) => {
      const source = readFileSync(path, 'utf8');
      return path.endsWith('.html') ? source : typescriptStringLiterals(source);
    }).join('');
    expect(staticUiText).not.toMatch(/[⚠✦✓⚑]/u);
  });
});
