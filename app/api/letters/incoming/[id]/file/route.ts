import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Akses Ditolak: Anda belum login', { status: 401 });
    }

    const letterId = parseInt(params.id, 10);
    const db = getDb();
    const letter = db.prepare('SELECT * FROM incoming_letters WHERE id = ?').get(letterId) as any;

    if (!letter) {
      return new NextResponse('Dokumen surat tidak ditemukan', { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === '1';

    let resolvedPath = letter.file_path;
    let fullDiskPath = resolvedPath ? path.join(process.cwd(), resolvedPath) : null;

    if (!fullDiskPath || !fs.existsSync(fullDiskPath)) {
      // Fallback check
      const cleanName = `SURAT_MASUK_${letter.agenda_number.replace(/\//g, '_')}.pdf`;
      const fallbackPath = path.join(process.cwd(), 'storage', 'documents', cleanName);
      if (fs.existsSync(fallbackPath)) {
        fullDiskPath = fallbackPath;
      } else {
        const content = `SURAT MASUK RESMI - KEMENTERIAN HAJI DAN UMRAH KANTOR WILAYAH PAPUA\nNOMOR AGENDA : ${letter.agenda_number}\nNOMOR SURAT  : ${letter.letter_number}\nTANGGAL SURAT: ${letter.letter_date}\nDITERIMA TGL : ${letter.received_date}\nPENGIRIM     : ${letter.sender_institution}\nPERIHAL      : ${letter.subject}\nSIFAT SURAT  : ${letter.letter_nature}\n\nDokumen fisik telah diregistrasi ke dalam Buku Agenda Persuratan Digital.`;
        fs.writeFileSync(fallbackPath, content, 'utf-8');
        fullDiskPath = fallbackPath;
      }
    }

    const fileBuffer = fs.readFileSync(fullDiskPath);
    const fileName = letter.file_name || `Surat_Masuk_${letter.agenda_number.replace(/\//g, '_')}.pdf`;

    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: isDownload ? 'DOWNLOAD_LETTER' : 'PREVIEW_LETTER',
      module: 'PERSURATAN',
      recordId: letter.agenda_number,
      description: `${isDownload ? 'Mengunduh berkas scan' : 'Pratinjau berkas scan'}: ${letter.agenda_number} (${letter.subject})`,
    });

    const disposition = isDownload ? `attachment; filename="${encodeURIComponent(fileName)}"` : `inline; filename="${encodeURIComponent(fileName)}"`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': letter.file_type || 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('File serve error for incoming letter:', err);
    return new NextResponse('Gagal memuat berkas surat', { status: 500 });
  }
}
