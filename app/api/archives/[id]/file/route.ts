import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getDb, logAudit } from '@/lib/db';
import { getCurrentUser, canAccessArchive } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Akses Ditolak: Anda belum login', { status: 401 });
    }

    const archiveId = parseInt(params.id, 10);
    const db = getDb();
    const archive = db.prepare('SELECT * FROM archives WHERE id = ?').get(archiveId) as any;

    if (!archive) {
      return new NextResponse('Dokumen tidak ditemukan', { status: 404 });
    }

    // RBAC Security Validation
    if (!canAccessArchive(user, archive)) {
      logAudit({
        userId: user.id,
        userName: user.full_name,
        action: 'FILE_ACCESS_DENIED',
        module: 'SECURITY',
        recordId: archive.archive_code,
        description: `Upaya unduh/baca berkas ${archive.archive_code} ditolak karena pembatasan hak akses`,
      });
      return new NextResponse('Akses Ditolak: Anda tidak memiliki wewenang untuk melihat berkas ini', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === '1';

    let resolvedPath = archive.file_path;
    let fullDiskPath = resolvedPath ? path.join(process.cwd(), resolvedPath) : null;

    if (!fullDiskPath || !fs.existsSync(fullDiskPath)) {
      // Fallback: check storage/documents/
      const cleanName = `${archive.archive_code.replace(/\//g, '_')}.pdf`;
      const fallbackPath = path.join(process.cwd(), 'storage', 'documents', cleanName);
      if (fs.existsSync(fallbackPath)) {
        fullDiskPath = fallbackPath;
      } else {
        // Generate on the fly
        const content = `ARSIP DIGITAL KEMENTERIAN AGAMA PROVINSI PAPUA\nKODE ARSIP: ${archive.archive_code}\nJUDUL: ${archive.document_title}\nNOMOR: ${archive.document_number}\nTANGGAL: ${archive.document_date}\n\nDokumen resmi tersimpan secara digital dalam sistem SI-ARSIP.`;
        fs.writeFileSync(fallbackPath, content, 'utf-8');
        fullDiskPath = fallbackPath;
      }
    }

    const fileBuffer = fs.readFileSync(fullDiskPath);
    const fileName = archive.file_name || `${archive.archive_code.replace(/\//g, '_')}.pdf`;

    // Audit action
    logAudit({
      userId: user.id,
      userName: user.full_name,
      action: isDownload ? 'DOWNLOAD_FILE' : 'PREVIEW_ARCHIVE',
      module: 'ARCHIVE',
      recordId: archive.archive_code,
      description: `${isDownload ? 'Mengunduh berkas' : 'Membuka pratinjau berkas'}: ${archive.archive_code} (${archive.document_title})`,
    });

    const disposition = isDownload ? `attachment; filename="${encodeURIComponent(fileName)}"` : `inline; filename="${encodeURIComponent(fileName)}"`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('File serve error:', err);
    return new NextResponse('Gagal memuat berkas', { status: 500 });
  }
}
