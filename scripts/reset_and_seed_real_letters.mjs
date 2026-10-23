import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const ROOT_DIR = process.cwd();
const DOKUMEN_PENDUKUNG_DIR = path.join(ROOT_DIR, 'dokumen_pendukung');
const STORAGE_DOCS_DIR = path.join(ROOT_DIR, 'storage', 'documents');
const DB_PATH = path.join(ROOT_DIR, 'data', 'siarsip.db');

console.log('=== MEMULAI RESET DATABASE & MENGGUNAKAN HANYA 3 CONTOH SURAT ASLI ===\n');

// 1. Pastikan folder dokumen_pendukung ada
if (!fs.existsSync(DOKUMEN_PENDUKUNG_DIR)) {
  console.error('Folder dokumen_pendukung tidak ditemukan:', DOKUMEN_PENDUKUNG_DIR);
  process.exit(1);
}

// 2. Siapkan folder storage/documents
if (!fs.existsSync(STORAGE_DOCS_DIR)) {
  fs.mkdirSync(STORAGE_DOCS_DIR, { recursive: true });
}

// Hapus semua file dummy lama di storage/documents
console.log('1. Membersihkan file dummy lama di storage/documents...');
const existingFiles = fs.readdirSync(STORAGE_DOCS_DIR);
for (const file of existingFiles) {
  const filePath = path.join(STORAGE_DOCS_DIR, file);
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.warn(`Gagal menghapus ${file}:`, err.message);
  }
}
console.log(`   ? Berhasil membersihkan ${existingFiles.length} file dummy lama.`);

// 3. Salin 3 file contoh surat asli dari dokumen_pendukung ke storage/documents
console.log('\n2. Menyalin 3 berkas PDF asli dari dokumen_pendukung...');

const srcSuratMasuk = path.join(DOKUMEN_PENDUKUNG_DIR, 'Contoh surat masuk dari pusat.pdf');
const srcSuratKeluar1 = path.join(DOKUMEN_PENDUKUNG_DIR, 'Permohonan Narasumber Pembinaan SDM-contoh surat keluar.pdf');
const srcSuratKeluar2 = path.join(DOKUMEN_PENDUKUNG_DIR, 'Surat lampiran _ langkah strategi belanja-contoh surat keluar.pdf');

if (!fs.existsSync(srcSuratMasuk) || !fs.existsSync(srcSuratKeluar1) || !fs.existsSync(srcSuratKeluar2)) {
  console.error('File sumber di dokumen_pendukung belum lengkap!');
  process.exit(1);
}

// File Surat Masuk
const destSmMain = path.join(STORAGE_DOCS_DIR, 'Contoh_surat_masuk_dari_pusat.pdf');
fs.copyFileSync(srcSuratMasuk, destSmMain);
fs.copyFileSync(srcSuratMasuk, path.join(STORAGE_DOCS_DIR, 'SURAT_MASUK_SM_2026_00001.pdf'));
fs.copyFileSync(srcSuratMasuk, path.join(STORAGE_DOCS_DIR, 'ARS_UMH_2026_00001.pdf'));
const sizeSm = fs.statSync(srcSuratMasuk).size;

// File Surat Keluar 1
const destSk1Main = path.join(STORAGE_DOCS_DIR, 'Permohonan_Narasumber_Pembinaan_SDM-contoh_surat_keluar.pdf');
fs.copyFileSync(srcSuratKeluar1, destSk1Main);
fs.copyFileSync(srcSuratKeluar1, path.join(STORAGE_DOCS_DIR, 'SK_2026_00001.pdf'));
fs.copyFileSync(srcSuratKeluar1, path.join(STORAGE_DOCS_DIR, 'ARS_PEG_2026_00001.pdf'));
const sizeSk1 = fs.statSync(srcSuratKeluar1).size;

// File Surat Keluar 2
const destSk2Main = path.join(STORAGE_DOCS_DIR, 'Surat_lampiran_langkah_strategi_belanja-contoh_surat_keluar.pdf');
fs.copyFileSync(srcSuratKeluar2, destSk2Main);
fs.copyFileSync(srcSuratKeluar2, path.join(STORAGE_DOCS_DIR, 'SK_2026_00002.pdf'));
fs.copyFileSync(srcSuratKeluar2, path.join(STORAGE_DOCS_DIR, 'ARS_KEU_2026_00001.pdf'));
const sizeSk2 = fs.statSync(srcSuratKeluar2).size;

