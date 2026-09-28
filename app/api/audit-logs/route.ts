import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const moduleName = searchParams.get('module');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const offset = (page - 1) * limit;

    const db = getDb();
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (action) {
      whereClauses.push('action = ?');
      params.push(action);
    }

    if (moduleName) {
      whereClauses.push('module = ?');
      params.push(moduleName);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM audit_logs ${whereSql}`;
    const total = (db.prepare(countSql).get(...params) as any).total;

    const dataSql = `
      SELECT * FROM audit_logs
      ${whereSql}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
    const logs = db.prepare(dataSql).all(...params, limit, offset);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memuat audit log' }, { status: 500 });
  }
}
