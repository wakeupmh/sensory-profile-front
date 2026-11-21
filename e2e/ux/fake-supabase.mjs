// Stand-in for Supabase auth: publishes a JWKS and signs one test user's token.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendDir = process.env.BACKEND_DIR || path.resolve(here, '../../../sensory-profile-backend');
const { generateKeyPair, exportJWK, SignJWT } = await import(pathToFileURL(path.join(backendDir, 'node_modules/jose/dist/webapi/index.js')).href);

const BASE = 'http://127.0.0.1:54321';
const { publicKey, privateKey } = await generateKeyPair('ES256');
const jwk = { ...(await exportJWK(publicKey)), kid: 'ux', alg: 'ES256', use: 'sig' };
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'mae.teste@example.com', aud: 'authenticated', role: 'authenticated',
  app_metadata: { provider: 'email' }, user_metadata: { full_name: 'Mãe Teste' }, created_at: '2026-01-01T00:00:00Z' };
const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
const token = await new SignJWT({ email: user.email, role: 'authenticated' })
  .setProtectedHeader({ alg: 'ES256', kid: 'ux' }).setSubject(user.id).setAudience('authenticated')
  .setIssuer(`${BASE}/auth/v1`).setIssuedAt().setExpirationTime(exp).sign(privateKey);
const session = { access_token: token, refresh_token: 'ux-refresh', token_type: 'bearer', expires_in: 43200, expires_at: exp, user };
fs.writeFileSync(path.join(here, 'session.json'), JSON.stringify(session));

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') return res.end();
  const json = (b) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(b)); };
  if (req.url.startsWith('/auth/v1/.well-known/jwks.json')) return json({ keys: [jwk] });
  if (req.url.startsWith('/auth/v1/user')) return json(user);
  if (req.url.startsWith('/auth/v1/token')) return json(session);
  if (req.url.startsWith('/auth/v1/logout')) { res.statusCode = 204; return res.end(); }
  res.statusCode = 404; json({ msg: 'not faked: ' + req.url });
}).listen(54321, '127.0.0.1', () => console.log('fake supabase up'));
