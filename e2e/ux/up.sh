#!/usr/bin/env bash
# Brings up the full stack for a UX check: local Postgres, a stand-in for Supabase auth,
# the real backend on a fresh database, the real frontend, and a seeded parent account.
# Needs: Postgres 16 (Debian pg_ctlcluster) with role testuser/testpass, both repos checked
# out side by side with dependencies installed, and Playwright for the check scripts.
# Then, from this folder (NODE_PATH lets the scripts find a global Playwright):
#   NODE_PATH=$(npm root -g) node crawl.mjs             # every screen at phone size
#   NODE_PATH=$(npm root -g) node create-assessment.mjs mother   # save an assessment like a parent
#   NODE_PATH=$(npm root -g) node create-anamnese.mjs   # save and edit an anamnese
set -euo pipefail
cd "$(dirname "$0")"
HERE="$(pwd)"
FRONT_DIR="$(cd ../.. && pwd)"
BACKEND_DIR="${BACKEND_DIR:-$(cd "$FRONT_DIR/../sensory-profile-backend" && pwd)}"
export BACKEND_DIR
pg_lsclusters | grep -q online || pg_ctlcluster 16 main start
pkill -f "fake-supabase.mjs" || true; pkill -f "src/index.ts" || true; pkill -f "vite --port 5173" || true; sleep 1
su postgres -c "psql -qc \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='sensory_ux'\" -c 'DROP DATABASE IF EXISTS sensory_ux' -c 'CREATE DATABASE sensory_ux OWNER testuser'" >/dev/null
export DATABASE_URL=postgresql://testuser:testpass@localhost:5432/sensory_ux
(cd $BACKEND_DIR && npm run -s migrate >/dev/null)
nohup node fake-supabase.mjs > fake.log 2>&1 &
sleep 1
(cd $BACKEND_DIR && SUPABASE_URL=http://127.0.0.1:54321 FRONTEND_URL=http://localhost:5173 NODE_ENV=development PORT=3000 nohup npx ts-node --transpile-only src/index.ts > $HERE/backend.log 2>&1 &)
(cd $FRONT_DIR && VITE_API_URL=http://localhost:3000 VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=ux-anon nohup npx vite --port 5173 --strictPort > $HERE/front.log 2>&1 &)
for i in $(seq 1 60); do curl -sf localhost:3000/health >/dev/null && curl -sf localhost:5173 >/dev/null && break; sleep 1; done
node seed.mjs
psql "$DATABASE_URL" -tAc "select (select id from children where name='Ana Souza')||' '||(select id from sensory_assessments limit 1)||' '||(select id from goals limit 1)" > ids.txt
exit 0
