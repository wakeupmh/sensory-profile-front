// Seeds a realistic account through the real API, as a parent would.
import fs from 'node:fs';
const { access_token: T } = JSON.parse(fs.readFileSync(new URL('session.json', import.meta.url)));
const API = 'http://localhost:3000';
async function call(method, path, body) {
  const r = await fetch(API + path, { method, headers: { Authorization: `Bearer ${T}`, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} ${r.status} ${JSON.stringify(j).slice(0, 300)}`);
  return j.data ?? j;
}
const day = (d, h = 12) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, 0, 0, 0); return x.toISOString(); };
const scale = ['quase nunca', 'ocasionalmente', 'metade do tempo', 'frequentemente', 'quase sempre'];

// The seeded parent has already agreed to the health-data terms; the first-run checks use a new user.
const { currentVersion } = await call('GET', '/api/account/consent');
await call('POST', '/api/account/consent', { version: currentVersion });
const ana = await call('POST', '/api/children', { name: 'Ana Souza', birthDate: '2019-05-10', gender: 'female' });
const leo = await call('POST', '/api/children', { name: 'Léo Souza', birthDate: '2022-02-03', gender: 'male' });
await call('POST', '/api/assessments', {
  child: { id: ana.id, name: ana.name, birthDate: '2019-05-10' },
  examiner: { name: 'Dra. Júlia Lima', profession: 'Terapeuta ocupacional' },
  caregiver: { name: 'Mãe Teste', relationship: 'mother' },
  responses: Array.from({ length: 86 }, (_, i) => ({ itemId: i + 1, response: scale[(i * 7) % 5] })),
});
for (let d = 0; d < 7; d++) {
  await call('POST', '/api/logs', { childId: ana.id, logType: 'mood', occurredAt: day(d, 9), data: { level: (d % 5) + 1, tags: d % 2 ? ['agitada'] : [] } });
  await call('POST', '/api/logs', { childId: ana.id, logType: 'sleep', occurredAt: day(d, 7), data: { bedtime: '21:00', waketime: '06:30', wakings: d % 3, quality: (d % 3) + 1 } });
}
await call('POST', '/api/logs', { childId: ana.id, logType: 'abc', occurredAt: day(1, 15), data: { antecedent: 'Barulho do liquidificador', behavior: 'Cobriu os ouvidos e chorou', consequence: 'Levada para o quarto' }, notes: 'Durou uns 10 minutos' });
await call('POST', '/api/medical/medications', { childId: ana.id, name: 'Melatonina', dosage: '1 mg', frequency: 'à noite', startDate: '2026-03-10' });
const goal = await call('POST', '/api/goals', { childId: ana.id, domain: 'comunicacao', title: 'Pedir ajuda com palavras', masteryCriteria: '4 de 5 oportunidades', baselineValue: 1, targetValue: 5, unit: 'vezes/dia' });
for (const [d, v] of [[20, 1], [12, 2], [4, 3]]) await call('POST', `/api/goals/${goal.id}/progress`, { recordedAt: day(d), value: v });
const tomorrow = new Date(); tomorrow.setUTCDate(tomorrow.getUTCDate() + 2); tomorrow.setUTCHours(0, 0, 0, 0);
await call('POST', '/api/reminders', { childId: ana.id, title: 'Retorno com a TO', dueAt: tomorrow.toISOString() });
console.log('seeded', { ana: ana.id, leo: leo.id, goal: goal.id });
