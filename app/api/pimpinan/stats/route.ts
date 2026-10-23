import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const currentYear = new Date().getFullYear();
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    const totalArchives = (db.prepare('SELECT COUNT(*) as count FROM archives').get() as any).count ?? 0;
    const archivesThisYear = (db.prepare('SELECT COUNT(*) as count FROM archives WHERE year = ?').get(currentYear) as any).count ?? 0;
    const suratMasukBulanIni = (db.prepare('SELECT COUNT(*) as count FROM incoming_letters WHERE letter_date LIKE ?').get(`${currentMonthPrefix}%`) as any).count ?? 0;
    const suratKeluarBulanIni = (db.prepare(`
      SELECT COUNT(*) as count FROM archives a 
      JOIN archive_categories c ON a.category_id = c.id 
      WHERE c.name LIKE '%Surat Keluar%' AND a.document_date LIKE ?
    `).get(`${currentMonthPrefix}%`) as any).count ?? 0;
    const dokumenBaruBulanIni = (db.prepare('SELECT COUNT(*) as count FROM archives WHERE document_date LIKE ?').get(`${currentMonthPrefix}%`) as any).count ?? 0;

    const unitActivity = db.prepare(`
      SELECT u.id, u.code, u.name, u.leader_name,
             COUNT(a.id) as archive_count,
             MAX(a.created_at) as last_activity
      FROM units u
      LEFT JOIN archives a ON u.id = a.unit_id
      WHERE u.is_active = 1
      GROUP BY u.id
      ORDER BY archive_count DESC
    `).all();

    const recentDocs = db.prepare(`
      SELECT a.id, a.archive_code, a.document_title, a.document_date,
             a.security_level, a.status, u.code as unit_code, u.name as unit_name
      FROM archives a
      JOIN units u ON a.unit_id = u.id
      ORDER BY a.id DESC LIMIT 8
    `).all();

    return NextResponse.json({
      totalArchives,
      archivesThisYear,
      suratMasukBulanIni,
      suratKeluarBulanIni,
      dokumenBaruBulanIni,
      unitActivity,
      recentDocs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memuat statistik pimpinan' }, { status: 500 });
  }
}
