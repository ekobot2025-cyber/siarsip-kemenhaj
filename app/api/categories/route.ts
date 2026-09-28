import { NextResponse } from 'next/server';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unit_id');

    const db = getDb();
    let query = `
      SELECT c.*, u.code as unit_code, u.name as unit_name,
             COUNT(a.id) as archive_count
      FROM archive_categories c
      LEFT JOIN units u ON c.unit_id = u.id
      LEFT JOIN archives a ON c.id = a.category_id
    `;
    const params: any[] = [];

    if (unitId) {
      query += ` WHERE (c.unit_id = ? OR c.unit_id IS NULL)`;
      params.push(parseInt(unitId, 10));
    }

    query += ` GROUP BY c.id ORDER BY c.unit_id ASC, c.name ASC`;

    const categories = db.prepare(query).all(...params);
    return NextResponse.json({ data: categories });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memuat kategori' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role_code !== 'SUPER_ADMIN' && user.role_code !== 'ADMIN_ARSIP')) {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya Admin yang dapat menambah kategori' }, { status: 403 });
    }

    const { code, name, description, unit_id } = await request.json();
    if (!code || !name) {
      return NextResponse.json({ error: 'Kode dan Nama Kategori wajib diisi' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const db = getDb();

    // Check unique code
    const existing = db.prepare('SELECT id FROM archive_categories WHERE code = ?').get(cleanCode);
    if (existing) {
      return NextResponse.json({ error: `Kode kategori "${cleanCode}" sudah digunakan` }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO archive_categories (code, name, description, unit_id, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(
      cleanCode,
      name.trim(),
      description ? description.trim() : null,
      unit_id ? parseInt(unit_id, 10) : null
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'CREATE_CATEGORY',
      module: 'CATEGORY',
      recordId: cleanCode,
      description: `Menambahkan Kategori Arsip: ${name} (${cleanCode})`,
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid, message: 'Kategori berhasil ditambahkan' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menambah kategori' }, { status: 500 });
  }
}
