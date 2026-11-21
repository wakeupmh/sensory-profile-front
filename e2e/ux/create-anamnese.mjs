// Fills the new-anamnese form through the UI for an EXISTING child. Exit 0 only if the save returns 201.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const API = 'http://localhost:3000';
const session = JSON.parse(fs.readFileSync(new URL('session.json', import.meta.url)));
await fetch(`${API}/api/drafts/anamnese`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` } });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
await ctx.addInitScript((s) => localStorage.setItem('sb-127-auth-token', JSON.stringify(s)), session);
const page = await ctx.newPage();
let save = null;
page.on('response', async (r) => {
  if (r.url().endsWith('/api/anamneses') && r.request().method() === 'POST') save = { status: r.status(), body: (await r.text()).slice(0, 300) };
});
await page.goto('http://localhost:5173/anamnese/new', { waitUntil: 'networkidle' });
await page.getByText('Léo Souza', { exact: true }).first().click();

let alerts = [];
for (let step = 0; step < 15 && !save; step++) {
  for (const input of await page.locator('input[type="text"]:visible, input:not([type]):visible').all()) {
    if (await input.inputValue()) continue;
    const key = `${(await input.getAttribute('id')) || ''} ${(await input.getAttribute('name')) || ''}`.toLowerCase();
    if (/contact|contato/.test(key)) { await input.fill('11 99999-0000'); continue; }
    await input.fill(/rel|parent/.test(key) ? 'Mãe' : 'Maria Souza');
  }
  for (const area of await page.locator('textarea:visible').all()) {
    if (!(await area.inputValue())) await area.fill('Fica muito irritada com barulho alto.');
  }
  for (const select of await page.locator('select:visible').all()) {
    const values = await select.locator('option').evaluateAll((os) => os.map((o) => o.value));
    if (!(await select.inputValue())) await select.selectOption(values.find(Boolean));
  }
  const next = page.getByRole('button', { name: /^(Próximo|Salvar|Criar|Finalizar)/ }).last();
  if (!(await next.count())) break;
  await next.click();
  await page.waitForTimeout(300);
  alerts = await page.locator('[role="alert"]:visible').allTextContents();
}
await page.waitForTimeout(1000);
await page.screenshot({ path: new URL('save-anamnese.png', import.meta.url).pathname });

// Then open it for editing and save again without changing anything.
let edit = null;
const list = await (await fetch(`${API}/api/anamneses`, { headers: { Authorization: `Bearer ${session.access_token}` } })).json();
const id = (list.data ?? list)[0]?.id;
page.on('response', async (r) => {
  if (r.url().includes(`/api/anamneses/${id}`) && r.request().method() === 'PUT') edit = { status: r.status(), body: (await r.text()).slice(0, 200) };
});
if (id) {
  await page.goto(`http://localhost:5173/anamnese/${id}/edit`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^(Salvar|Atualizar)/ }).last().click();
  await page.waitForTimeout(1500);
}
const editAlert = await page.locator('[role="alert"]:visible').allTextContents();
await browser.close();
const ok = save?.status === 201 && edit?.status === 200;
console.log(`${ok ? 'PASS' : 'FAIL'} anamnese save=${save?.status ?? 'never sent'} edit=${edit?.status ?? 'never sent'}${ok ? '' : ` alert=${JSON.stringify([...alerts, ...editAlert]).slice(0, 200)} body=${save?.body ?? ''}`}`);
process.exit(ok ? 0 : 1);
