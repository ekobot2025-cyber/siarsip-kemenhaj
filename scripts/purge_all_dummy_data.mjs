import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

console.log('=== MENGOSONGKAN SELURUH DATA DUMMY TRANSAKSI (SIAP PRODUKSI) ===\n');

const ROOT_DIR = process.cwd();
const STORAGE_DOCS_DIR = path.join(ROOT_DIR, 'storage', 'documents');
const DB_PATH = path.join(ROOT_DIR, 'data', 'siarsip.db');

// 1. Bersihkan isi folder storage/documents
console.log('1. Membersihkan berkas di storage/documents...');
if (fs.existsSync(STORAGE_DOCS_DIR)) {
  const files = fs.readdirSync(STORAGE_DOCS_DIR);
  for (const f of files) {
    const p = path.join(STORAGE_DOCS_DIR, f);
    try {
      fs.unlinkSync(p);
    } catch (e) {
      console.warn('Gagal menghapus file:', f, e.message);
    }
  }
  console.log(`   ✓ Berhasil menghapus ${files.length} berkas di storage/documents.`);
} else {
  fs.mkdirSync(STORAGE_DOCS_DIR, { recursive: true });
}

// 2. Kosongkan tabel transaksi di SQLite lokal
console.log('\n2. Mengosongkan tabel transaksi di SQLite lokal (data/siarsip.db)...');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  DELETE FROM favorites;
  DELETE FROM recent_views;
  DELETE FROM archive_attachments;
  DELETE FROM incoming_letters;
  DELETE FROM outgoing_letters;
  DELETE FROM archives;
  DELETE FROM audit_logs;
  DELETE FROM notifications;

  DELETE FROM sqlite_sequence WHERE name IN (
    'favorites', 'recent_views', 'archive_attachments',
    'incoming_letters', 'outgoing_letters', 'archives',
    'audit_logs', 'notifications'
  );
`);
console.log('   ✓ SQLite lokal berhasil dikosongkan (archives: 0, incoming: 0, outgoing: 0, audit: 0).');

// 3. Kosongkan tabel transaksi di Turso Cloud Database
console.log('\n3. Mengosongkan tabel transaksi di Turso Cloud Database...');
const tursoUrl = 'libsql://siarsip-db-ekobot2025-cyber.aws-ap-northeast-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA2MDk3OTUsImlkIjoiMDFhMGU4YTgtYTcwMS03OTJkLWIzNzMtZjNlMmQxNWNlZTk2Iiwia2lkIjoiQmRLS1p5M3BaWXVNX0sxaDZLX1RFaGprNEd0ZjBpTlZMcTJNMlc2V1VNSSIsInJpZCI6ImZlMDIwMDQ0LWYwMDYtNGFjYy05ODZhLTA2ZGFmZjkwYjcxZSJ9.tayCRPY2yjSJfqV3Wfww67ZczCaXlDT8rAF5-nphbHER0ipzvmMI8YZ7J1jx7WPTx6jyE5x5dbotJKwuUiHWDg';

const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

const tursoTables = ['favorites', 'recent_views', 'archive_attachments', 'incoming_letters', 'outgoing_letters', 'archives', 'audit_logs', 'notifications'];
for (const t of tursoTables) {
  try {
    await client.execute(`DELETE FROM ${t};`);
  } catch (err) {
    // ignore if table doesn't exist
  }
}

try {
  await client.execute(`
    DELETE FROM sqlite_sequence WHERE name IN (
      'favorites', 'recent_views', 'archive_attachments',
      'incoming_letters', 'outgoing_letters', 'archives',
      'audit_logs', 'notifications'
    );
  `);
} catch (err) {
  // ignore
}
console.log('   ✓ Turso Cloud Database berhasil dikosongkan!');

// 4. Catat satu audit log inisialisasi resmi
db.prepare(`
  INSERT INTO audit_logs (user_id, user_name, action, module, record_id, description, ip_address, user_agent, created_at)
  VALUES (1, 'Super Administrator', 'SYSTEM_CLEANSE', 'SYSTEM', 'INIT', 'Sistem SI-ARSIP Kementerian Haji dan Umrah diinisialisasi untuk operasional resmi', '127.0.0.1', 'System Initialization', datetime('now', 'localtime'))
`).run();

await client.execute({
  sql: `
    INSERT INTO audit_logs (user_id, user_name, action, module, record_id, description, ip_address, user_agent, created_at)
    VALUES (1, 'Super Administrator', 'SYSTEM_CLEANSE', 'SYSTEM', 'INIT', 'Sistem SI-ARSIP Kementerian Haji dan Umrah diinisialisasi untuk operasional resmi', '127.0.0.1', 'System Initialization', datetime('now', 'localtime'))
  `
});

console.log('\n=== STATUS DATABASE SETELAH DIKOSONGKAN ===');
const localCount = db.prepare('SELECT COUNT(*) as c FROM archives').get().c;
const incomingCount = db.prepare('SELECT COUNT(*) as c FROM incoming_letters').get().c;
const outgoingCount = db.prepare('SELECT COUNT(*) as c FROM outgoing_letters').get().c;
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
const unitCount = db.prepare('SELECT COUNT(*) as c FROM units').get().c;
const catCount = db.prepare('SELECT COUNT(*) as c FROM archive_categories').get().c;

console.log(`- Total Arsip Transaksi : ${localCount}`);
console.log(`- Total Surat Masuk     : ${incomingCount}`);
console.log(`- Total Surat Keluar    : ${outgoingCount}`);
console.log(`- Master Pengguna Aktif : ${userCount} akun resmi`);
console.log(`- Master Unit Kerja     : ${unitCount} unit`);
console.log(`- Master Kategori Arsip : ${catCount} klasifikasi`);
console.log('\n=== SISTEM SIAP DIGUNAKAN UNTUK DATA NYATA ===');
