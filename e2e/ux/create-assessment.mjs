// Fills the new-assessment wizard through the UI like a parent would, for an EXISTING child.
// Passes (exit 0) only if the save returns 201 and no extra child was created.
// usage: node create-assessment.mjs [relationshipValue] [examinerName]
// Contact fields are left blank on purpose: a parent may not want to share them.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const relationship = process.argv[2] || 'mother';
const examinerName = process.argv[3] || 'Dra. Júlia Lima';
const API = 'http://localhost:3000';
const session = JSON.parse(fs.readFileSync(new URL('session.json', import.meta.url)));
const auth = { Authorization: `Bearer ${session.access_token}` };
const api = async (path, init = {}) => (await fetch(API + path, { ...init, headers: { ...auth, ...init.headers } })).json();

// Start from step 1: drop any saved draft.
await fetch(`${API}/api/drafts/sensory_assessment`, { method: 'DELETE', headers: auth });
const childrenBefore = (await api('/api/children')).data.length;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
await ctx.addInitScript((s) => localStorage.setItem('sb-127-auth-token', JSON.stringify(s)), session);
const page = await ctx.newPage();
let saveResult = null;
page.on('response', async (r) => {
  if (r.url().endsWith('/api/assessments') && r.request().method() === 'POST') {
    saveResult = { status: r.status(), body: (await r.text()).slice(0, 300) };
  }
});

await page.goto('http://localhost:5173/assessment/new', { waitUntil: 'networkidle' });
await page.getByText('Léo Souza', { exact: true }).first().click();

let lastAlert = [];
for (let step = 0; step < 20 && !saveResult; step++) {
  const onExaminerStep = await page.getByText(/Etapa \d+ de \d+: Examinador/i).count() > 0;
  for (const input of await page.locator('input[type="text"]:visible, input[type="email"]:visible, input[type="tel"]:visible, input:not([type]):visible').all()) {
    if (await input.inputValue()) continue;
    const key = `${(await input.getAttribute('id')) || ''} ${(await input.getAttribute('name')) || ''}`.toLowerCase();
    if (/contact|contato|email|phone|telefone/.test(key)) continue;
    await input.fill(/prof/.test(key) ? 'Terapeuta ocupacional' : onExaminerStep ? examinerName : 'Maria Souza');
  }
  for (const select of await page.locator('select:visible').all()) {
    const values = await select.locator('option').evaluateAll((os) => os.map((o) => o.value));
    await select.selectOption(values.includes(relationship) ? relationship : values.find(Boolean));
  }
  for (const group of await page.locator('[role="radiogroup"]:visible').all()) {
    if (await group.locator('[aria-checked="true"], input:checked').count()) continue;
    await group.locator('[role="radio"], input[type="radio"]').first().click();
  }
  const next = page.getByRole('button', { name: /^(Próximo|Criar Avalia)/ }).last();
  if (!(await next.count())) break;
  await next.click();
  await page.waitForTimeout(300);
  lastAlert = await page.locator('[role="alert"]:visible').allTextContents();
}
await page.waitForTimeout(1500);
await page.screenshot({ path: new URL(`save-${relationship}.png`, import.meta.url).pathname });
await browser.close();

const childrenAfter = (await api('/api/children')).data.length;
const ok = saveResult?.status === 201 && childrenAfter === childrenBefore;
console.log(`${ok ? 'PASS' : 'FAIL'} relationship=${relationship} examiner=${JSON.stringify(examinerName)} save=${saveResult?.status ?? 'never sent'} children ${childrenBefore}->${childrenAfter}`
  + (ok ? '' : ` alert=${JSON.stringify(lastAlert).slice(0, 200)} body=${saveResult?.body ?? ''}`));
process.exit(ok ? 0 : 1);
