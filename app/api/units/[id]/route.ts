import { NextResponse } from 'next/server';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_code !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya Super Admin yang dapat mengubah unit kerja' }, { status: 403 });
    }

    const unitId = parseInt(params.id, 10);
    const db = getDb();
    const existing = db.prepare('SELECT * FROM units WHERE id = ?').get(unitId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Unit kerja tidak ditemukan' }, { status: 404 });
    }

    const { code, name, leader_name, leader_nip, description, display_order, is_active } = await request.json();

    const cleanCode = code ? code.trim().toUpperCase() : existing.code;

    // Check duplicate code if changed
    if (cleanCode !== existing.code) {
      const dup = db.prepare('SELECT id FROM units WHERE code = ? AND id != ?').get(cleanCode, unitId);
      if (dup) {
        return NextResponse.json({ error: `Kode unit "${cleanCode}" sudah digunakan unit lain` }, { status: 400 });
      }
    }

    db.prepare(`
      UPDATE units SET
        code = ?,
        name = ?,
        leader_name = ?,
        leader_nip = ?,
        description = ?,
        display_order = ?,
        is_active = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      cleanCode,
      name !== undefined ? name.trim() : existing.name,
      leader_name !== undefined ? leader_name.trim() : existing.leader_name,
      leader_nip !== undefined ? leader_nip.trim() : existing.leader_nip,
      description !== undefined ? description.trim() : existing.description,
      display_order !== undefined ? display_order : existing.display_order,
      is_active !== undefined ? is_active : existing.is_active,
      unitId
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'UPDATE_UNIT',
      module: 'UNIT',
      recordId: cleanCode,
      description: `Memperbarui unit kerja: ${existing.name} -> ${name || existing.name}`,
    });

    return NextResponse.json({ success: true, message: 'Unit kerja berhasil diperbarui' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memperbarui unit kerja' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_code !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya Super Admin yang dapat menonaktifkan/menghapus unit' }, { status: 403 });
    }

    const unitId = parseInt(params.id, 10);
    const db = getDb();
    const existing = db.prepare('SELECT * FROM units WHERE id = ?').get(unitId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Unit kerja tidak ditemukan' }, { status: 404 });
    }

    // Check if archives exist
    const archiveCount = (db.prepare('SELECT COUNT(*) as count FROM archives WHERE unit_id = ?').get(unitId) as any).count;
    if (archiveCount > 0) {
      // Toggle inactive instead of hard delete to preserve foreign key integrity
      db.prepare('UPDATE units SET is_active = 0, updated_at = datetime("now", "localtime") WHERE id = ?').run(unitId);
      logAudit({
        userId: user.id,
        userName: user.full_name,
        action: 'DEACTIVATE_UNIT',
        module: 'UNIT',
        recordId: existing.code,
        description: `Menonaktifkan unit kerja: ${existing.name} (Memiliki ${archiveCount} arsip tersimpan)`,
      });
      return NextResponse.json({ success: true, message: `Unit dinonaktifkan karena memiliki ${archiveCount} arsip tersimpan.` });
    } else {
      db.prepare('DELETE FROM units WHERE id = ?').run(unitId);
      logAudit({
        userId: user.id,
        userName: user.full_name,
        action: 'DELETE_UNIT',
        module: 'UNIT',
        recordId: existing.code,
        description: `Menghapus unit kerja: ${existing.name}`,
      });
      return NextResponse.json({ success: true, message: 'Unit kerja berhasil dihapus' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memproses unit kerja' }, { status: 500 });
  }
}
