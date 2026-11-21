import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getDb, generateNextIncomingAgendaNumber, logAudit } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'documents');

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const unitId = searchParams.get('unit_id');
    const status = searchParams.get('status');

    const db = getDb();
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (q.trim()) {
      whereClauses.push(`(
        il.agenda_number LIKE ? OR
        il.letter_number LIKE ? OR
        il.sender_institution LIKE ? OR
        il.subject LIKE ? OR
        il.summary LIKE ?
      )`);
      const pattern = `%${q.trim()}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    if (unitId) {
      whereClauses.push('il.target_unit_id = ?');
      params.push(parseInt(unitId, 10));
    }

    if (status) {
      whereClauses.push('il.status = ?');
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT il.*,
             u.code as unit_code, u.name as unit_name,
             usr.full_name as creator_name
      FROM incoming_letters il
      JOIN units u ON il.target_unit_id = u.id
      JOIN users usr ON il.created_by = usr.id
      ${whereSql}
      ORDER BY il.id DESC
    `;

    const letters = db.prepare(sql).all(...params);

    return NextResponse.json({ data: letters });
  } catch (err: any) {
    console.error('Fetch incoming letters error:', err);
    return NextResponse.json({ error: 'Gagal memuat data surat masuk' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const letterNumber = (formData.get('letter_number') as string || '').trim();
    const letterDate = (formData.get('letter_date') as string || '').trim();
    const receivedDate = (formData.get('received_date') as string || '').trim();
    const senderInstitution = (formData.get('sender_institution') as string || '').trim();
    const subject = (formData.get('subject') as string || '').trim();
    const letterNature = (formData.get('letter_nature') as string || 'Biasa').trim();
    const targetUnitId = parseInt(formData.get('target_unit_id') as string, 10);
    const summary = (formData.get('summary') as string || '').trim();
    const notes = (formData.get('notes') as string || '').trim();

    if (!letterNumber || !letterDate || !receivedDate || !senderInstitution || !subject || !targetUnitId) {
      return NextResponse.json({ error: 'Mohon lengkapi semua field bertanda (*)' }, { status: 400 });
    }

    const currentYear = new Date(receivedDate || letterDate).getFullYear();
    const agendaNumber = generateNextIncomingAgendaNumber(currentYear);

    // Handle file upload
    const file = formData.get('file') as File | null;
    let filePath = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;

    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    if (file && file.size > 0) {
      fileName = file.name;
      fileSize = file.size;
      fileType = file.type || 'application/pdf';

      const ext = path.extname(file.name) || '.pdf';
      const cleanSaveName = `SURAT_MASUK_${agendaNumber.replace(/\//g, '_')}_${Date.now()}${ext}`;
      const fullDiskPath = path.join(STORAGE_DIR, cleanSaveName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(fullDiskPath, buffer);

      filePath = `storage/documents/${cleanSaveName}`;
    } else {
      // Create certified electronic summary PDF placeholder
      const cleanSaveName = `SURAT_MASUK_${agendaNumber.replace(/\//g, '_')}.pdf`;
      const fullDiskPath = path.join(STORAGE_DIR, cleanSaveName);
      const content = `SURAT MASUK RESMI - KEMENTERIAN HAJI DAN UMRAH KANTOR WILAYAH PAPUA\nNOMOR AGENDA : ${agendaNumber}\nNOMOR SURAT  : ${letterNumber}\nTANGGAL SURAT: ${letterDate}\nDITERIMA TGL : ${receivedDate}\nPENGIRIM     : ${senderInstitution}\nPERIHAL      : ${subject}\nSIFAT SURAT  : ${letterNature}\n\nDokumen fisik telah diregistrasi ke dalam Buku Agenda Persuratan Digital.`;
      fs.writeFileSync(fullDiskPath, content, 'utf-8');

      fileName = cleanSaveName;
      filePath = `storage/documents/${cleanSaveName}`;
      fileSize = Buffer.byteLength(content, 'utf-8');
      fileType = 'application/pdf';
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO incoming_letters (
        agenda_number, letter_number, letter_date, received_date,
        sender_institution, subject, letter_nature, target_unit_id,
        summary, notes, file_path, file_name, file_size, file_type,
        status, created_by
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        'BARU', ?
      )
    `);

    const result = stmt.run(
      agendaNumber, letterNumber, letterDate, receivedDate,
      senderInstitution, subject, letterNature, targetUnitId,
      summary, notes, filePath, fileName, fileSize, fileType,
      user.id
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'REGISTER_INCOMING_LETTER',
      module: 'PERSURATAN',
      recordId: agendaNumber,
      description: `Registrasi Surat Masuk Agenda ${agendaNumber} dari ${senderInstitution} (No: ${letterNumber})`,
    });

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      agenda_number: agendaNumber,
      message: `Surat Masuk berhasil diregistrasi dengan No. Agenda: ${agendaNumber}`,
    });
  } catch (err: any) {
    console.error('Create incoming letter error:', err);
    return NextResponse.json({ error: 'Gagal meregistrasi surat masuk: ' + err.message }, { status: 500 });
  }
}
