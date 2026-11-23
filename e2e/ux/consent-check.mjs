// A brand-new user meets the consent screen before any page, cannot continue without ticking,
// and lands in the app once they agree; the API then has the consent recorded.
// Exit 0 only if all of that holds.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const session = JSON.parse(fs.readFileSync(new URL('session-new-user.json', import.meta.url)));
const consentNow = async () => (await (await fetch('http://localhost:3000/api/account/consent', { headers: { Authorization: `Bearer ${session.access_token}` } })).json()).data;
const before = await consentNow();

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' });
await ctx.addInitScript((s) => localStorage.setItem('sb-127-auth-token', JSON.stringify(s)), session);
const page = await ctx.newPage();
await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

const checks = [];
const agree = page.getByRole('button', { name: /Concordar/ });
checks.push(['consent screen shown instead of the dashboard', await agree.isVisible() && !(await page.getByRole('heading', { name: 'Início' }).isVisible())]);
checks.push(['continue disabled until ticked', await agree.isDisabled()]);
await page.getByRole('checkbox').check();
await agree.click();
await page.getByRole('heading', { name: 'Início' }).waitFor({ timeout: 10000 }).catch(() => {});
checks.push(['dashboard shown after agreeing', await page.getByRole('heading', { name: 'Início' }).isVisible()]);
await page.screenshot({ path: new URL('consent-after.png', import.meta.url).pathname });
await browser.close();
const after = await consentNow();
checks.push(['API had no consent before', before.acceptedVersion === null]);
checks.push(['API records the current version after', after.acceptedVersion === after.currentVersion]);

for (const [name, ok] of checks) console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
process.exit(checks.every(([, ok]) => ok) ? 0 : 1);
