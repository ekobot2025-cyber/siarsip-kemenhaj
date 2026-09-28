import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getDb, generateNextArchiveCode, logAudit } from '@/lib/db';
import { getCurrentUser, canAccessArchive } from '@/lib/auth';

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
    const unitCode = searchParams.get('unit_code');
    const categoryId = searchParams.get('category_id');
    const year = searchParams.get('year');
    const securityLevel = searchParams.get('security_level');
    const status = searchParams.get('status');
    const favoriteOnly = searchParams.get('favorite') === '1';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const db = getDb();

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (q.trim()) {
      whereClauses.push(`(
        a.document_title LIKE ? OR 
        a.archive_code LIKE ? OR 
        a.document_number LIKE ? OR 
        a.subject LIKE ? OR 
        a.keywords LIKE ? OR
        a.description LIKE ?
      )`);
      const searchPattern = `%${q.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (unitId) {
      whereClauses.push('a.unit_id = ?');
      params.push(parseInt(unitId, 10));
    } else if (unitCode) {
      whereClauses.push('u.code = ?');
      params.push(unitCode.toUpperCase());
    }

    if (categoryId) {
      whereClauses.push('a.category_id = ?');
      params.push(parseInt(categoryId, 10));
    }

    if (year) {
      whereClauses.push('a.year = ?');
      params.push(parseInt(year, 10));
    }

    if (securityLevel) {
      whereClauses.push('a.security_level = ?');
      params.push(securityLevel);
    }

    if (status) {
      whereClauses.push('a.status = ?');
      params.push(status);
    }

    if (favoriteOnly) {
      whereClauses.push('f.id IS NOT NULL');
    }

    // Role-based visibility filtering:
    // Non-super-admin, non-pimpinan unit admins should not see RAHASIA archives of OTHER units
    if (user.role_code === 'ADMIN_UNIT') {
      whereClauses.push(`(
        a.security_level != 'RAHASIA' OR a.unit_id = ?
      )`);
      params.push(user.unit_id);
    } else if (user.role_code === 'PEGAWAI') {
      whereClauses.push(`(
        a.security_level IN ('PUBLIK', 'INTERNAL') OR 
        (a.security_level = 'TERBATAS' AND a.unit_id = ?) OR
        a.created_by = ?
      )`);
      params.push(user.unit_id, user.id);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count total records
    const countSql = `
      SELECT COUNT(*) as total
      FROM archives a
      JOIN units u ON a.unit_id = u.id
      JOIN archive_categories c ON a.category_id = c.id
      LEFT JOIN favorites f ON f.archive_id = a.id AND f.user_id = ${user.id}
      ${whereSql}
    `;
    const countResult = db.prepare(countSql).get(...params) as any;
    const total = countResult ? countResult.total : 0;

    // Fetch paginated data
    const dataSql = `
      SELECT a.id, a.archive_code, a.unit_id, a.category_id, a.document_number,
             a.document_title, a.document_date, a.year, a.subject, a.origin,
             a.destination, a.description, a.keywords, a.security_level, a.status,
             a.file_path, a.file_name, a.file_size, a.file_type, a.created_by,
             a.created_at, a.updated_at,
             u.code as unit_code, u.name as unit_name,
             c.code as category_code, c.name as category_name,
             usr.full_name as creator_name,
             CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
      FROM archives a
      JOIN units u ON a.unit_id = u.id
      JOIN archive_categories c ON a.category_id = c.id
      JOIN users usr ON a.created_by = usr.id
      LEFT JOIN favorites f ON f.archive_id = a.id AND f.user_id = ${user.id}
      ${whereSql}
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?
    `;

    const records = db.prepare(dataSql).all(...params, limit, offset);

    return NextResponse.json({
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('Fetch archives error:', err);
    return NextResponse.json({ error: 'Gagal mengambil daftar arsip' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const unitId = parseInt(formData.get('unit_id') as string, 10);
    const categoryId = parseInt(formData.get('category_id') as string, 10);
    const documentTitle = (formData.get('document_title') as string || '').trim();
    const documentNumber = (formData.get('document_number') as string || '').trim();
    const documentDate = (formData.get('document_date') as string || '').trim();
    const year = parseInt(formData.get('year') as string || `${new Date().getFullYear()}`, 10);
    const subject = (formData.get('subject') as string || '').trim();
    const origin = (formData.get('origin') as string || '').trim();
    const destination = (formData.get('destination') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();
    const keywords = (formData.get('keywords') as string || '').trim();
    const securityLevel = (formData.get('security_level') as string || 'INTERNAL');
    const status = (formData.get('status') as string || 'AKTIF');

    if (!unitId || !categoryId || !documentTitle || !documentDate) {
      return NextResponse.json({ error: 'Mohon lengkapi field wajib (*)' }, { status: 400 });
    }

    const db = getDb();

    // Check unit
    const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(unitId) as any;
    if (!unit) {
      return NextResponse.json({ error: 'Unit kerja tidak ditemukan' }, { status: 404 });
    }

    // Role check: Admin Unit can only upload for their own unit
    if (user.role_code === 'ADMIN_UNIT' && user.unit_id !== unitId) {
      return NextResponse.json({ error: 'Anda hanya dapat menambahkan arsip untuk unit kerja Anda' }, { status: 403 });
    }

    // Generate unique archive code
    const archiveCode = generateNextArchiveCode(unit.code, year);

    // Handle file upload
    const file = formData.get('file') as File | null;
    let filePath = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;

    if (file && file.size > 0) {
      if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      }

      fileName = file.name;
      fileSize = file.size;
      fileType = file.type || 'application/octet-stream';

      const safeExt = path.extname(file.name) || '.pdf';
      const cleanSaveName = `${archiveCode.replace(/\//g, '_')}_${Date.now()}${safeExt}`;
      const fullPath = path.join(STORAGE_DIR, cleanSaveName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(fullPath, buffer);

      filePath = `storage/documents/${cleanSaveName}`;
    } else {
      // If no file uploaded, create a certified placeholder file
      const safeDocName = `${archiveCode.replace(/\//g, '_')}.pdf`;
      const fullPath = path.join(STORAGE_DIR, safeDocName);
      const placeholderContent = `ARSIP DIGITAL KEMENTERIAN AGAMA PROVINSI PAPUA\nKODE ARSIP: ${archiveCode}\nJUDUL: ${documentTitle}\nNOMOR: ${documentNumber}\nTANGGAL: ${documentDate}\nUNIT: ${unit.name}\n\nDokumen resmi tersimpan secara digital dalam sistem SI-ARSIP.`;
      fs.writeFileSync(fullPath, placeholderContent, 'utf-8');

      fileName = `${archiveCode.replace(/\//g, '_')}.pdf`;
      filePath = `storage/documents/${safeDocName}`;
      fileSize = Buffer.byteLength(placeholderContent, 'utf-8');
      fileType = 'application/pdf';
    }

    const insertStmt = db.prepare(`
      INSERT INTO archives (
        archive_code, unit_id, category_id, document_number, document_title,
        document_date, year, subject, origin, destination, description,
        keywords, security_level, status, file_path, file_name, file_size, file_type,
        created_by
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?
      )
    `);

    const result = insertStmt.run(
      archiveCode, unitId, categoryId, documentNumber, documentTitle,
      documentDate, year, subject, origin, destination, description,
      keywords, securityLevel, status, filePath, fileName, fileSize, fileType,
      user.id
    );

    const insertedId = result.lastInsertRowid;

    // Log audit trail
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'CREATE_ARCHIVE',
      module: 'ARCHIVE',
      recordId: archiveCode,
      description: `Menambahkan arsip baru: "${documentTitle}" (${archiveCode})`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      message: 'Arsip berhasil disimpan',
      id: insertedId,
      archive_code: archiveCode,
    });
  } catch (err: any) {
    console.error('Create archive error:', err);
    return NextResponse.json({ error: 'Gagal menyimpan arsip: ' + err.message }, { status: 500 });
  }
}
