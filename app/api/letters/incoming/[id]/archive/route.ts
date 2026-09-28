import { NextResponse } from 'next/server';
import { getDb, generateNextArchiveCode, logAudit } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
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
      SELECT il.*, u.code as unit_code, u.name as unit_name
      FROM incoming_letters il
      JOIN units u ON il.target_unit_id = u.id
      WHERE il.id = ?
    `).get(letterId) as any;

    if (!letter) {
      return NextResponse.json({ error: 'Surat masuk tidak ditemukan' }, { status: 404 });
    }

    if (letter.archive_id) {
      return NextResponse.json({ error: 'Surat ini sudah tersimpan dalam E-Arsip sebelumnya.' }, { status: 400 });
    }

    // Find category for Surat Masuk or use default category for this unit
    let category = db.prepare(`
      SELECT id FROM archive_categories 
      WHERE (name LIKE '%Surat Masuk%' OR name LIKE '%Dokumen Umum%')
      LIMIT 1
    `).get() as any;

    if (!category) {
      category = db.prepare('SELECT id FROM archive_categories LIMIT 1').get() as any;
    }

    const currentYear = new Date(letter.received_date || letter.letter_date).getFullYear();
    const archiveCode = generateNextArchiveCode(letter.unit_code, currentYear);

    // Insert into archives table reusing the existing scanned PDF
    const insertArchiveStmt = db.prepare(`
      INSERT INTO archives (
        archive_code, unit_id, category_id, document_number, document_title,
        document_date, year, subject, origin, destination, description,
        keywords, security_level, status, file_path, file_name, file_size, file_type,
        created_by
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, 'AKTIF', ?, ?, ?, ?,
        ?
      )
    `);

    const securityLevel = letter.letter_nature === 'Rahasia' ? 'RAHASIA' : (letter.letter_nature === 'Penting' ? 'INTERNAL' : 'PUBLIK');

    const result = insertArchiveStmt.run(
      archiveCode,
      letter.target_unit_id,
      category.id,
      letter.letter_number,
      `Surat Masuk: ${letter.subject} (${letter.sender_institution})`,
      letter.letter_date,
      currentYear,
      letter.subject,
      letter.sender_institution,
      letter.unit_name,
      letter.summary || letter.notes || 'Arsip surat masuk hasil digitalisasi Kanwil Kemenag Papua.',
      `surat masuk, ${letter.sender_institution.toLowerCase()}, ${letter.agenda_number.toLowerCase()}`,
      securityLevel,
      letter.file_path,
      letter.file_name,
      letter.file_size,
      letter.file_type || 'application/pdf',
      user.id
    );

    const newArchiveId = result.lastInsertRowid;

    // Update incoming_letters status
    db.prepare(`
      UPDATE incoming_letters 
      SET archive_id = ?, status = 'DIARSIPKAN', updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(newArchiveId, letterId);

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'ARCHIVE_INCOMING_LETTER',
      module: 'PERSURATAN',
      recordId: archiveCode,
      description: `Surat Masuk Agenda ${letter.agenda_number} berhasil dimasukkan ke E-Arsip dengan Kode: ${archiveCode}`,
    });

    return NextResponse.json({
      success: true,
      archive_id: newArchiveId,
      archive_code: archiveCode,
      message: `Surat berhasil diarsipkan ke E-Arsip dengan Kode: ${archiveCode}`,
    });
  } catch (err: any) {
    console.error('Archive incoming letter error:', err);
    return NextResponse.json({ error: 'Gagal mengarsipkan surat: ' + err.message }, { status: 500 });
  }
}
