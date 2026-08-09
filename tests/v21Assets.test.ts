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
    for (const sample of ['雙星參考', '回到今', '全部六組', '交劍煞', '九七相會']) {
      expect([...sample].every((character) => inventory.includes(character))).toBe(true);
    }
  });
});
