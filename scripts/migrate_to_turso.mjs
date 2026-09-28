import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@libsql/client';
import path from 'path';

const TURSO_URL = 'libsql://siarsip-db-ekobot2025-cyber.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA2MDk3OTUsImlkIjoiMDFhMGU4YTgtYTcwMS03OTJkLWIzNzMtZjNlMmQxNWNlZTk2Iiwia2lkIjoiQmRLS1p5M3BaWXVNX0sxaDZLX1RFaGprNEd0ZjBpTlZMcTJNMlc2V1VNSSIsInJpZCI6ImZlMDIwMDQ0LWYwMDYtNGFjYy05ODZhLTA2ZGFmZjkwYjcxZSJ9.tayCRPY2yjSJfqV3Wfww67ZczCaXlDT8rAF5-nphbHER0ipzvmMI8YZ7J1jx7WPTx6jyE5x5dbotJKwuUiHWDg';

async function migrate() {
  console.log('--- STARTING SI-ARSIP MIGRATION TO TURSO CLOUD ---');
  
  // 1. Open Local SQLite
  const localDbPath = path.join(process.cwd(), 'data', 'siarsip.db');
  console.log('Reading local SQLite database from:', localDbPath);
  const localDb = new DatabaseSync(localDbPath);

  // 2. Open Turso Client
  const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  console.log('Connected to Turso Cloud:', TURSO_URL);

  // 3. Create Schema on Turso
  console.log('\nCreating schema on Turso Cloud...');
  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      module TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );`,
    `CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      leader_name TEXT,
      leader_nip TEXT,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      full_name TEXT NOT NULL,
      nip TEXT,
      job_title TEXT,
      unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
      role_id INTEGER NOT NULL REFERENCES roles(id),
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS archive_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_code TEXT UNIQUE NOT NULL,
      unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
      category_id INTEGER NOT NULL REFERENCES archive_categories(id) ON DELETE RESTRICT,
      document_number TEXT,
      document_title TEXT NOT NULL,
      document_date TEXT NOT NULL,
      year INTEGER NOT NULL,
      subject TEXT NOT NULL,
      origin TEXT,
      destination TEXT,
      description TEXT,
      keywords TEXT,
      security_level TEXT NOT NULL DEFAULT 'INTERNAL',
      status TEXT NOT NULL DEFAULT 'AKTIF',
      retention_period INTEGER NOT NULL DEFAULT 5,
      retention_action TEXT NOT NULL DEFAULT 'PERMANEN',
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_type TEXT,
      physical_location TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0,
      download_count INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS incoming_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agenda_number TEXT UNIQUE NOT NULL,
      letter_number TEXT NOT NULL,
      letter_date TEXT NOT NULL,
      received_date TEXT NOT NULL,
      sender_institution TEXT NOT NULL,
      subject TEXT NOT NULL,
      letter_nature TEXT NOT NULL DEFAULT 'Biasa',
      target_unit_id INTEGER NOT NULL REFERENCES units(id),
      summary TEXT,
      notes TEXT,
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_type TEXT,
      status TEXT NOT NULL DEFAULT 'BARU',
      archive_id INTEGER REFERENCES archives(id) ON DELETE SET NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS outgoing_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agenda_number TEXT UNIQUE NOT NULL,
      letter_number TEXT NOT NULL,
      letter_date TEXT NOT NULL,
      destination_institution TEXT NOT NULL,
      subject TEXT NOT NULL,
      signer_name TEXT NOT NULL,
      signer_nip TEXT,
      origin_unit_id INTEGER NOT NULL REFERENCES units(id),
      file_path TEXT,
      file_name TEXT,
      status TEXT NOT NULL DEFAULT 'TERKIRIM',
      archive_id INTEGER REFERENCES archives(id) ON DELETE SET NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, archive_id)
    );`,
    `CREATE TABLE IF NOT EXISTS recent_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
      viewed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, archive_id)
    );`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT,
      description TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'INFO',
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );`
  ];

  for (const sql of schemaStatements) {
    await turso.execute(sql);
  }
  console.log('✓ All 14 tables created successfully on Turso!');

  // 4. Data Migration
  const tables = [
    'roles',
    'permissions',
    'role_permissions',
    'units',
    'users',
    'archive_categories',
    'archives',
    'incoming_letters',
    'outgoing_letters',
    'favorites',
    'recent_views',
    'audit_logs',
    'notifications',
    'settings'
  ];

  console.log('\nMigrating table data from local SQLite to Turso...');
  for (const table of tables) {
    const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) {
      console.log(`- ${table}: 0 rows (skipping)`);
      continue;
    }

    console.log(`- Migrating ${table} (${rows.length} rows)...`);
    for (const row of rows) {
      const keys = Object.keys(row);
      const cols = keys.join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => row[k]);

      try {
        await turso.execute({
          sql: `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`,
          args: values
        });
      } catch (err) {
        console.error(`Error inserting into ${table}:`, err.message);
      }
    }
    console.log(`  ✓ ${table} migration complete.`);
  }

  // 5. Verification
  console.log('\n--- VERIFYING TURSO DATABASE COUNTS ---');
  for (const table of ['roles', 'units', 'users', 'archive_categories', 'archives', 'incoming_letters']) {
    const res = await turso.execute(`SELECT COUNT(*) as count FROM ${table}`);
    console.log(`• Turso [${table}]: ${res.rows[0].count} rows.`);
  }

  console.log('\n--- MIGRATION TO TURSO CLOUD COMPLETED SUCCESSFULLY! ---');
}

migrate().catch(console.error);
