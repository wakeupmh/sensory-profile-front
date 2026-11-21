// Two layout rules on every screen, at phone size, scrolling like a person does:
//  1. the bottom menu stays on the bottom edge of the screen, with every tab fully visible;
//  2. no text runs outside the bordered panel that holds it.
// Exit 0 only if every screen passes both.
// usage: NODE_PATH=$(npm root -g) node layout-check.mjs [comma-separated routes]
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const session = JSON.parse(fs.readFileSync(new URL('session.json', import.meta.url)));
const [child, assessment, goal] = fs.readFileSync(new URL('ids.txt', import.meta.url), 'utf8').trim().split(' ');
const routes = process.argv[2] ? process.argv[2].split(',') : [
  '/dashboard', '/assessments', '/assessment/new', `/assessment/${assessment}`, `/assessment/${assessment}/edit`,
  `/assessment/${assessment}/report`, '/anamneses', '/anamnese/new', '/children', `/children/${child}`,
  `/children/${child}/ficha`, '/logs', '/relato-do-dia', '/therapy', '/medical', '/development', '/education',
  '/goals', `/goals/${goal}`, '/documents', '/monthly-recap', '/settings', `/consolidated/${child}`, '/professionals', '/shared',
];
const W = 390, H = 844;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
await ctx.addInitScript((s) => localStorage.setItem('sb-127-auth-token', JSON.stringify(s)), session);

let failures = 0;
for (const route of routes) {
  const page = await ctx.newPage();
  await page.goto('http://localhost:5173' + route, { waitUntil: 'networkidle' });
  // Scroll to the bottom the way a finger would, then measure.
  await page.mouse.wheel(0, 100000);
  await page.waitForTimeout(300);
  const result = await page.evaluate(({ W, H }) => {
    const problems = [];
    const bar = document.querySelector('.bottom-nav');
    const nav = bar && { n: bar, r: bar.getBoundingClientRect() };
    if (!nav) problems.push('no bottom menu found');
    else {
      if (Math.abs(nav.r.bottom - H) > 1) problems.push(`menu bottom at ${Math.round(nav.r.bottom)}, screen ends at ${H}`);
      for (const tab of nav.n.querySelectorAll('a, button')) {
        const r = tab.getBoundingClientRect();
        if (r.width && (r.left < -1 || r.right > W + 1)) problems.push(`menu tab "${tab.textContent.trim()}" off screen (${Math.round(r.left)}..${Math.round(r.right)})`);
      }
    }
    if (document.documentElement.scrollWidth > W) problems.push(`page is ${document.documentElement.scrollWidth}px wide`);
    // A panel is any element with a visible border; text must stay inside it unless a scroll box holds it.
    const panels = [...document.querySelectorAll('main *')].filter((el) => parseFloat(getComputedStyle(el).borderRightWidth) > 0 && el.getBoundingClientRect().width > 120);
    for (const panel of panels) {
      const pr = panel.getBoundingClientRect();
      const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        if (!t.textContent.trim()) continue;
        let scroller = t.parentElement;
        while (scroller && scroller !== panel && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowX)) scroller = scroller.parentElement;
        if (scroller && scroller !== panel) continue;
        const range = document.createRange(); range.selectNodeContents(t);
        const r = range.getBoundingClientRect();
        if (r.width && r.right > pr.right + 1) {
          problems.push(`"${t.textContent.trim().slice(0, 25)}" runs ${Math.round(r.right - pr.right)}px past its panel`);
          break;
        }
      }
    }
    return { problems: [...new Set(problems)].slice(0, 6), menuBottom: nav ? Math.round(nav.r.bottom) : null };
  }, { W, H });
  const { problems, menuBottom } = result;
  if (problems.length) failures++;
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${route.slice(0, 50)} (menu bottom ${menuBottom})${problems.length ? '\n       ' + problems.join('\n       ') : ''}`);
  await page.close();
}
await browser.close();
console.log(failures ? `${failures} screen(s) fail` : 'all screens pass');
process.exit(failures ? 1 : 0);