console.log('   ? Surat Masuk Pusat: Contoh surat masuk dari pusat.pdf (' + sizeSm + ' bytes)');
console.log('   ? Surat Keluar 1   : Permohonan Narasumber Pembinaan SDM (' + sizeSk1 + ' bytes)');
console.log('   ? Surat Keluar 2   : Surat lampiran _ langkah strategi belanja (' + sizeSk2 + ' bytes)');

// 4. Buka SQLite Database
console.log('\n3. Mengosongkan data dummy di database SQLite: ' + DB_PATH + '...');
const db = new DatabaseSync(DB_PATH);

// Bersihkan data dummy
db.exec(`
  DELETE FROM favorites;
  DELETE FROM recent_views;
  DELETE FROM archive_attachments;
  DELETE FROM incoming_letters;
  DELETE FROM outgoing_letters;
  DELETE FROM archives;
  DELETE FROM audit_logs;
  DELETE FROM notifications;

  DELETE FROM sqlite_sequence WHERE name IN (
    'favorites', 'recent_views', 'archive_attachments',
    'incoming_letters', 'outgoing_letters', 'archives',
    'audit_logs', 'notifications'
  );
`);
console.log('   ? Seluruh tabel transaksi & dummy archives berhasil dikosongkan!');

// 5. Masukkan 3 Arsip Resmi ke tabel `archives`
console.log('\n4. Menginput 3 Arsip Resmi ke tabel archives...');
const insertArchive = db.prepare(`
  INSERT INTO archives (
    id, archive_code, unit_id, category_id, document_number, document_title,
    document_date, year, subject, origin, destination, description,
    keywords, security_level, status, file_path, file_name, file_size, file_type, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'application/pdf', ?)
`);

// Arsip 1: Surat Masuk dari Pusat
insertArchive.run(
  1,
  'ARS/UMH/2026/00001',
  3, // Bagian Umum dan Humas
  17, // CAT-UMH-01 (Surat Masuk Kanwil)
  'S-100/PDT/2026',
  'Surat Masuk: Pendataan Operator Sistem Informasi Kementerian',
  '2026-09-30',
  2026,
  'Pendataan Operator Sistem Informasi Kementerian',
  'Pusat Data dan Teknologi Informasi - Kementerian Haji dan Umrah RI',
  'Kepala Kantor Wilayah Kementerian Haji dan Umrah Provinsi Papua',
  'Penataan manajemen akses internal Sistem Informasi Kementerian serta pendataan profil SDM operator SISKOHAT, SISKOPATUH, Sistem Kepegawaian, Haji dan Umrah Store melalui tautan https://s.id/PendataanOperatorSIK.',
  'surat masuk, pusdatin, operator, siskohat, siskopatuh, sistem informasi, kemenhaj, papua',
  'INTERNAL',
  'AKTIF',
  'storage/documents/Contoh_surat_masuk_dari_pusat.pdf',
  'Contoh surat masuk dari pusat.pdf',
  sizeSm,
  2 // admin.arsip
);

// Arsip 2: Surat Keluar 1 - Permohonan Narasumber
insertArchive.run(
  2,
  'ARS/PEG/2026/00001',
  2, // Bagian Kepegawaian
  18, // CAT-UMH-02 (Surat Keluar Kanwil)
  'S-1110/KW.33/2026',
  'Surat Keluar: Permohonan sebagai Narasumber Pembinaan dan Peningkatan SDM',
  '2026-10-21',
  2026,
  'Permohonan sebagai Narasumber',
  'Kantor Wilayah Kementerian Haji dan Umrah Provinsi Papua',
  'Ibu Novi Trihadi',
  'Permohonan kesediaan sebagai narasumber kegiatan Pembinaan dan Peningkatan SDM di Lingkungan Kantor Wilayah Kementerian Haji dan Umrah Provinsi Papua pada Jumat, 23 Oktober 2026 di Hotel Horison Kotaraja Jayapura.',
  'surat keluar, narasumber, pembinaan sdm, novi trihadi, hotel horison kotaraja, kepegawaian',
  'INTERNAL',
  'AKTIF',
  'storage/documents/Permohonan_Narasumber_Pembinaan_SDM-contoh_surat_keluar.pdf',
  'Permohonan Narasumber Pembinaan SDM-contoh surat keluar.pdf',
  sizeSk1,
  4 // admin.kepegawaian
);

