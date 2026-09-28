import { NextResponse } from 'next/server';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role_code !== 'SUPER_ADMIN' && user.role_code !== 'ADMIN_ARSIP')) {
      return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
    }

    const catId = parseInt(params.id, 10);
    const db = getDb();
    const existing = db.prepare('SELECT * FROM archive_categories WHERE id = ?').get(catId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const { code, name, description, unit_id, is_active } = await request.json();

    const cleanCode = code ? code.trim().toUpperCase() : existing.code;
    if (cleanCode !== existing.code) {
      const dup = db.prepare('SELECT id FROM archive_categories WHERE code = ? AND id != ?').get(cleanCode, catId);
      if (dup) {
        return NextResponse.json({ error: 'Kode kategori sudah digunakan' }, { status: 400 });
      }
    }

    db.prepare(`
      UPDATE archive_categories SET
        code = ?,
        name = ?,
        description = ?,
        unit_id = ?,
        is_active = ?
      WHERE id = ?
    `).run(
      cleanCode,
      name ? name.trim() : existing.name,
      description !== undefined ? description : existing.description,
      unit_id !== undefined ? (unit_id ? parseInt(unit_id, 10) : null) : existing.unit_id,
      is_active !== undefined ? is_active : existing.is_active,
      catId
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'UPDATE_CATEGORY',
      module: 'CATEGORY',
      recordId: cleanCode,
      description: `Memperbarui kategori: ${name || existing.name}`,
    });

    return NextResponse.json({ success: true, message: 'Kategori berhasil diperbarui' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memperbarui kategori' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_code !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya Super Admin yang dapat menghapus kategori' }, { status: 403 });
    }

    const catId = parseInt(params.id, 10);
    const db = getDb();
    const existing = db.prepare('SELECT * FROM archive_categories WHERE id = ?').get(catId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const count = (db.prepare('SELECT COUNT(*) as count FROM archives WHERE category_id = ?').get(catId) as any).count;
    if (count > 0) {
      db.prepare('UPDATE archive_categories SET is_active = 0 WHERE id = ?').run(catId);
      return NextResponse.json({ success: true, message: `Kategori dinonaktifkan karena memiliki ${count} arsip.` });
    }

    db.prepare('DELETE FROM archive_categories WHERE id = ?').run(catId);
    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 });
  }
}
