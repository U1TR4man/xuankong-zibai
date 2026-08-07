import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

describe('V2.1 離線品牌字體', () => {
  it('使用合法的小型 WOFF2，並以 base-safe preload 載入', () => {
    const fontPath = resolve(root, 'public/fonts/zibai-serif-medium.woff2');
    const font = readFileSync(fontPath);
    const html = readFileSync(resolve(root, 'index.html'), 'utf8');
    const css = readFileSync(resolve(root, 'src/styles.css'), 'utf8');
    const license = readFileSync(resolve(root, 'public/fonts/OFL.txt'), 'utf8');

    expect(font.subarray(0, 4).toString('ascii')).toBe('wOF2');
    expect(statSync(fontPath).size).toBeLessThan(100 * 1024);
    expect(html).toContain('%BASE_URL%fonts/zibai-serif-medium.woff2');
    expect(css).toContain("font-family: 'Zibai Serif'");
    expect(css).toContain("url('/fonts/zibai-serif-medium.woff2')");
    expect(license).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });
});
