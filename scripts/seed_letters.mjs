import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'siarsip.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS incoming_letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agenda_number TEXT UNIQUE NOT NULL,
    letter_number TEXT NOT NULL,
    letter_date TEXT NOT NULL,
    received_date TEXT NOT NULL,
    sender_institution TEXT NOT NULL,
    subject TEXT NOT NULL,
    letter_nature TEXT NOT NULL DEFAULT 'Biasa',
    target_unit_id INTEGER NOT NULL REFERENCES units(id),
    summary TEXT,
    notes TEXT,
    file_path TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    status TEXT NOT NULL DEFAULT 'BARU',
    archive_id INTEGER REFERENCES archives(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

const count = db.prepare('SELECT COUNT(*) as count FROM incoming_letters').get().count;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO incoming_letters (
      agenda_number, letter_number, letter_date, received_date,
      sender_institution, subject, letter_nature, target_unit_id,
      summary, notes, file_path, file_name, file_size, file_type, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'application/pdf', ?, 1)
  `);

  insert.run(
    'SM/2026/00001',
    '005/GUB-PAPUA/SETDA/02/2026',
    '2026-02-12',
    '2026-02-14',
    'Pemerintah Provinsi Papua - Sekretariat Daerah',
    'Undangan Rapat Koordinasi Forum Komunikasi Pimpinan Daerah (Forkopimda) Papua',
    'Penting',
    3,
    'Undangan resmi Gubernur Papua terkait penguatan moderasi beragama dan stabilitas keamanan di Papua.',
    'Diteruskan ke Kakanwil dan Kabag Umum untuk penyiapan bahan sambutan.',
    'storage/documents/ARS_UMH_2026_00001.pdf',
    'SCAN_SURAT_GUBERNUR_FORKOPIMDA.pdf',
    1048576,
    'DIPROSES'
  );

  insert.run(
    'SM/2026/00002',
    'B-108/KPK/LHKPN/01/2026',
    '2026-01-15',
    '2026-01-18',
    'Komisi Pemberantasan Korupsi (KPK RI)',
    'Surat Pengingat Kepatuhan Penyampaian LHKPN Periodik Tahun 2025 Wajib Lapor Kemenag',
    'Segera',
    2,
    'Batas akhir pengisian formulir e-LHKPN bagi seluruh pejabat eselon III dan PPK sebelum 31 Maret 2026.',
    'Disposisi ke Bagian Kepegawaian untuk monitoring kepatuhan ASN.',
    'storage/documents/ARS_UMH_2026_00002.pdf',
    'SURAT_KPK_LHKPN_2026.pdf',
    2097152,
    'DIPROSES'
  );

  insert.run(
    'SM/2026/00003',
    'B-201/SJ/B.IV/KU.00.2/02/2026',
    '2026-02-05',
    '2026-02-08',
    'Biro Keuangan Sekretariat Jenderal Kemenag RI',
    'Penyampaian Jadwal Rekonsiliasi Eksternal Laporan Keuangan Semester II dan Tahunan',
    'Biasa',
    1,
    'Jadwal penyusunan CaLK, rekonsiliasi data SAKTI, dan penyelesaian aset persediaan.',
    'Disposisi ke Bagian Keuangan.',
    'storage/documents/ARS_KEU_2026_00001.pdf',
    'JADWAL_REKON_KEMENAG_RI.pdf',
    1572864,
    'BARU'
  );

  insert.run(
    'SM/2026/00004',
    'PHU.III/08/HJ.00/01/2026',
    '2026-01-20',
    '2026-01-22',
    'Ditjen Penyelenggaraan Haji dan Umrah (PHU) Kemenag RI',
    'Instruksi Percepatan Verifikasi Dokumen Bio Visa dan Paspor Jemaah Haji 1447 H / 2026 M',
    'Penting',
    5,
    'Instruksi penyelesaian perekaman aplikasi Saudi Visa Bio jemaah kuota Papua.',
    'Disposisi ke Bidang Pembinaan Haji.',
    'storage/documents/ARS_HAJI_2026_00001.pdf',
    'INSTRUKSI_PHU_VISA_BIO.pdf',
    1835008,
    'BARU'
  );

  console.log('Seeded initial incoming letters!');
} else {
  console.log('Incoming letters already present, count:', count);
}
