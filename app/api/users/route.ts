import { NextResponse } from 'next/server';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_code !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya Super Admin yang dapat mengelola pengguna' }, { status: 403 });
    }

    const db = getDb();
    const users = db.prepare(`
      SELECT u.id, u.username, u.email, u.full_name, u.nip, u.job_title,
             u.unit_id, u.role_id, u.status, u.last_login, u.created_at,
             r.code as role_code, r.name as role_name,
             un.name as unit_name, un.code as unit_code
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN units un ON u.unit_id = un.id
      ORDER BY u.id ASC
    `).all();

    const roles = db.prepare('SELECT * FROM roles ORDER BY id ASC').all();
    const units = db.prepare('SELECT id, code, name FROM units WHERE is_active = 1 ORDER BY display_order ASC').all();

    return NextResponse.json({ data: users, roles, units });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memuat pengguna' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_code !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya Super Admin' }, { status: 403 });
    }

    const { username, email, password, full_name, nip, job_title, unit_id, role_id } = await request.json();

    if (!username || !email || !password || !full_name || !role_id) {
      return NextResponse.json({ error: 'Mohon lengkapi field wajib (*)' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const db = getDb();

    // Check unique username or email
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(cleanUsername, email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'Username atau Email sudah terdaftar' }, { status: 400 });
    }

    const { hash, salt } = hashPassword(password);

    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, password_salt, full_name, nip, job_title, unit_id, role_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(
      cleanUsername,
      email.trim().toLowerCase(),
      hash,
      salt,
      full_name.trim(),
      nip ? nip.trim() : null,
      job_title ? job_title.trim() : null,
      unit_id ? parseInt(unit_id, 10) : null,
      parseInt(role_id, 10)
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'CREATE_USER',
      module: 'USER',
      recordId: cleanUsername,
      description: `Membuat pengguna baru: ${full_name} (${cleanUsername})`,
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid, message: 'Pengguna berhasil dibuat' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal membuat pengguna' }, { status: 500 });
  }
}
