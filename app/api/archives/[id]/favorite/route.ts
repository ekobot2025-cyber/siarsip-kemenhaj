import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
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

    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND archive_id = ?').get(user.id, archiveId) as any;

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
      return NextResponse.json({ is_favorite: false, message: 'Dihapus dari favorit' });
    } else {
      db.prepare('INSERT INTO favorites (user_id, archive_id) VALUES (?, ?)').run(user.id, archiveId);
      return NextResponse.json({ is_favorite: true, message: 'Ditambahkan ke favorit' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal mengubah favorit' }, { status: 500 });
  }
}
