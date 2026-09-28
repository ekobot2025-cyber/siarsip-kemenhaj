import { NextResponse } from 'next/server';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const units = db.prepare(`
      SELECT u.*, COUNT(a.id) as archive_count
      FROM units u
      LEFT JOIN archives a ON u.id = a.unit_id
      GROUP BY u.id
      ORDER BY u.display_order ASC, u.id ASC
    `).all();

    return NextResponse.json({ data: units });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memuat unit kerja' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_code !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya Super Admin yang dapat menambah unit kerja' }, { status: 403 });
    }

    const { code, name, leader_name, leader_nip, description, display_order } = await request.json();

    if (!code || !name) {
      return NextResponse.json({ error: 'Kode Unit dan Nama Unit wajib diisi' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const db = getDb();

    // Check duplicate code
    const existing = db.prepare('SELECT id FROM units WHERE code = ?').get(cleanCode);
    if (existing) {
      return NextResponse.json({ error: `Kode unit "${cleanCode}" sudah digunakan` }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO units (code, name, leader_name, leader_nip, description, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(
      cleanCode,
      name.trim(),
      leader_name ? leader_name.trim() : null,
      leader_nip ? leader_nip.trim() : null,
      description ? description.trim() : null,
      display_order || 0
    );

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: 'CREATE_UNIT',
      module: 'UNIT',
      recordId: cleanCode,
      description: `Menambahkan Unit Kerja baru: ${name} (${cleanCode})`,
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid, message: 'Unit kerja berhasil ditambahkan' });
  } catch (err: any) {
    console.error('Create unit error:', err);
    return NextResponse.json({ error: 'Gagal menambah unit kerja' }, { status: 500 });
  }
}
