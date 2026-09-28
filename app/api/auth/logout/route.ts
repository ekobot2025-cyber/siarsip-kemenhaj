import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user) {
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      logAudit({
        userId: user.id,
        userName: user.full_name,
        action: 'LOGOUT',
        module: 'AUTH',
        description: `Pengguna ${user.full_name} keluar dari sistem`,
        ipAddress: ip,
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('siarsip_session');
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal logout' }, { status: 500 });
  }
}