// Arsip 3: Surat Keluar 2 - Langkah Strategi Belanja
insertArchive.run(
  3,
  'ARS/KEU/2026/00001',
  1, // Bagian Keuangan
  18, // CAT-UMH-02 (Surat Keluar Kanwil)
  'S-1077/KW.33/2026',
  'Surat Keluar: Penyampaian Laporan Langkah Strategi Belanja Kementerian Haji dan Umrah Triwulan IV Anggaran 2026',
  '2026-10-14',
  2026,
  'Penyampaian Laporan Langkah Strategi Belanja Triwulan IV Anggaran 2026',
  'Kantor Wilayah Kementerian Haji dan Umrah Provinsi Papua',
  'Sekretaris Jenderal Kementerian Haji dan Umrah RI di Jakarta',
  'Tindak lanjut SE Sekjen No. S-803/SJ/2026 terkait Langkah Strategi Belanja TW IV 2026, efisiensi Pagu Akun Belanja Perjalanan Dinas (Akun 542) pada Satker 695295, 695296, 695297 Kanwil Kemenhaj Papua.',
  'surat keluar, sekjen, strategi belanja, triwulan iv, efisiensi anggaran, akun 542, keuangan',
  'INTERNAL',
  'AKTIF',
  'storage/documents/Surat_lampiran_langkah_strategi_belanja-contoh_surat_keluar.pdf',
  'Surat lampiran _ langkah strategi belanja-contoh surat keluar.pdf',
  sizeSk2,
  3 // admin.keuangan
);
console.log('   ? 3 Dokumen Arsip berhasil disimpan.');

// 6. Masukkan Surat Masuk ke tabel `incoming_letters`
console.log('\n5. Menginput Surat Masuk ke tabel incoming_letters...');
const insertIncoming = db.prepare(`
  INSERT INTO incoming_letters (
    id, agenda_number, letter_number, letter_date, received_date,
    sender_institution, subject, letter_nature, target_unit_id,
    summary, notes, file_path, file_name, file_size, file_type,
    status, archive_id, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'application/pdf', ?, ?, ?)
`);

insertIncoming.run(
  1,
  'SM/2026/00001',
  'S-100/PDT/2026',
  '2026-09-30',
  '2026-10-01',
  'Pusat Data dan Teknologi Informasi - Kementerian Haji dan Umrah RI',
  'Pendataan Operator Sistem Informasi Kementerian',
  'Penting',
  3, // Target: Bagian Umum dan Humas
  'Penataan manajemen akses internal Sistem Informasi Kementerian serta pendataan profil SDM operator SISKOHAT, SISKOPATUH, Sistem Kepegawaian, Haji dan Umrah Store paling lambat 9 Oktober 2026 pukul 16.00 WIB.',
  'Disposisi Kakanwil: Teruskan kepada seluruh operator TIK dan satuan kerja untuk pengisian sebelum batas waktu.',
  'storage/documents/Contoh_surat_masuk_dari_pusat.pdf',
  'Contoh surat masuk dari pusat.pdf',
  sizeSm,
  'DIPROSES',
  1,
  2 // admin.arsip
);
console.log('   ? 1 Surat Masuk SM/2026/00001 berhasil disimpan.');

// 7. Masukkan Surat Keluar ke tabel `outgoing_letters`
console.log('\n6. Menginput 2 Surat Keluar ke tabel outgoing_letters...');
const insertOutgoing = db.prepare(`
  INSERT INTO outgoing_letters (
    id, agenda_number, letter_number, letter_date, recipient, recipient_institution,
    subject, sender_unit_id, signer_name, letter_nature, summary, notes,
    file_path, file_name, file_size, file_type, status, archive_id, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'application/pdf', ?, ?, ?)
`);

insertOutgoing.run(
  1,
  'SK/2026/00001',
  'S-1110/KW.33/2026',
  '2026-10-21',
  'Ibu Novi Trihadi',
  'Tempat (Narasumber Profesional)',
  'Permohonan sebagai Narasumber Pembinaan dan Peningkatan SDM',
  2, // Bagian Kepegawaian
  'Dian Nurlina (Plh. Kepala)',
  'Penting',
  'Permohonan kesediaan sebagai narasumber kegiatan Pembinaan dan Peningkatan SDM di Lingkungan Kantor Wilayah Kementerian Haji dan Umrah Provinsi Papua pada Jumat, 23 Oktober 2026 di Hotel Horison Kotaraja.',
  'Surat fisik asli telah ditandatangani dan dicap basah resmi.',
  'storage/documents/Permohonan_Narasumber_Pembinaan_SDM-contoh_surat_keluar.pdf',
  'Permohonan Narasumber Pembinaan SDM-contoh surat keluar.pdf',
  sizeSk1,
  'DIKIRIM',
  2,
  4 // admin.kepegawaian
);

