import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'documents');

// GET single incoming letter
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const letterId = parseInt(params.id, 10);
    const db = getDb();

    const letter = db.prepare(`
      SELECT il.*,
             u.code as unit_code, u.name as unit_name,
             usr.full_name as creator_name
      FROM incoming_letters il
      JOIN units u ON il.target_unit_id = u.id
      JOIN users usr ON il.created_by = usr.id
      WHERE il.id = ?
    `).get(letterId);

    if (!letter) {
      return NextResponse.json({ error: 'Surat masuk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: letter });
  } catch (err: any) {
    console.error('Fetch incoming letter error:', err);
    return NextResponse.json({ error: 'Gagal memuat detail surat masuk' }, { status: 500 });
  }
}

// PUT update incoming letter manual fields & optional scan file
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const letterId = parseInt(params.id, 10);
    const db = getDb();

    const existing = db.prepare('SELECT * FROM incoming_letters WHERE id = ?').get(letterId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Surat masuk tidak ditemukan' }, { status: 404 });
    }

    const formData = await request.formData();
    const letterNumber = (formData.get('letter_number') as string || existing.letter_number).trim();
    const letterDate = (formData.get('letter_date') as string || existing.letter_date).trim();
    const receivedDate = (formData.get('received_date') as string || existing.received_date).trim();
    const senderInstitution = (formData.get('sender_institution') as string || existing.sender_institution).trim();
    const subject = (formData.get('subject') as string || existing.subject).trim();
    const letterNature = (formData.get('letter_nature') as string || existing.letter_nature).trim();
    const targetUnitId = parseInt(formData.get('target_unit_id') as string, 10) || existing.target_unit_id;
    const summary = formData.has('summary') ? (formData.get('summary') as string).trim() : existing.summary;
    const notes = formData.has('notes') ? (formData.get('notes') as string).trim() : existing.notes;
    const status = (formData.get('status') as string || existing.status).trim();

    // Check optional file upload
    const file = formData.get('file') as File | null;
    let filePath = existing.file_path;
    let fileName = existing.file_name;
    let fileSize = existing.file_size;
    let fileType = existing.file_type;

    if (file && file.size > 0) {
      if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      }

      fileName = file.name;
      fileSize = file.size;
      fileType = file.type || 'application/pdf';

      const ext = path.extname(file.name) || '.pdf';
      const cleanSaveName = `SURAT_MASUK_${existing.agenda_number.replace(/\//g, '_')}_${Date.now()}${ext}`;
      const fullDiskPath = path.join(STORAGE_DIR, cleanSaveName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(fullDiskPath, buffer);

      filePath = `storage/documents/${cleanSaveName}`;
    }

    const stmt = db.prepare(`
      UPDATE incoming_letters
      SET letter_number = ?,
          letter_date = ?,
          received_date = ?,
          sender_institution = ?,
          subject = ?,
          letter_nature = ?,
          target_unit_id = ?,
          summary = ?,
          notes = ?,
          status = ?,
          file_path = ?,
          file_name = ?,
          file_size = ?,
          file_type = ?,
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    stmt.run(
      letterNumber,
      letterDate,
      receivedDate,
      senderInstitution,
      subject,
      letterNature,
      targetUnitId,
      summary,
      notes,
      status,
      filePath,
      fileName,
      fileSize,
      fileType,
      letterId
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'UPDATE_INCOMING_LETTER',
      module: 'PERSURATAN',
      recordId: existing.agenda_number,
      description: `Pembaruan data surat masuk ${existing.agenda_number} (Pengirim: ${senderInstitution}, No: ${letterNumber})`,
    });

    return NextResponse.json({
      success: true,
      message: `Data surat masuk ${existing.agenda_number} berhasil diperbarui`,
    });
  } catch (err: any) {
    console.error('Update incoming letter error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui surat masuk: ' + err.message }, { status: 500 });
  }
}

// DELETE incoming letter
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const letterId = parseInt(params.id, 10);
    const db = getDb();

    const existing = db.prepare('SELECT * FROM incoming_letters WHERE id = ?').get(letterId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Surat masuk tidak ditemukan' }, { status: 404 });
    }

    db.prepare('DELETE FROM incoming_letters WHERE id = ?').run(letterId);

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'DELETE_INCOMING_LETTER',
      module: 'PERSURATAN',
      recordId: existing.agenda_number,
      description: `Penghapusan register surat masuk agenda ${existing.agenda_number}`,
    });

    return NextResponse.json({
      success: true,
      message: `Surat masuk dengan Nomor Agenda ${existing.agenda_number} berhasil dihapus`,
    });
  } catch (err: any) {
    console.error('Delete incoming letter error:', err);
    return NextResponse.json({ error: 'Gagal menghapus surat masuk' }, { status: 500 });
  }
}
