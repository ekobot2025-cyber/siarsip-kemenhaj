import { NextResponse } from 'next/server';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser, canAccessArchive, canEditArchive } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const archiveId = parseInt(params.id, 10);
    if (isNaN(archiveId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const db = getDb();
    const archive = db.prepare(`
      SELECT a.*,
             u.code as unit_code, u.name as unit_name, u.leader_name as unit_leader,
             c.code as category_code, c.name as category_name,
             usr.full_name as creator_name, usr.job_title as creator_job,
             CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
      FROM archives a
      JOIN units u ON a.unit_id = u.id
      JOIN archive_categories c ON a.category_id = c.id
      JOIN users usr ON a.created_by = usr.id
      LEFT JOIN favorites f ON f.archive_id = a.id AND f.user_id = ${user.id}
      WHERE a.id = ?
    `).get(archiveId) as any;

    if (!archive) {
      return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 });
    }

    // RBAC Security Check
    if (!canAccessArchive(user, archive)) {
      // Audit unauthorized attempt
      logAudit({
        userId: user.id,
        userName: user.full_name,
        action: 'ACCESS_DENIED',
        module: 'SECURITY',
        recordId: archive.archive_code,
        description: `Percobaan akses dokumen rahasia/terbatas ditolak: ${archive.archive_code}`,
      });
      return NextResponse.json({ 
        error: 'Akses Ditolak: Anda tidak memiliki wewenang untuk melihat arsip dengan tingkat keamanan ini.' 
      }, { status: 403 });
    }

    // Record recent view
    try {
      db.prepare(`
        INSERT INTO recent_views (user_id, archive_id, viewed_at)
        VALUES (?, ?, datetime('now', 'localtime'))
        ON CONFLICT(user_id, archive_id) DO UPDATE SET viewed_at = datetime('now', 'localtime')
      `).run(user.id, archiveId);
    } catch {}

    // Fetch attachments
    const attachments = db.prepare(`
      SELECT * FROM archive_attachments WHERE archive_id = ? ORDER BY id ASC
    `).all(archiveId);

    // Fetch audit history for this record
    const history = db.prepare(`
      SELECT * FROM audit_logs 
      WHERE record_id = ? OR description LIKE ?
      ORDER BY id DESC LIMIT 10
    `).all(archive.archive_code, `%${archive.archive_code}%`);

    return NextResponse.json({
      archive,
      attachments,
      history,
      canEdit: canEditArchive(user, archive),
    });
  } catch (err: any) {
    console.error('Archive detail error:', err);
    return NextResponse.json({ error: 'Gagal memuat arsip' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const archiveId = parseInt(params.id, 10);
    const db = getDb();
    const existing = db.prepare('SELECT * FROM archives WHERE id = ?').get(archiveId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 });
    }

    if (!canEditArchive(user, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki hak untuk mengedit arsip ini' }, { status: 403 });
    }

    const body = await request.json();
    const {
      document_title,
      document_number,
      document_date,
      year,
      subject,
      origin,
      destination,
      description,
      keywords,
      security_level,
      status,
      category_id,
      unit_id,
    } = body;

    const stmt = db.prepare(`
      UPDATE archives SET
        document_title = COALESCE(?, document_title),
        document_number = COALESCE(?, document_number),
        document_date = COALESCE(?, document_date),
        year = COALESCE(?, year),
        subject = COALESCE(?, subject),
        origin = COALESCE(?, origin),
        destination = COALESCE(?, destination),
        description = COALESCE(?, description),
        keywords = COALESCE(?, keywords),
        security_level = COALESCE(?, security_level),
        status = COALESCE(?, status),
        category_id = COALESCE(?, category_id),
        unit_id = COALESCE(?, unit_id),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    stmt.run(
      document_title,
      document_number,
      document_date,
      year,
      subject,
      origin,
      destination,
      description,
      keywords,
      security_level,
      status,
      category_id,
      unit_id,
      archiveId
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'UPDATE_ARCHIVE',
      module: 'ARCHIVE',
      recordId: existing.archive_code,
      description: `Memperbarui arsip: ${existing.archive_code}`,
    });

    return NextResponse.json({ success: true, message: 'Arsip berhasil diperbarui' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memperbarui arsip' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Super Admin and Admin E-Arsip can delete
    if (user.role_code !== 'SUPER_ADMIN' && user.role_code !== 'ADMIN_ARSIP') {
      return NextResponse.json({ error: 'Hanya Administrator yang dapat menghapus arsip' }, { status: 403 });
    }

    const archiveId = parseInt(params.id, 10);
    const db = getDb();
    const existing = db.prepare('SELECT * FROM archives WHERE id = ?').get(archiveId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 });
    }

    db.prepare('DELETE FROM archives WHERE id = ?').run(archiveId);

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'DELETE_ARCHIVE',
      module: 'ARCHIVE',
      recordId: existing.archive_code,
      description: `Menghapus arsip: ${existing.archive_code} - ${existing.document_title}`,
    });

    return NextResponse.json({ success: true, message: 'Arsip berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menghapus arsip' }, { status: 500 });
  }
}
