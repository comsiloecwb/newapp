#!/usr/bin/env node
/**
 * Aplica migration + seed + usuário dev no Supabase remoto.
 * Requer SUPABASE_DB_PASSWORD no .env (Dashboard → Settings → Database).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const path = join(root, '.env');
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return env;
}

function projectRefFromUrl(url) {
  const match = url?.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1];
}

async function main() {
  const env = loadEnv();
  const url = env.EXPO_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
  const password = env.SUPABASE_DB_PASSWORD ?? env.DATABASE_PASSWORD;

  if (!url) {
    console.error('❌ EXPO_PUBLIC_SUPABASE_URL ausente no .env');
    process.exit(1);
  }

  const ref = projectRefFromUrl(url);
  if (!ref) {
    console.error('❌ URL do Supabase inválida:', url);
    process.exit(1);
  }

  if (!password) {
    console.error(`
❌ Falta a senha do banco no .env

Adicione no arquivo .env:
  SUPABASE_DB_PASSWORD=sua-senha-do-postgres

Onde encontrar: Supabase Dashboard → Project Settings → Database → Database password
`);
    process.exit(1);
  }

  const connectionString =
    env.DATABASE_URL ??
    `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

  const files = [
    'supabase/migrations/20250603000000_initial.sql',
    'supabase/seed.sql',
    'supabase/seed-dev-user.sql',
  ];

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  console.log(`🔌 Conectando ao projeto ${ref}...`);
  await client.connect();

  try {
    for (const file of files) {
      const sql = readFileSync(join(root, file), 'utf8');
      console.log(`▶ ${file}`);
      await client.query(sql);
    }
    console.log(`
✅ Banco configurado!

Login de teste:
  E-mail: editor.igreja.dev@gmail.com
  Senha:  Igreja123!

Reinicie o Expo (npm start) se já estiver rodando.
`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  if (err.message.includes('password authentication failed')) {
    console.error('   Verifique SUPABASE_DB_PASSWORD no .env');
  }
  process.exit(1);
});
