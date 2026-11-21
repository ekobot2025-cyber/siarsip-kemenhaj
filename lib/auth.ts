import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getDb } from './db';
import { User, RoleCode, Archive } from './types';

const TOKEN_SECRET = process.env.AUTH_SECRET || 'siarsip-kemenhaj-papua-secret-key-2026';
const COOKIE_NAME = 'siarsip_session';

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

export function createToken(payload: { id: number; username: string; role_code: string; unit_id: number | null }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { id: number; username: string; role_code: string; unit_id: number | null } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const db = getDb();
  const user = db.prepare(`
    SELECT u.id, u.username, u.email, u.full_name, u.nip, u.job_title, 
           u.unit_id, u.role_id, u.status, u.last_login, u.created_at,
           r.code as role_code, r.name as role_name,
           un.name as unit_name, un.code as unit_code
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN units un ON u.unit_id = un.id
    WHERE u.id = ? AND u.status = 'ACTIVE'
  `).get(payload.id) as (User & { role_code: RoleCode }) | undefined;

  return user || null;
}

export function canAccessArchive(user: User, archive: Archive): boolean {
  if (user.role_code === 'SUPER_ADMIN') return true;
  if (user.role_code === 'PIMPINAN') return true;

  // Public archives are accessible by all authenticated users
  if (archive.security_level === 'PUBLIK') return true;

  // Internal: accessible by all internal users
  if (archive.security_level === 'INTERNAL') return true;

  // Terbatas: accessible only by users belonging to the same unit, or Super Admin / Pimpinan
  if (archive.security_level === 'TERBATAS') {
    if (user.role_code === 'ADMIN_ARSIP') return true;
    return user.unit_id === archive.unit_id;
  }

  // Rahasia: accessible only by Super Admin, Pimpinan, or Unit Admin of the specific unit
  if (archive.security_level === 'RAHASIA') {
    if (user.role_code === 'SUPER_ADMIN') return true;
    if (user.role_code === 'PIMPINAN') return true;
    if (user.role_code === 'ADMIN_UNIT' && user.unit_id === archive.unit_id) return true;
    return false;
  }

  return false;
}

export function canEditArchive(user: User, archive: Archive): boolean {
  if (user.role_code === 'SUPER_ADMIN') return true;
  if (user.role_code === 'ADMIN_ARSIP') return true;
  if (user.role_code === 'ADMIN_UNIT' && user.unit_id === archive.unit_id) return true;
  if (user.role_code === 'PEGAWAI' && user.id === archive.created_by) return true;
  return false;
}
