import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// A CSP do vercel.json libera scripts inline do index.html pelo hash. Mudou o
// script, muda o hash, ou a página abre sem o tema e com erro de CSP.
// Mudanças na CSP devem ser conferidas num preview da Vercel (console do
// navegador sem violações) antes de ir para produção.
const fromRoot = (file: string) => resolve(process.cwd(), file);
const csp = (JSON.parse(readFileSync(fromRoot('vercel.json'), 'utf8')) as {
  headers: { headers: { key: string; value: string }[] }[];
}).headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')!.value;

describe('Content-Security-Policy in vercel.json', () => {
  it('allows every inline script in index.html by hash', () => {
    const html = readFileSync(fromRoot('index.html'), 'utf8');
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(inline.length).toBeGreaterThan(0);
    const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'))!;
    for (const body of inline) {
      expect(scriptSrc).toContain(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
    }
  });

  it('keeps the service worker loadable', () => {
    expect(csp).toContain("worker-src 'self'");
  });
});
