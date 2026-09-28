import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@libsql/client';
import path from 'path';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

const creds = hashPassword('kakanwil123');
console.log('Generated hash for kakanwil123:');
console.log('Salt:', creds.salt);
console.log('Hash:', creds.hash);

// 1. Update local DB
const localDbPath = path.join(process.cwd(), 'data', 'siarsip.db');
const localDb = new DatabaseSync(localDbPath);
localDb.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE username = ?')
  .run(creds.hash, creds.salt, 'kakanwil');
console.log('✅ Updated local siarsip.db for kakanwil');

// 2. Update Turso Cloud DB
const TURSO_URL = 'libsql://siarsip-db-ekobot2025-cyber.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA2MDk3OTUsImlkIjoiMDFhMGU4YTgtYTcwMS03OTJkLWIzNzMtZjNlMmQxNWNlZTk2Iiwia2lkIjoiQmRLS1p5M3BaWXVNX0sxaDZLX1RFaGprNEd0ZjBpTlZMcTJNMlc2V1VNSSIsInJpZCI6ImZlMDIwMDQ0LWYwMDYtNGFjYy05ODZhLTA2ZGFmZjkwYjcxZSJ9.tayCRPY2yjSJfqV3Wfww67ZczCaXlDT8rAF5-nphbHER0ipzvmMI8YZ7J1jx7WPTx6jyE5x5dbotJKwuUiHWDg';

async function updateTurso() {
  const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  const res = await turso.execute({
    sql: 'UPDATE users SET password_hash = ?, password_salt = ? WHERE username = ?',
    args: [creds.hash, creds.salt, 'kakanwil'],
  });
  console.log('✅ Updated Turso Cloud DB for kakanwil. Rows affected:', res.rowsAffected);

  // Verify
  const verify = await turso.execute({
    sql: 'SELECT username, password_hash, password_salt FROM users WHERE username = ?',
    args: ['kakanwil'],
  });
  const row = verify.rows[0];
  const testHash = crypto.pbkdf2Sync('kakanwil123', row.password_salt, 100000, 64, 'sha512').toString('hex');
  console.log('✅ Turso Cloud verification result with password "kakanwil123":', testHash === row.password_hash ? 'SUCCESS!' : 'FAILED');
}

updateTurso().catch(console.error);
