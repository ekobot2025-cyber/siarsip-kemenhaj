import { NextResponse } from 'next/server';
import { getDb, logAudit } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare(`
      SELECT u.id, u.username, u.email, u.password_hash, u.password_salt,
             u.full_name, u.nip, u.job_title, u.unit_id, u.role_id, u.status,
             r.code as role_code, r.name as role_name,
             un.name as unit_name, un.code as unit_code
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN units un ON u.unit_id = un.id
      WHERE (u.username = ? OR u.email = ?)
    `).get(username, username) as any;

    if (!user) {
      return NextResponse.json({ error: 'Pengguna atau kata sandi tidak valid' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Akun Anda dinonaktifkan. Silakan hubungi Administrator.' }, { status: 403 });
    }

    const isValid = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      return NextResponse.json({ error: 'Pengguna atau kata sandi tidak valid' }, { status: 401 });
    }

    // Update last login
    db.prepare(`UPDATE users SET last_login = datetime('now', 'localtime') WHERE id = ?`).run(user.id);

    // Create session token
    const token = createToken({
      id: user.id,
      username: user.username,
      role_code: user.role_code,
      unit_id: user.unit_id,
    });

    // Audit log
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser';
    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'LOGIN',
      module: 'AUTH',
      description: `Pengguna ${user.full_name} (${user.role_name}) berhasil masuk`,
      ipAddress: ip,
      userAgent: userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        nip: user.nip,
        job_title: user.job_title,
        unit_id: user.unit_id,
        unit_name: user.unit_name,
        unit_code: user.unit_code,
        role_code: user.role_code,
        role_name: user.role_name,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('siarsip_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