insertOutgoing.run(
  2,
  'SK/2026/00002',
  'S-1077/KW.33/2026',
  '2026-10-14',
  'Sekretaris Jenderal Kementerian Haji dan Umrah RI',
  'Kementerian Haji dan Umrah RI di Jakarta',
  'Penyampaian Laporan Langkah Strategi Belanja Kementerian Haji dan Umrah Triwulan IV Anggaran 2026',
  1, // Bagian Keuangan
  'Musa Narwawan (Kepala)',
  'Penting',
  'Tindak lanjut SE Sekjen No. S-803/SJ/2026 terkait Langkah Strategi Belanja TW IV 2026, efisiensi Pagu Akun Belanja Perjalanan Dinas (Akun 542) pada Satker 695295, 695296, 695297 Kanwil Kemenhaj Papua.',
  'Dokumen lampiran rincian efisiensi belanja telah dilampirkan.',
  'storage/documents/Surat_lampiran_langkah_strategi_belanja-contoh_surat_keluar.pdf',
  'Surat lampiran _ langkah strategi belanja-contoh surat keluar.pdf',
  sizeSk2,
  'DIKIRIM',
  3,
  3 // admin.keuangan
);
console.log('   ? 2 Surat Keluar (SK/2026/00001 & SK/2026/00002) berhasil disimpan.');

// 8. Masukkan Audit Logs
console.log('\n7. Menginput log aktivitas awal ke tabel audit_logs...');
const insertLog = db.prepare(`
  INSERT INTO audit_logs (user_id, user_name, action, module, record_id, description, ip_address, created_at)
  VALUES (?, ?, ?, ?, ?, ?, '127.0.0.1', datetime('now', 'localtime'))
`);

insertLog.run(
  2,
  'Faisal Akbar, S.Kom (Admin Arsip)',
  'REGISTER_INCOMING_LETTER',
  'PERSURATAN',
  'SM/2026/00001',
  'Mencatat Surat Masuk resmi Pusdatin Kemenhaj No: S-100/PDT/2026 perihal Pendataan Operator Sistem Informasi'
);

insertLog.run(
  4,
  'Markus Kogoya, S.IP (Admin Kepegawaian)',
  'CREATE_OUTGOING_LETTER',
  'PERSURATAN',
  'SK/2026/00001',
  'Menerbitkan Surat Keluar resmi No: S-1110/KW.33/2026 perihal Permohonan Narasumber Pembinaan SDM'
);

insertLog.run(
  3,
  'Kornelia Wanggai, S.E. (Admin Keuangan)',
  'CREATE_OUTGOING_LETTER',
  'PERSURATAN',
  'SK/2026/00002',
  'Menerbitkan Surat Keluar resmi No: S-1077/KW.33/2026 perihal Langkah Strategi Belanja TW IV 2026'
);
console.log('   ? Audit logs tersimpan.');

// 9. Verifikasi Hasil
console.log('\n=== VERIFIKASI AKHIR DATABASE SI-ARSIP ===');
const countArchives = db.prepare('SELECT COUNT(*) as c FROM archives').get().c;
const countIncoming = db.prepare('SELECT COUNT(*) as c FROM incoming_letters').get().c;
const countOutgoing = db.prepare('SELECT COUNT(*) as c FROM outgoing_letters').get().c;

console.log(`- Total Archives        : ${countArchives} berkas (Harus tepat 3)`);
console.log(`- Total Incoming Letters: ${countIncoming} berkas (Harus tepat 1)`);
console.log(`- Total Outgoing Letters: ${countOutgoing} berkas (Harus tepat 2)`);

console.log('\nDetail Data:');
console.log(db.prepare('SELECT id, archive_code, document_number, document_title FROM archives').all());
console.log(db.prepare('SELECT id, agenda_number, letter_number, subject, sender_institution FROM incoming_letters').all());
console.log(db.prepare('SELECT id, agenda_number, letter_number, subject, recipient FROM outgoing_letters').all());

console.log('\n=== SELESAI DENGAN SUKSES! ===');
