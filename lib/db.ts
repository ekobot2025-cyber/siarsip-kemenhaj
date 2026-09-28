import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'siarsip.db');
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'documents');

// Ensure directories exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Global cache for development hot reloading
declare global {
  var __siarsip_db: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (!globalThis.__siarsip_db) {
    const db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    initSchema(db);
    globalThis.__siarsip_db = db;
  }
  return globalThis.__siarsip_db;
}

export function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      module TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS units (
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
    );

    CREATE TABLE IF NOT EXISTS users (
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
    );

    CREATE TABLE IF NOT EXISTS archive_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_code TEXT UNIQUE NOT NULL,
      unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
      category_id INTEGER NOT NULL REFERENCES archive_categories(id) ON DELETE RESTRICT,
      document_number TEXT,
      document_title TEXT NOT NULL,
      document_date TEXT NOT NULL,
      year INTEGER NOT NULL,
      subject TEXT,
      origin TEXT,
      destination TEXT,
      description TEXT,
      keywords TEXT,
      security_level TEXT NOT NULL DEFAULT 'INTERNAL',
      status TEXT NOT NULL DEFAULT 'AKTIF',
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_type TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS archive_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, archive_id)
    );

    CREATE TABLE IF NOT EXISTS recent_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
      viewed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, archive_id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
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
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'INFO',
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS incoming_letters (
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
      archive_id INTEGER REFERENCES archives(id),
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS outgoing_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agenda_number TEXT UNIQUE NOT NULL,
      letter_number TEXT NOT NULL,
      letter_date TEXT NOT NULL,
      recipient TEXT NOT NULL,
      recipient_institution TEXT,
      subject TEXT NOT NULL,
      sender_unit_id INTEGER NOT NULL REFERENCES units(id),
      signer_name TEXT,
      letter_nature TEXT NOT NULL DEFAULT 'Biasa',
      summary TEXT,
      notes TEXT,
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_type TEXT,
      status TEXT NOT NULL DEFAULT 'DIPROSES',
      archive_id INTEGER REFERENCES archives(id),
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_archives_unit ON archives(unit_id);
    CREATE INDEX IF NOT EXISTS idx_archives_category ON archives(category_id);
    CREATE INDEX IF NOT EXISTS idx_archives_year ON archives(year);
    CREATE INDEX IF NOT EXISTS idx_archives_code ON archives(archive_code);
    CREATE INDEX IF NOT EXISTS idx_archives_title ON archives(document_title);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_incoming_agenda ON incoming_letters(agenda_number);
    CREATE INDEX IF NOT EXISTS idx_outgoing_agenda ON outgoing_letters(agenda_number);
  `);
}

export function generateNextArchiveCode(unitCode: string, year: number): string {
  const db = getDb();
  // Prefix: ARS/{KODE_UNIT}/{TAHUN}/
  const prefix = `ARS/${unitCode}/${year}/`;
  const stmt = db.prepare(`
    SELECT archive_code FROM archives 
    WHERE archive_code LIKE ? 
    ORDER BY archive_code DESC LIMIT 1
  `);
  const last = stmt.get(`${prefix}%`) as { archive_code: string } | undefined;
  
  let nextSeq = 1;
  if (last && last.archive_code) {
    const parts = last.archive_code.split('/');
    const lastNumStr = parts[parts.length - 1];
    const parsed = parseInt(lastNumStr, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const paddedNum = String(nextSeq).padStart(5, '0');
  return `${prefix}${paddedNum}`;
}

export function generateNextIncomingAgendaNumber(year: number): string {
  const db = getDb();
  const prefix = `SM/${year}/`;
  const stmt = db.prepare(`
    SELECT agenda_number FROM incoming_letters 
    WHERE agenda_number LIKE ? 
    ORDER BY agenda_number DESC LIMIT 1
  `);
  const last = stmt.get(`${prefix}%`) as { agenda_number: string } | undefined;
  
  let nextSeq = 1;
  if (last && last.agenda_number) {
    const parts = last.agenda_number.split('/');
    const lastNumStr = parts[parts.length - 1];
    const parsed = parseInt(lastNumStr, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const paddedNum = String(nextSeq).padStart(5, '0');
  return `${prefix}${paddedNum}`;
}

export function generateNextOutgoingAgendaNumber(year: number): string {
  const db = getDb();
  const prefix = `SK/${year}/`;
  const stmt = db.prepare(`
    SELECT agenda_number FROM outgoing_letters 
    WHERE agenda_number LIKE ? 
    ORDER BY agenda_number DESC LIMIT 1
  `);
  const last = stmt.get(`${prefix}%`) as { agenda_number: string } | undefined;
  
  let nextSeq = 1;
  if (last && last.agenda_number) {
    const parts = last.agenda_number.split('/');
    const lastNumStr = parts[parts.length - 1];
    const parsed = parseInt(lastNumStr, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const paddedNum = String(nextSeq).padStart(5, '0');
  return `${prefix}${paddedNum}`;
}


export function logAudit(params: {
  userId?: number | null;
  userName?: string;
  action: string;
  module: string;
  recordId?: string | null;
  description: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, user_name, action, module, record_id, description, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      params.userId || null,
      params.userName || 'System',
      params.action,
      params.module,
      params.recordId || null,
      params.description,
      params.ipAddress || '127.0.0.1',
      params.userAgent || 'Internal'
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
