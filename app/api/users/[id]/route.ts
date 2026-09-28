import { NextResponse } from 'next/server';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_code !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
    }

    const targetUserId = parseInt(params.id, 10);
    const db = getDb();
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(targetUserId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const { email, full_name, nip, job_title, unit_id, role_id, status, password } = await request.json();

    if (password && password.trim().length >= 6) {
      const { hash, salt } = hashPassword(password);
      db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, targetUserId);
    }

    db.prepare(`
      UPDATE users SET
        email = COALESCE(?, email),
        full_name = COALESCE(?, full_name),
        nip = ?,
        job_title = ?,
        unit_id = ?,
        role_id = COALESCE(?, role_id),
        status = COALESCE(?, status),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      email ? email.trim().toLowerCase() : existing.email,
      full_name ? full_name.trim() : existing.full_name,
      nip !== undefined ? (nip ? nip.trim() : null) : existing.nip,
      job_title !== undefined ? (job_title ? job_title.trim() : null) : existing.job_title,
      unit_id !== undefined ? (unit_id ? parseInt(unit_id, 10) : null) : existing.unit_id,
      role_id ? parseInt(role_id, 10) : existing.role_id,
      status || existing.status,
      targetUserId
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'UPDATE_USER',
      module: 'USER',
      recordId: existing.username,
      description: `Memperbarui profil pengguna: ${existing.username}`,
    });

    return NextResponse.json({ success: true, message: 'Data pengguna berhasil diperbarui' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memperbarui pengguna' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_code !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
    }

    const targetUserId = parseInt(params.id, 10);
    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(targetUserId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    // Toggle INACTIVE
    db.prepare('UPDATE users SET status = "INACTIVE", updated_at = datetime("now", "localtime") WHERE id = ?').run(targetUserId);

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'DEACTIVATE_USER',
      module: 'USER',
      recordId: existing.username,
      description: `Menonaktifkan pengguna: ${existing.username}`,
    });

    return NextResponse.json({ success: true, message: 'Pengguna dinonaktifkan' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menonaktifkan pengguna' }, { status: 500 });
  }
}
