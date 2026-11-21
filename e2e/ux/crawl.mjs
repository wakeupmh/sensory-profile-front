// Visits each screen as a signed-in parent on a phone and records what a person would hit.
// usage: node crawl.mjs [comma-separated routes] [outDir]
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const session = JSON.parse(fs.readFileSync(new URL('session.json', import.meta.url)));
const [child, assessment, goal] = fs.readFileSync(new URL('ids.txt', import.meta.url), 'utf8').trim().split(' ');
const routes = (process.argv[2] ? process.argv[2].split(',') : [
  '/', '/dashboard', '/assessments', '/assessment/new', `/assessment/${assessment}`, `/assessment/${assessment}/report`,
  '/anamneses', '/anamnese/new', '/children', `/children/${child}`, `/children/${child}/ficha`, '/logs', '/relato-do-dia',
  '/therapy', '/medical', '/development', '/education', '/goals', `/goals/${goal}`, '/documents', '/monthly-recap',
  '/settings', `/consolidated/${child}`, '/professionals', '/shared',
]);
const outDir = new URL(process.argv[3] || 'shots', import.meta.url).pathname;
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
  locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
});
await ctx.addInitScript((s) => localStorage.setItem('sb-127-auth-token', JSON.stringify(s)), session);

const report = [];
for (const route of routes) {
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 160)));
  page.on('response', (r) => r.url().includes(':3000/') && r.status() >= 400
    && bad.push(`${r.status()} ${r.request().method()} ${new URL(r.url()).pathname}`));
  const t0 = Date.now();
  await page.goto('http://localhost:5173' + route, { waitUntil: 'networkidle' }).catch((e) => errors.push('GOTO ' + e.message));
  const ms = Date.now() - t0;
  const facts = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const small = [...document.querySelectorAll('button, a, [role="button"], input, select')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44) && getComputedStyle(el).visibility !== 'hidden';
      })
      .map((el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || el.tagName).trim().slice(0, 30));
    return {
      overflow,
      smallTargets: small.length,
      smallSample: small.slice(0, 6),
      h1: document.querySelector('h1')?.textContent?.trim().slice(0, 50) ?? null,
      height: document.documentElement.scrollHeight,
    };
  });
  const file = `${outDir}/${route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root'}.png`;
  await page.screenshot({ path: file, fullPage: true });
  report.push({ route, ms, ...facts, errors, bad, file });
  await page.close();
}
await browser.close();
fs.writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));
for (const r of report) {
  console.log(`${r.route.slice(0, 46).padEnd(46)} ${String(r.ms).padStart(5)}ms h1=${JSON.stringify(r.h1)} overflow=${r.overflow} small=${r.smallTargets} h=${r.height} bad=${r.bad.join('|')} err=${r.errors.length}`);
}
