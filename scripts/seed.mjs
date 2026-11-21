import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'siarsip.db');
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'documents');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

// Remove existing DB to do clean re-seed
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

console.log('Creating database tables...');

db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    module TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
  );

  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    leader_name TEXT,
    leader_nip TEXT,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    full_name TEXT NOT NULL,
    nip TEXT,
    job_title TEXT,
    unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    last_login TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS archive_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS archives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    archive_code TEXT UNIQUE NOT NULL,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    category_id INTEGER NOT NULL REFERENCES archive_categories(id) ON DELETE RESTRICT,
    document_number TEXT,
    document_title TEXT NOT NULL,
    document_date TEXT NOT NULL,
    year INTEGER NOT NULL,
    subject TEXT,
    origin TEXT,
    destination TEXT,
    description TEXT,
    keywords TEXT,
    security_level TEXT NOT NULL DEFAULT 'INTERNAL',
    status TEXT NOT NULL DEFAULT 'AKTIF',
    file_path TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS archive_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    UNIQUE(user_id, archive_id)
  );

  CREATE TABLE IF NOT EXISTS recent_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
    viewed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    UNIQUE(user_id, archive_id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    record_id TEXT,
    description TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO',
    link TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

console.log('Seeding Roles...');
const roles = [
  { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Akses penuh seluruh sistem dan master data' },
  { code: 'ADMIN_ARSIP', name: 'Admin E-Arsip', description: 'Pengelola arsip pusat dan persuratan kanwil' },
  { code: 'ADMIN_UNIT', name: 'Admin Unit Kerja', description: 'Pengelola arsip khusus unit kerja bersangkutan' },
  { code: 'PIMPINAN', name: 'Pimpinan', description: 'Monitoring dashboard, disposisi, dan review dokumen' },
  { code: 'PEGAWAI', name: 'Pegawai', description: 'Akses dokumen sesuai hak akses dan permission' }
];

const insertRole = db.prepare('INSERT INTO roles (code, name, description) VALUES (?, ?, ?)');
for (const r of roles) {
  insertRole.run(r.code, r.name, r.description);
}

console.log('Seeding Units...');
const units = [
  { code: 'KEU', name: 'Bagian Keuangan', leader_name: 'Drs. H. Syamsuddin, M.Si', leader_nip: '197405121998031002', description: 'Pengelolaan anggaran, perbendaharaan, SPJ, dan akuntansi', order: 1 },
  { code: 'PEG', name: 'Bagian Kepegawaian', leader_name: 'Yohanes Rumbewas, S.Sos, M.AP', leader_nip: '197808202003121004', description: 'Pengelolaan SDM aparatur, mutasi, kenaikan pangkat, dan cuti', order: 2 },
  { code: 'UMH', name: 'Bagian Umum dan Humas', leader_name: 'Sarah Marisan, S.Ag, M.Pd', leader_nip: '198003152005012003', description: 'Administrasi umum, persuratan, protokol, BMN, dan kehumasan', order: 3 },
  { code: 'REN', name: 'Bagian Perencanaan dan Anggaran', leader_name: 'Ahmad Ridwan, S.E., M.M', leader_nip: '198211042008011015', description: 'Penyusunan RKA-K/L, DIPA, POK, dan evaluasi kinerja program', order: 4 },
  { code: 'HAJI', name: 'Bidang Pembinaan Haji dan Pelayanan Haji', leader_name: 'H. Musa Al-Habsyi, Lc., M.H', leader_nip: '197202101997031001', description: 'Penyelenggaraan haji, manasik terpadu, dan pelayanan jemaah', order: 5 },
];

const insertUnit = db.prepare('INSERT INTO units (code, name, leader_name, leader_nip, description, display_order) VALUES (?, ?, ?, ?, ?, ?)');
for (const u of units) {
  insertUnit.run(u.code, u.name, u.leader_name, u.leader_nip, u.description, u.order);
}

console.log('Seeding Users...');
const users = [
  {
    username: 'superadmin',
    email: 'superadmin@kemenag.go.id',
    pass: 'admin123',
    name: 'Administrator Utama',
    nip: '198501012010011001',
    job: 'Pranata Komputer Ahli Madya',
    unitId: null,
    roleId: 1
  },
  {
    username: 'admin.arsip',
    email: 'arsip@kemenag.go.id',
    pass: 'arsip123',
    name: 'Faisal Akbar, S.Kom',
    nip: '199004122015031002',
    job: 'Arsiparis Ahli Pertama',
    unitId: 3, // Umum & Humas / Sentral
    roleId: 2
  },
  {
    username: 'admin.keuangan',
    email: 'keuangan@kemenag.go.id',
    pass: 'keu123',
    name: 'Kornelia Wanggai, S.E.',
    nip: '199209182017012003',
    job: 'Pengelola Keuangan APBN',
    unitId: 1, // KEU
    roleId: 3
  },
  {
    username: 'admin.kepegawaian',
    email: 'kepegawaian@kemenag.go.id',
    pass: 'peg123',
    name: 'Markus Kogoya, S.IP',
    nip: '198906232014021004',
    job: 'Analis Kepegawaian Muda',
    unitId: 2, // PEG
    roleId: 3
  },
  {
    username: 'admin.umum',
    email: 'umum@kemenag.go.id',
    pass: 'umum123',
    name: 'Dewi Sartika Wanimbo',
    nip: '199311052018022001',
    job: 'Pengadministrasi Persuratan',
    unitId: 3, // UMH
    roleId: 3
  },
  {
    username: 'admin.perencanaan',
    email: 'renja@kemenag.go.id',
    pass: 'ren123',
    name: 'Budi Santoso, S.E.',
    nip: '198708152011011005',
    job: 'Perencana Ahli Pertama',
    unitId: 4, // REN
    roleId: 3
  },
  {
    username: 'admin.haji',
    email: 'haji@kemenag.go.id',
    pass: 'haji123',
    name: 'Ust. Ridwan Mansur, S.Pd.I',
    nip: '198603102010011008',
    job: 'Pengelola Pelayanan Haji',
    unitId: 5, // HAJI
    roleId: 3
  },
  {
    username: 'kakanwil',
    email: 'kakanwil.papua@kemenag.go.id',
    pass: 'kakanwil123',
    name: 'Pdt. Klemens Awi, S.Th., M.Si',
    nip: '196807151994031003',
    job: 'Kepala Kantor Wilayah Kemenag Prov. Papua',
    unitId: null,
    roleId: 4
  },
  {
    username: 'kabag.tu',
    email: 'kabagtu.papua@kemenag.go.id',
    pass: 'pimpinan123',
    name: 'H. Abdul Rahman, S.Ag, M.H',
    nip: '197305101999031002',
    job: 'Kepala Bagian Tata Usaha',
    unitId: null,
    roleId: 4
  },
  {
    username: 'pegawai.keu',
    email: 'marta.tabuni@kemenag.go.id',
    pass: 'pegawai123',
    name: 'Marta Tabuni, A.Md',
    nip: '199604112022032005',
    job: 'Verifikator Keuangan',
    unitId: 1, // KEU
    roleId: 5
  }
];

const insertUser = db.prepare(`
  INSERT INTO users (username, email, password_hash, password_salt, full_name, nip, job_title, unit_id, role_id, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
`);

for (const u of users) {
  const { hash, salt } = hashPassword(u.pass);
  insertUser.run(u.username, u.email, hash, salt, u.name, u.nip, u.job, u.unitId, u.roleId);
}

console.log('Seeding Categories...');
const categories = [
  // Keuangan (unit_id: 1)
  { code: 'CAT-KEU-01', name: 'Dokumen Keuangan', unitId: 1, desc: 'Berkas umum administrasi keuangan' },
  { code: 'CAT-KEU-02', name: 'Surat Pertanggungjawaban (SPJ)', unitId: 1, desc: 'Laporan pertanggungjawaban belanja dan kegiatan' },
  { code: 'CAT-KEU-03', name: 'Surat Permintaan Pembayaran (SPP)', unitId: 1, desc: 'Dokumen pengajuan SPP UP/GU/TU/LS' },
  { code: 'CAT-KEU-04', name: 'Surat Perintah Membayar (SPM)', unitId: 1, desc: 'Dokumen penerbitan SPM ke KPPN' },
  { code: 'CAT-KEU-05', name: 'Surat Perintah Pencairan Dana (SP2D)', unitId: 1, desc: 'Bukti realisasi pencairan dari KPPN Jayapura' },
  { code: 'CAT-KEU-06', name: 'Bukti Pembayaran & Kwitansi', unitId: 1, desc: 'Kwitansi sah pembayaran kegiatan dan belanja riil' },
  { code: 'CAT-KEU-07', name: 'Laporan Keuangan & Rekonsiliasi SAKTI', unitId: 1, desc: 'Laporan bulanan/semester/tahunan keuangan Kemenag' },
  { code: 'CAT-KEU-08', name: 'Dokumen Pajak & Setoran Kas Negara', unitId: 1, desc: 'Bukti setor PPh, PPN, dan e-Billing' },

  // Kepegawaian (unit_id: 2)
  { code: 'CAT-PEG-01', name: 'Surat Keputusan (SK) Pegawai', unitId: 2, desc: 'SK Pengangkatan, Jabatan Struktural dan Fungsional' },
  { code: 'CAT-PEG-02', name: 'Surat Tugas & Perjalanan Dinas', unitId: 2, desc: 'Surat tugas kedinasan internal dan luar daerah' },
  { code: 'CAT-PEG-03', name: 'Surat Izin & Cuti Pegawai', unitId: 2, desc: 'Cuti tahunan, cuti melahirkan, cuti alasan penting' },
  { code: 'CAT-PEG-04', name: 'Kenaikan Pangkat & Golongan', unitId: 2, desc: 'Berkas usulan dan SK kenaikan pangkat reguler/fungsional' },
  { code: 'CAT-PEG-05', name: 'Kenaikan Gaji Berkala (KGB)', unitId: 2, desc: 'Surat keputusan hak kenaikan berkala pegawai' },
  { code: 'CAT-PEG-06', name: 'Mutasi & Pensiun ASN', unitId: 2, desc: 'Dokumen alih tugas, mutasi antar-satker, SK pensiun BKN' },
  { code: 'CAT-PEG-07', name: 'Sasaran Kinerja Pegawai (SKP)', unitId: 2, desc: 'Penilaian kinerja periodik ASN Kemenag Papua' },
  { code: 'CAT-PEG-08', name: 'Sertifikat Kompetensi & Pelatihan', unitId: 2, desc: 'Sertifikat diklat teknis, prajabatan, kepemimpinan' },

  // Umum & Humas (unit_id: 3)
  { code: 'CAT-UMH-01', name: 'Surat Masuk Kanwil', unitId: 3, desc: 'Arsip surat resmi masuk dari instansi luar atau satker daerah' },
  { code: 'CAT-UMH-02', name: 'Surat Keluar Kanwil', unitId: 3, desc: 'Arsip tembusan surat resmi yang diterbitkan Kanwil Kemenag Papua' },
  { code: 'CAT-UMH-03', name: 'Undangan Kedinasan', unitId: 3, desc: 'Undangan rapat internal, seremoni, dan rakor tingkat provinsi' },
  { code: 'CAT-UMH-04', name: 'Nota Dinas Internal', unitId: 3, desc: 'Komunikasi tertulis antar bagian dalam lingkungan Kanwil' },
  { code: 'CAT-UMH-05', name: 'Dokumentasi & Publikasi Humas', unitId: 3, desc: 'Press release, liputan media, materi publikasi resmi' },
  { code: 'CAT-UMH-06', name: 'Pengadaan & BMN (Barang Milik Negara)', unitId: 3, desc: 'Arsip tender, kontrak pengadaan, inventaris aset tanah/gedung' },

  // Perencanaan & Anggaran (unit_id: 4)
  { code: 'CAT-REN-01', name: 'Rencana Kerja & RKA-K/L', unitId: 4, desc: 'Dokumen rancangan anggaran dan rencana kerja kementerian' },
  { code: 'CAT-REN-02', name: 'DIPA & POK Satker Kanwil', unitId: 4, desc: 'DIPA Petikan alokasi anggaran dan petunjuk operasional' },
  { code: 'CAT-REN-03', name: 'Kerangka Acuan Kerja (TOR) & RAB', unitId: 4, desc: 'Rincian anggaran biaya dan justifikasi kegiatan' },
  { code: 'CAT-REN-04', name: 'Revisi Anggaran & Matriks Perubahan', unitId: 4, desc: 'Dokumen usulan revisi pagu dan persetujuan Kanwil DJPb' },
  { code: 'CAT-REN-05', name: 'Laporan Evaluasi & Capaian Output (SMART/Monev)', unitId: 4, desc: 'Laporan progres capaian target IKU satker Kanwil' },

  // Pembinaan Haji (unit_id: 5)
  { code: 'CAT-HAJI-01', name: 'Data Jemaah Haji Papua', unitId: 5, desc: 'Data jemaah reguler dan khusus (Tingkat Keamanan Tinggi)' },
  { code: 'CAT-HAJI-02', name: 'Bimbingan Manasik Haji Terpadu', unitId: 5, desc: 'Silabus, modul, dan laporan manasik di kabupaten/kota se-Papua' },
  { code: 'CAT-HAJI-03', name: 'Pelayanan Paspor & Visa Haji', unitId: 5, desc: 'Kelengkapan dokumen imigrasi dan visa bio jemaah' },
  { code: 'CAT-HAJI-04', name: 'Kloter & Operasional Keberangkatan-Pemulangan', unitId: 5, desc: 'Jadwal manifes penerbangan, karantina, dan akomodasi' },
  { code: 'CAT-HAJI-05', name: 'Petugas Haji Daerah (PHD & TPHI/TPIH)', unitId: 5, desc: 'SK penetapan dan surat tugas pendamping ibadah haji' },
  { code: 'CAT-HAJI-06', name: 'Laporan Akhir Penyelenggaraan Ibadah Haji', unitId: 5, desc: 'Laporan akuntabilitas komprehensif musim haji' }
];

const insertCat = db.prepare('INSERT INTO archive_categories (code, name, unit_id, description) VALUES (?, ?, ?, ?)');
for (const c of categories) {
  insertCat.run(c.code, c.name, c.unitId, c.desc);
}

// Generate realistic template document files for storage
console.log('Generating realistic sample file archives...');
function createSampleDocFile(filename, title, docNo, unitName, dateStr) {
  const filePath = path.join(STORAGE_DIR, filename);
  const content = `================================================================================
KEMENTERIAN AGAMA REPUBLIK INDONESIA
KANTOR WILAYAH KEMENTERIAN AGAMA PROVINSI PAPUA
Jl. Raya Abepura - Kotaraja, Jayapura, Papua
================================================================================

DOKUMEN RESMI TERSIMPAN DALAM SISTEM INFORMASI ARSIP (SI-ARSIP)
UNIT PENGELOLA : ${unitName}
KODE VERIFIKASI: KEMENAG-PAPUA-${crypto.randomBytes(4).toString('hex').toUpperCase()}

NOMOR DOKUMEN  : ${docNo}
TANGGAL         : ${dateStr}
PERIHAL / JUDUL : ${title}

RINGKASAN EKSEKUTIF:
Dokumen ini merupakan salinan arsip digital yang telah melalui proses validasi
dan verifikasi administrasi pada Kantor Wilayah Kementerian Agama Provinsi Papua.
Segala isi dalam dokumen ini tunduk pada ketentuan peraturan perundang-undangan 
terkait Kearsipan Negara dan Keterbukaan Informasi Publik RI.

STATUS ARSIP    : TERVERIFIKASI & AKTIF
PENGESAHAN      : TERTANDATANGANI SECARA ELEKTRONIK / BASAH PADA BERKAS FISIK INDUK
SISTEM PENYIMPAN: SI-ARSIP CLOUD KANWIL KEMENAG PAPUA
================================================================================
Dicetak/Diverifikasi dari Sistem Informasi Arsip pada ${new Date().toISOString()}
`;
  fs.writeFileSync(filePath, content, 'utf-8');
  return {
    filePath: `storage/documents/${filename}`,
    fileSize: Buffer.byteLength(content, 'utf-8'),
    fileName: filename,
    fileType: 'application/pdf'
  };
}

console.log('Seeding 50+ Realistic Archives...');

const rawArchives = [
  // --- KEUANGAN (unit_id: 1) ---
  {
    unitId: 1, catId: 2, docNo: 'SPJ/BIA/014/KEU/2026',
    title: 'Surat Pertanggungjawaban (SPJ) Belanja Operasional Perkantoran Bulan Januari 2026',
    date: '2026-01-30', year: 2026, subject: 'SPJ Belanja Operasional Rutin Kantor Kanwil',
    origin: 'Subbag Keuangan dan BMN', dest: 'KPA Kanwil Kemenag Papua',
    desc: 'Laporan pertanggungjawaban lengkap belanja daya dan jasa, ATK kantor, serta langganan internet Kanwil.',
    tags: 'spj, operasional, kantor, belanja rutin, 2026',
    sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 5, docNo: 'SP2D-26019010041289',
    title: 'SP2D Pencairan Gaji dan Tunjangan Kinerja Pegawai Kanwil Kemenag Papua Bulan Februari 2026',
    date: '2026-02-02', year: 2026, subject: 'Pencairan Tukin dan Gaji Induk ASN',
    origin: 'KPPN Jayapura', dest: 'Bendahara Pengeluaran Kanwil Kemenag Papua',
    desc: 'SP2D dari Kantor Pelayanan Perbendaharaan Negara (KPPN) Jayapura untuk pembayaran hak pegawai.',
    tags: 'sp2d, kppn, gaji, tukin, tunjangan, 2026',
    sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 7, docNo: 'LK-TW4/PAPUA/2025/089',
    title: 'Laporan Keuangan Tahunan Unaudited Kanwil Kemenag Provinsi Papua TA 2025',
    date: '2026-01-20', year: 2025, subject: 'Laporan Keuangan Berbasis Akrual TA 2025',
    origin: 'Bagian Keuangan', dest: 'Biro Keuangan Sekjen Kemenag RI',
    desc: 'Neraca, Laporan Operasional (LO), Laporan Realisasi Anggaran (LRA), dan Catatan atas Laporan Keuangan (CaLK).',
    tags: 'laporan keuangan, neraca, lra, calk, sakti, 2025',
    sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 4, docNo: 'SPM-LS/00142/KEU/2026',
    title: 'Surat Perintah Membayar (SPM-LS) Pengadaan Sarana Prasarana Digital Arsip',
    date: '2026-02-15', year: 2026, subject: 'SPM Langsung (LS) Pihak Ketiga',
    origin: 'PPK Bagian Umum & Keuangan', dest: 'KPPN Jayapura',
    desc: 'Penerbitan SPM-LS untuk pembayaran termin pekerjaan infrastruktur digital arsip dan server lokal.',
    tags: 'spm, ls, pengadaan, siarsip, sarpras',
    sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 3, docNo: 'SPP-UP/0001/KEU/2026',
    title: 'Surat Permintaan Pembayaran Uang Persediaan (SPP-UP) Awal Tahun Anggaran 2026',
    date: '2026-01-08', year: 2026, subject: 'Pengajuan UP Kas Awal Satker',
    origin: 'Bendahara Pengeluaran', dest: 'PPK Kanwil Kemenag Papua',
    desc: 'Pengajuan Uang Persediaan (UP) guna membiayai kebutuhan operasional harian kantor.',
    tags: 'spp, uang persediaan, up, kas kecil, 2026',
    sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 8, docNo: 'BPN/PJK/2026/01-098',
    title: 'Bukti Penerimaan Negara (BPN) Setoran Pajak PPh 21 dan PPN Masa Januari 2026',
    date: '2026-02-10', year: 2026, subject: 'Penyetoran Pajak Belanja Negara ke Kas Negara',
    origin: 'KPP Pratama Jayapura', dest: 'Bendahara Pengeluaran',
    desc: 'Surat setoran pajak elektronik e-Billing dan Nomor Transaksi Penerimaan Negara (NTPN).',
    tags: 'pajak, pph21, ppn, bpn, ntpn, kas negara',
    sec: 'TERBATAS', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 6, docNo: 'KWT/045/KEU-HAB/2026',
    title: 'Kwitansi dan Bukti Pengeluaran Kegiatan Peringatan Hari Amal Bhakti (HAB) ke-80',
    date: '2026-01-12', year: 2026, subject: 'Kwitansi Konsumsi dan Sewa Sound System HAB ke-80',
    origin: 'Panitia HAB ke-80 Kanwil', dest: 'Bendahara Pengeluaran',
    desc: 'Dokumen bukti pengeluaran sah, nota toko, faktur pajak, dan tanda terima kegiatan HAB ke-80.',
    tags: 'kwitansi, hab80, konsumsi, bukti belanja',
    sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 2, docNo: 'SPJ/PERDIN/032/2026',
    title: 'SPJ Perjalanan Dinas Monitoring Pelaksanaan Anggaran ke Kemenag Kabupaten Merauke',
    date: '2026-02-18', year: 2026, subject: 'Pertanggungjawaban Perdin Pengawasan Anggaran',
    origin: 'Tim Monitoring Keuangan', dest: 'KPA Kanwil Kemenag Papua',
    desc: 'Tiket penerbangan Jayapura-Merauke, boarding pass, rincian biaya riil, dan laporan hasil pembinaan.',
    tags: 'spj, perdin, merauke, tiket, pembinaan',
    sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 7, docNo: 'BA-REKON/SAKTI/2026-01',
    title: 'Berita Acara Rekonsiliasi Eksternal Data Laporan Keuangan dengan KPPN Jayapura Periode Jan 2026',
    date: '2026-02-08', year: 2026, subject: 'Rekonsiliasi SAKTI-SPAN Kemenkeu',
    origin: 'Seksi Akuntansi Kanwil', dest: 'KPPN Jayapura',
    desc: 'Hasil rekonsiliasi kas dan akrual satker 417822 yang dinyatakan match 100% tanpa selisih TAYL.',
    tags: 'rekon, sakti, span, kppn jayapura, berita acara',
    sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 1, docNo: 'ND/KEU/019/2026',
    title: 'Petunjuk Teknis Pengelolaan Kas dan Langkah-Langkah Strategis Pelaksanaan Anggaran TA 2026',
    date: '2026-01-05', year: 2026, subject: 'Juknis Pelaksanaan Anggaran 2026',
    origin: 'Kepala Bagian Keuangan', dest: 'Seluruh Pejabat Pembuat Komitmen (PPK)',
    desc: 'Pedoman percepatan penyerapan anggaran triwulan I dan kepatuhan terhadap indikator IKPA.',
    tags: 'juknis, ikpa, kas, pedoman, serapan anggaran',
    sec: 'PUBLIK', status: 'AKTIF', user: 3
  },

  // --- KEPEGAWAIAN (unit_id: 2) ---
  {
    unitId: 2, catId: 9, docNo: 'B-012/Kw.26.1/KP.07.1/01/2026',
    title: 'SK Penetapan Pegawai Teladan dan Agen Perubahan Zona Integritas Kanwil Kemenag Papua 2026',
    date: '2026-01-15', year: 2026, subject: 'Penetapan Role Model ASN Berprestasi',
    origin: 'Kakanwil Kemenag Papua', dest: 'Seluruh Pegawai Kanwil Kemenag Papua',
    desc: 'Keputusan Kakanwil tentang penetapan ASN berkinerja unggul dalam pembangunan Wilayah Bebas dari Korupsi (WBK).',
    tags: 'sk, pegawai teladan, zona integritas, wbk, 2026',
    sec: 'PUBLIK', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 12, docNo: 'KP.04.1/082/BKN-JYP/2025',
    title: 'Petikan SK Kenaikan Pangkat Reguler Periode Oktober 2025 ASN Kanwil Kemenag Papua',
    date: '2025-10-01', year: 2025, subject: 'SK Kenaikan Pangkat Golongan III dan IV',
    origin: 'Badan Kepegawaian Negara (BKN) Regional IX Jayapura', dest: 'Bagian Kepegawaian Kanwil',
    desc: 'Kenaikan pangkat 24 pegawai di lingkungan Kanwil Kemenag Papua dari Golongan III/b ke III/c dan III/d ke IV/a.',
    tags: 'kenaikan pangkat, bkn, sk petikan, golongan',
    sec: 'TERBATAS', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 10, docNo: 'ST-088/Kw.26.1/KP.01.2/02/2026',
    title: 'Surat Tugas Pembinaan Disiplin ASN dan Pemutakhiran Data SIASN ke Kemenag Kabupaten Jayawijaya',
    date: '2026-02-12', year: 2026, subject: 'Surat Tugas Pembinaan Kepegawaian di Wamena',
    origin: 'Kepala Bagian Tata Usaha', dest: 'Tim Kepegawaian Kanwil',
    desc: 'Penugasan tim verifikasi data profil ASN, pendataan pensiun terpadu, dan sosialisasi MyASN di Wamena.',
    tags: 'surat tugas, wamena, jayawijaya, siasn, myasn',
    sec: 'INTERNAL', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 13, docNo: 'KGB/012/PEG/2026',
    title: 'Pemberitahuan Kenaikan Gaji Berkala (KGB) Pejabat Administrator Kanwil Kemenag',
    date: '2026-01-25', year: 2026, subject: 'Surat Keputusan KGB Tahun 2026',
    origin: 'Bagian Kepegawaian', dest: 'Drs. H. Syamsuddin, M.Si',
    desc: 'Penyesuaian gaji pokok berkala terhitung mulai tanggal 1 Februari 2026 berdasarkan masa kerja golongan.',
    tags: 'kgb, gaji berkala, kepegawaian',
    sec: 'TERBATAS', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 11, docNo: 'CT/004/PEG/2026',
    title: 'Surat Izin Cuti Tahunan Pegawai Bagian Perencanaan dan Anggaran TA 2026',
    date: '2026-02-05', year: 2026, subject: 'Pemberian Cuti Tahunan 6 Hari Kerja',
    origin: 'Kepala Bagian Tata Usaha', dest: 'Marta Tabuni, A.Md',
    desc: 'Surat keputusan pemberian hak cuti tahunan dengan tetap melimpahkan tugas kepada rekan kerja piket.',
    tags: 'cuti tahunan, izin, sdm',
    sec: 'INTERNAL', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 14, docNo: 'SK-MUT/008/KW-PAPUA/2025',
    title: 'SK Mutasi Internal dan Penempatan Staf Pelaksana pada Satker Kemenag Kota Jayapura',
    date: '2025-11-20', year: 2025, subject: 'Penyegaran dan Penataan Formasi Pegawai',
    origin: 'Kakanwil Kemenag Provinsi Papua', dest: 'Para Pegawai Terlampir',
    desc: 'Optimalisasi beban kerja pelayanan publik antar satuan kerja kementerian agama di wilayah Jayapura.',
    tags: 'mutasi, penempatan, rotasi, staf',
    sec: 'TERBATAS', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 15, docNo: 'SKP-2025/PEG/001',
    title: 'Rekapitulasi Penilaian Sasaran Kinerja Pegawai (SKP) Berpredikat Baik dan Sangat Baik 2025',
    date: '2026-01-10', year: 2025, subject: 'Evaluasi Kinerja Tahunan Aparatur Sipil Negara',
    origin: 'Tim Penilai Kinerja Kanwil', dest: 'Kakanwil Kemenag Papua',
    desc: 'Daftar rekapitulasi penilaian kinerja berdasarkan aplikasi e-Kinerja BKN untuk 142 pegawai Kanwil.',
    tags: 'skp, kinerja, ekinerja, bkn, rekap',
    sec: 'TERBATAS', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 16, docNo: 'SERT-BDK/JYP/2025-412',
    title: 'Sertifikat Pelatihan Manajemen Kearsipan Digital Berbasis Cloud bagi Pegawai Kanwil',
    date: '2025-12-15', year: 2025, subject: 'Sertifikat Diklat Teknis Kearsipan Modern',
    origin: 'Balai Diklat Keagamaan (BDK) Papua', dest: 'Arsiparis dan Staf Persuratan Kanwil',
    desc: 'Bukti kelulusan diklat teknis 40 jam pelatihan (JP) implementasi Sistem Informasi Arsip Dinamis.',
    tags: 'sertifikat, bdk, diklat, kearsipan, cloud',
    sec: 'PUBLIK', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 9, docNo: 'B-094/Kw.26.1/KP.00.3/02/2026',
    title: 'Surat Edaran Jam Kerja ASN Kemenag Papua Selama Bulan Suci Ramadan 1447 H / 2026 M',
    date: '2026-02-25', year: 2026, subject: 'Penetapan Jam Masuk dan Pulang Kantor',
    origin: 'Kakanwil Kemenag Provinsi Papua', dest: 'Kemenag Kab/Kota dan Madrasah Negeri se-Papua',
    desc: 'Penyesuaian jam kerja pelayanan publik menjadi 32,5 jam per minggu dengan tetap menjaga efektivitas layanan.',
    tags: 'surat edaran, ramadan, jam kerja, asn, pelayanan',
    sec: 'PUBLIK', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 14, docNo: 'SK-PENSIUN/021/BKN/2025',
    title: 'Petikan Surat Keputusan Pensiun Batas Usia Pensiun (BUP) Pegawai Fungsional Guru/Pengawas',
    date: '2025-12-28', year: 2025, subject: 'Pemberian Pensiun dan Penghargaan Masa Kerja',
    origin: 'Presiden RI / BKN Pusat', dest: 'Penerima Pensiun Melalui Kanwil',
    desc: 'Pemberian hak pensiun atas pengabdian 32 tahun di lingkungan Kementerian Agama Provinsi Papua.',
    tags: 'pensiun, bup, penghargaan, taspen',
    sec: 'TERBATAS', status: 'AKTIF', user: 4
  },

  // --- UMUM DAN HUMAS (unit_id: 3) ---
  {
    unitId: 3, catId: 17, docNo: '005/GUB-PAPUA/SETDA/02/2026',
    title: 'Surat Masuk: Undangan Rapat Koordinasi Forum Komunikasi Pimpinan Daerah (Forkopimda) Papua',
    date: '2026-02-14', year: 2026, subject: 'Rakor Stabilitas Keamanan dan Kerukunan Umat Beragama',
    origin: 'Pemerintah Provinsi Papua - Sekretariat Daerah', dest: 'Kakanwil Kemenag Provinsi Papua',
    desc: 'Undangan resmi Gubernur Papua terkait penguatan moderasi beragama dan toleransi masyarakat di Bumi Cenderawasih.',
    tags: 'surat masuk, gubernur, forkopimda, kerukunan, moderasi',
    sec: 'INTERNAL', status: 'AKTIF', user: 2
  },
  {
    unitId: 3, catId: 18, docNo: 'B-214/Kw.26.1/HM.00/02/2026',
    title: 'Surat Keluar: Tanggapan dan Laporan Kesiapan Fasilitasi Rumah Ibadah Ramah Disabilitas di Papua',
    date: '2026-02-20', year: 2026, subject: 'Laporan Fasilitasi Aksesibilitas Tempat Ibadah',
    origin: 'Kakanwil Kemenag Provinsi Papua', dest: 'Sekretaris Jenderal Kementerian Agama RI di Jakarta',
    desc: 'Laporan komprehensif implementasi sarana inklusif pada masjid, gereja, pura, dan vihara percontohan di Jayapura.',
    tags: 'surat keluar, sekjen, disabilitas, rumah ibadah, inklusif',
    sec: 'INTERNAL', status: 'AKTIF', user: 2
  },
  {
    unitId: 3, catId: 19, docNo: 'UND-042/Kw.26.1/BA.01.1/01/2026',
    title: 'Undangan Upacara Bendera Peringatan Hari Amal Bhakti (HAB) ke-80 Kementerian Agama',
    date: '2026-01-02', year: 2026, subject: 'Undangan HAB ke-80 di Halaman Kanwil',
    origin: 'Ketua Panitia HAB ke-80', dest: 'Pimpinan Lembaga Keagamaan dan Tokoh Agama Papua',
    desc: 'Jadwal tata tertib upacara dengan mengenakan busana adat nusantara dan seragam batik Kemenag.',
    tags: 'undangan, hab, upacara, kerukunan, tokoh agama',
    sec: 'PUBLIK', status: 'AKTIF', user: 5
  },
  {
    unitId: 3, catId: 20, docNo: 'ND-088/Kw.26.1/TU.02/02/2026',
    title: 'Nota Dinas: Pemeliharaan Server Sistem Digital dan Sosialisasi E-Arsip Terpadu',
    date: '2026-02-16', year: 2026, subject: 'Pemberitahuan Migrasi Data dan Pelatihan Arsip',
    origin: 'Kepala Bagian Umum dan Humas', dest: 'Seluruh Kepala Bidang dan Pembimas',
    desc: 'Instruksi pengalihan penyimpanan arsip fisik ke format digital melalui aplikasi SI-ARSIP terpadu.',
    tags: 'nota dinas, e-arsip, siarsip, server, migrasi',
    sec: 'INTERNAL', status: 'AKTIF', user: 5
  },
  {
    unitId: 3, catId: 21, docNo: 'PR-015/HM.01/KANWIL-PAPUA/2026',
    title: 'Siaran Pers Resmi: Kakanwil Kemenag Papua Ajak Seluruh Tokoh Agama Jaga Kedamaian Pemilukada',
    date: '2026-01-28', year: 2026, subject: 'Siaran Pers Damai Papua Sejahtera',
    origin: 'Subbag Hubungan Masyarakat Kanwil', dest: 'Media Cetak, TVRI Papua, RRI Jayapura, & Portal Berita',
    desc: 'Rilis pers deklarasi damai bersama FKUB Provinsi Papua untuk mengawal kedamaian masyarakat.',
    tags: 'siaran pers, humas, berita, media, fkub, damai',
    sec: 'PUBLIK', status: 'AKTIF', user: 5
  },
  {
    unitId: 3, catId: 22, docNo: 'KTR-BMN/009/PO-IT/2025',
    title: 'Kontrak Pengadaan Perangkat Scanner High-Speed Dokumen Kearsipan Kanwil Kemenag Papua',
    date: '2025-11-10', year: 2025, subject: 'Dokumen Kontrak dan BAST Pengadaan BMN',
    origin: 'PPK Pengadaan Sarpras', dest: 'CV. Papua Digital Solution',
    desc: 'Surat perjanjian kerja sama, spesifikasi teknis scanner ADF, dan berita acara serah terima hasil pekerjaan.',
    tags: 'kontrak, bast, bmn, scanner, kearsipan',
    sec: 'TERBATAS', status: 'AKTIF', user: 5
  },
  {
    unitId: 3, catId: 22, docNo: 'BAST-ASET/041/UMH/2025',
    title: 'Berita Acara Serah Terima (BAST) Sertifikat Tanah Hibah Kantor Kemenag Kabupaten Keerom',
    date: '2025-09-18', year: 2025, subject: 'Pencatatan Aset BMN Tanah Hibah Pemerintah Daerah',
    origin: 'Pemerintah Kabupaten Keerom', dest: 'Kakanwil Kemenag Provinsi Papua',
    desc: 'Penyerahan sertifikat hak pakai tanah seluas 5.000 m2 untuk pembangunan gedung layanan haji dan KUA terpadu.',
    tags: 'bast, sertifikat tanah, bmn, keerom, hibah pemda',
    sec: 'TERBATAS', status: 'AKTIF', user: 5
  },
  {
    unitId: 3, catId: 17, docNo: 'B-108/KPK/LHKPN/01/2026',
    title: 'Surat Masuk: Pengingat Kepatuhan Penyampaian LHKPN Tahun 2025 Wajib Lapor Kemenag Papua',
    date: '2026-01-18', year: 2026, subject: 'Penyampaian LHKPN Periodik ke Komisi Pemberantasan Korupsi',
    origin: 'Direktorat Pendaftaran dan Pemeriksaan LHKPN KPK RI', dest: 'Kakanwil Kemenag Papua',
    desc: 'Tenggat batas waktu pengisian e-LHKPN bagi para pejabat eselon III dan PPK sebelum 31 Maret 2026.',
    tags: 'surat masuk, kpk, lhkpn, integritas, kepatuhan',
    sec: 'INTERNAL', status: 'AKTIF', user: 2
  },
  {
    unitId: 3, catId: 18, docNo: 'B-049/Kw.26.1/BA.00/01/2026',
    title: 'Surat Keluar: Permohonan Narasumber Dialog Lintas Agama RRI Pro 1 Jayapura',
    date: '2026-01-22', year: 2026, subject: 'Permohonan Dialog Interaktif Radio',
    origin: 'Kakanwil Kemenag Provinsi Papua', dest: 'Kepala LPP RRI Stasiun Jayapura',
    desc: 'Koordinasi program siaran rutin "Mimbar Agama dan Moderasi" bersama narasumber perwakilan majelis agama.',
    tags: 'surat keluar, rri jayapura, siaran, moderasi beragama',
    sec: 'PUBLIK', status: 'AKTIF', user: 5
  },
  {
    unitId: 3, catId: 20, docNo: 'ND-012/Kw.26.1/SET/01/2026',
    title: 'Nota Dinas: Pelaksanaan Tes Kebugaran Jasmani dan Pemeriksaan Kesehatan Berkala Pegawai',
    date: '2026-01-14', year: 2026, subject: 'Jadwal General Medical Check-up Pegawai',
    origin: 'Subbag Umum', dest: 'Seluruh ASN Kanwil Kemenag Papua',
    desc: 'Penyelenggaraan senam sehat bugar dan cek darah gratis bekerja sama dengan Balai Kesehatan Provinsi Papua.',
    tags: 'nota dinas, kesehatan, medical checkup, bugar',
    sec: 'PUBLIK', status: 'AKTIF', user: 5
  },

  // --- PERENCANAAN DAN ANGGARAN (unit_id: 4) ---
  {
    unitId: 4, catId: 24, docNo: 'DIPA-025.01.2.417822/2026',
    title: 'DIPA Petikan Satker Kantor Wilayah Kementerian Agama Provinsi Papua Tahun Anggaran 2026',
    date: '2025-12-18', year: 2026, subject: 'Dokumen Pelaksanaan Anggaran Pagu Rp 84.520.150.000',
    origin: 'Direktorat Jenderal Perbendaharaan Kemenkeu RI', dest: 'KPA Satker Kanwil Kemenag Papua',
    desc: 'Alokasi pagu belanja operasional pegawai, pembinaan pendidikan madrasah, bimas agama, dan pelayanan keagamaan.',
    tags: 'dipa, petikan, pagu anggaran, kemenkeu, 2026',
    sec: 'INTERNAL', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 23, docNo: 'RENJA-KANWIL/PAPUA/2026',
    title: 'Dokumen Rencana Kerja (Renja) dan Target Kinerja Tahunan Kanwil Kemenag Papua 2026',
    date: '2025-11-30', year: 2026, subject: 'Renja Tahunan Sasaran Strategis Kementerian Agama',
    origin: 'Bagian Perencanaan dan Anggaran', dest: 'Biro Perencanaan Kemenag RI',
    desc: 'Penjabaran Indikator Kinerja Utama (IKU), sasaran program kerukunan umat beragama, dan madrasah unggul di Papua.',
    tags: 'renja, rencana kerja, iku, sasaran strategis, 2026',
    sec: 'INTERNAL', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 25, docNo: 'TOR/RAB-MODERASI/2026',
    title: 'TOR & RAB Pelatihan Penguatan Moderasi Beragama Guru Madrasah Daerah Terluar dan Terpencil',
    date: '2026-01-16', year: 2026, subject: 'Justifikasi Anggaran Kegiatan Moderasi 3T',
    origin: 'PPK Bidang Pendis & Bagian Renja', dest: 'KPA Kanwil Kemenag Papua',
    desc: 'Rincian pembiayaan akomodasi, uang saku peserta, honor narasumber, dan tiket perintis ke wilayah pegunungan.',
    tags: 'tor, rab, moderasi beragama, guru 3t, madrasah',
    sec: 'INTERNAL', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 26, docNo: 'REV-01/DIPA-PAPUA/2026',
    title: 'Matriks Revisi Anggaran ke-1 Pergeseran Pagu Antar-Subkomponen Belanja Modal ke Operasional',
    date: '2026-02-19', year: 2026, subject: 'Usulan Revisi POK Satker Kanwil',
    origin: 'Subbag Perencanaan', dest: 'Kanwil DJPb Provinsi Papua',
    desc: 'Optimalisasi sisa tender pengadaan untuk mendukung kegiatan monitoring Ujian Nasional Berbasis Komputer.',
    tags: 'revisi anggaran, djpb, pergeseran pagu, pok',
    sec: 'INTERNAL', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 27, docNo: 'LAP-SMART/TW4-2025/PAPUA',
    title: 'Laporan Capaian Kinerja Anggaran (SMART DJA) Satker Kanwil Kemenag Papua TA 2025',
    date: '2026-01-25', year: 2025, subject: 'Nilai Kinerja Anggaran Mencapai 96.84% (Kategori Sangat Baik)',
    origin: 'Bagian Perencanaan dan Anggaran', dest: 'Direktorat Jenderal Anggaran (DJA) Kemenkeu',
    desc: 'Laporan evaluasi SMART Kemenkeu meliputi penyerapan anggaran, konsistensi RPD, dan efisiensi belanja kegiatan.',
    tags: 'smart, dja, evaluasi, kinerja anggaran, monev',
    sec: 'PUBLIK', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 24, docNo: 'POK/SATKER-417822/2026',
    title: 'Petunjuk Operasional Kegiatan (POK) Rinci Satker Kanwil Kemenag Papua TA 2026',
    date: '2026-01-04', year: 2026, subject: 'Distribusi Anggaran Tiap Seksi dan Pembimas',
    origin: 'Kepala Bagian Tata Usaha', dest: 'Para PPK Satker 417822',
    desc: 'Rincian akun belanja 51 (pegawai), 52 (barang dan jasa), serta 53 (modal) untuk panduan eksekusi kegiatan.',
    tags: 'pok, petunjuk operasional, rincian belanja, ppk',
    sec: 'INTERNAL', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 25, docNo: 'TOR/SBSN-KUA/2026',
    title: 'Proposal dan Feasibility Study Pembangunan Balai Nikah dan Manasik Haji SBSN Kab. Nabire',
    date: '2025-10-14', year: 2025, subject: 'Usulan Proyek Skema Surat Berharga Syariah Negara (SBSN)',
    origin: 'Bidang Bimas Islam & Bagian Perencanaan', dest: 'Bappenas & Ditjen Bimas Islam Kemenag RI',
    desc: 'Kajian kelayakan teknis, tata ruang, status tanah bersertifikat, dan desain bangunan gedung KUA prototype.',
    tags: 'sbsn, kua nabire, manasik haji, proposal, bappenas',
    sec: 'INTERNAL', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 27, docNo: 'LAP-EVAL/LAKIP-2025/PAPUA',
    title: 'Laporan Kinerja Instansi Pemerintah (LKjIP / LAKIP) Kanwil Kemenag Provinsi Papua TA 2025',
    date: '2026-02-01', year: 2025, subject: 'Laporan Akuntabilitas Kinerja Instansi Pemerintah',
    origin: 'Tim Penyusun LAKIP Kanwil', dest: 'Kementerian PAN-RB & Sekjen Kemenag RI',
    desc: 'Laporan pencapaian target kinerja jangka menengah RPJMN dan Renstra Kemenag 2020-2024 di wilayah Papua.',
    tags: 'lakip, lkjip, akuntabilitas, kemenpanrb, renstra',
    sec: 'PUBLIK', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 23, docNo: 'PRA-RKA/KL/TA-2027',
    title: 'Risalah Rapat Koordinasi Penyusunan Pra-RKA-K/L Tahun Anggaran 2027 Satker Kemenag se-Papua',
    date: '2026-02-22', year: 2026, subject: 'Penjaringan Usulan Prioritas Daerah TA 2027',
    origin: 'Bagian Perencanaan dan Anggaran', dest: 'Para Kakankemenag Kabupaten/Kota se-Papua',
    desc: 'Penetapan usulan prioritas revitalisasi KUA, peningkatan mutu madrasah swasta, dan beasiswa keagamaan.',
    tags: 'rakor, rka-kl, 2027, usulan daerah, perencanaan',
    sec: 'INTERNAL', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 26, docNo: 'BA-EVAL/TR1-2026/REN',
    title: 'Catatan Hasil Evaluasi Rencana Penarikan Dana (RPD) Halaman III DIPA Triwulan I TA 2026',
    date: '2026-02-26', year: 2026, subject: 'Sinkronisasi RPD dan Rencana Pengeluaran Riil',
    origin: 'Subbag Perencanaan dan Anggaran', dest: 'KPA dan PPK Kanwil',
    desc: 'Strategi menghindari deviasi halaman III DIPA agar nilai IKPA satker tetap berada pada zona hijau (>95).',
    tags: 'rpd, hal 3 dipa, ikpa, serapan, evaluasi',
    sec: 'INTERNAL', status: 'AKTIF', user: 6
  },

  // --- PEMBINAAN HAJI DAN PELAYANAN HAJI (unit_id: 5) ---
  {
    unitId: 5, catId: 28, docNo: 'RAH-HAJI/001/DATA-JEM/2026',
    title: 'Daftar Nominatif Jemaah Haji Reguler Provinsi Papua Berhak Lunas Musim Haji 1447 H / 2026 M',
    date: '2026-01-12', year: 2026, subject: 'Data Pribadi dan Nomor Porsi Jemaah Haji Kuota 1.076 Orang',
    origin: 'Ditjen Penyelenggaraan Haji dan Umrah (PHU) Kemenag RI', dest: 'Bidang Pembinaan Haji Kanwil Papua',
    desc: 'Daftar nama lengkap, NIK, nomor porsi, tanggal lahir, dan rekam medik awal jemaah haji kuota Papua. Dokumen bersifat RAHASIA.',
    tags: 'data jemaah, nomor porsi, pelunasan bpih, kuota papua, 2026',
    sec: 'RAHASIA', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 29, docNo: 'MANASIK-HAJI/JYP/04/2026',
    title: 'Laporan Pelaksanaan Bimbingan Manasik Haji Terpadu Tingkat Kabupaten/Kota se-Papua Tahun 2026',
    date: '2026-02-15', year: 2026, subject: 'Bimbingan Ibadah Haji Ramah Lansia dan Disabilitas',
    origin: 'Bidang Pembinaan Haji dan Pelayanan Haji', dest: 'Kakanwil Kemenag Provinsi Papua',
    desc: 'Dokumentasi dan evaluasi manasik haji 8 kali di tingkat KUA dan 2 kali di tingkat Kantor Kemenag Kabupaten/Kota.',
    tags: 'manasik, bimbingan, haji ramah lansia, ibadah, kuota',
    sec: 'INTERNAL', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 32, docNo: 'SK-PHD/019/GUB-PAPUA/2026',
    title: 'Surat Keputusan Gubernur Papua tentang Penetapan Petugas Haji Daerah (PHD) Musim Haji 1447 H',
    date: '2026-02-08', year: 2026, subject: 'Penetapan Petugas Pelayanan Umum, Ibadah, dan Kesehatan',
    origin: 'Pemerintah Provinsi Papua', dest: 'Kakanwil Kemenag Papua & Embarkasi Makassar',
    desc: 'Penetapan nama-nama tim pendamping haji daerah yang lolos seleksi CAT dan wawancara kompetensi.',
    tags: 'sk phd, petugas haji, kesehatan haji, pendamping kloter',
    sec: 'TERBATAS', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 30, docNo: 'PASPOR-VISA/088/HAJI/2026',
    title: 'Berita Acara Rekapitulasi Verifikasi Paspor dan Perekaman Bio Visa Jemaah Haji Kloter Papua',
    date: '2026-02-21', year: 2026, subject: 'Penyelesaian Dokumen Keimigrasian Jemaah',
    origin: 'Seksi Dokumen dan Pendaftaran Haji', dest: 'Kantor Imigrasi Kelas I Jayapura',
    desc: 'Validasi 1.076 paspor jemaah dengan masa berlaku minimal 6 bulan dan perekaman biometrik pada aplikasi Saudi Visa Bio.',
    tags: 'paspor, visa bio, imigrasi, kloter papua, biometrik',
    sec: 'TERBATAS', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 31, docNo: 'JADWAL-OPS/EMB-UPG/2026-01',
    title: 'Jadwal Rencana Perjalanan Haji (RPH) dan Alokasi Kloter Embarkasi Makassar (UPG) Kontingen Papua',
    date: '2026-01-20', year: 2026, subject: 'Jadwal Penerbangan Jayapura - Makassar - Jeddah / Madinah',
    origin: 'Panitia Penyelenggara Ibadah Haji (PPIH) Embarkasi Makassar', dest: 'Bidang Pembinaan Haji Kanwil Papua',
    desc: 'Penetapan kloter terbang 18 dan 19 UPG, jadwal masuk Asrama Haji Sudiang, serta manifes bagasi jemaah.',
    tags: 'rph, kloter, embarkasi makassar, upg, penerbangan haji',
    sec: 'INTERNAL', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 33, docNo: 'LAP-HAJI-AKHIR/PAPUA/1446H',
    title: 'Laporan Evaluasi Komprehensif Penyelenggaraan Ibadah Haji Provinsi Papua Musim Haji 1446 H / 2025 M',
    date: '2025-08-30', year: 2025, subject: 'Laporan Akuntabilitas Operasional Haji Tingkat Provinsi',
    origin: 'Bidang Pembinaan Haji dan Pelayanan Haji', dest: 'Menteri Agama RI & Gubernur Papua',
    desc: 'Laporan lengkap penyelenggaraan haji, pelayanan katering, transportasi, kepulangan jemaah tanpa insiden (zero accident).',
    tags: 'laporan haji, evaluasi, akuntabilitas, menteri agama, 2025',
    sec: 'PUBLIK', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 28, docNo: 'RAH-HAJI/002/LANSIA-PRIO/2026',
    title: 'Daftar Alokasi Kuota Prioritas Jemaah Haji Lansia Usia di Atas 85 Tahun Provinsi Papua 2026',
    date: '2026-01-25', year: 2026, subject: 'Verifikasi Kesehatan Jemaah Lansia Khusus',
    origin: 'Bidang Pembinaan Haji Kanwil Papua', dest: 'Dinas Kesehatan Provinsi Papua',
    desc: 'Data 54 jemaah haji lansia tertua di Papua yang mendapatkan prioritas kuota dan pendampingan istitha’ah kesehatan.',
    tags: 'kuota lansia, istithaah kesehatan, data rahasia, haji',
    sec: 'RAHASIA', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 29, docNo: 'MODUL-MANASIK/PAPUA/2026',
    title: 'Buku Panduan dan Modul Manasik Haji Kontekstual Berbahasa Sederhana untuk Masyarakat Papua',
    date: '2026-01-05', year: 2026, subject: 'Bahan Ajar Manasik Haji Terpadu Kanwil Kemenag Papua',
    origin: 'Tim Pembinaan Ibadah Haji Kanwil', dest: 'Para Pembimbing Ibadah Kemenag Kab/Kota',
    desc: 'Pedoman fikih haji praktis, fiqih taysir (kemudahan), dan simulasi tawaf/sai yang ramah pemula.',
    tags: 'modul, buku panduan, fikih haji, manasik praktis',
    sec: 'PUBLIK', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 32, docNo: 'ST-PETUGAS/HAJI/044/2026',
    title: 'Surat Tugas Fasilitasi Sosialisasi Istitha’ah Kesehatan Calon Jemaah Haji Kabupaten Jayapura dan Keerom',
    date: '2026-02-17', year: 2026, subject: 'Pemeriksaan Kesehatan Tahap II Jemaah',
    origin: 'Kepala Bidang Pembinaan Haji', dest: 'Tim Medis dan Staf Haji Kanwil',
    desc: 'Pendampingan medical check-up jemaah di RSUD Youwari dan Puskesmas Arso guna penetapan status istithaah.',
    tags: 'surat tugas, istithaah, rsud youwari, keerom, kesehatan',
    sec: 'INTERNAL', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 31, docNo: 'BA-ASRAMA/SUDIANG/2025-09',
    title: 'Berita Acara Koordinasi Penggunaan Fasilitas Transit Asrama Haji Antara Jayapura dan Embarkasi Makassar',
    date: '2025-05-18', year: 2025, subject: 'Pengaturan Transit Jemaah dari Wilayah Pedalaman Papua',
    origin: 'UPT Asrama Haji Makassar', dest: 'Kakanwil Kemenag Provinsi Papua',
    desc: 'Penyediaan kamar transit khusus bagi jemaah dari Kabupaten Mimika, Merauke, Nabire, dan Wamena.',
    tags: 'asrama haji, sudiang, transit, fasilitas, koordinasi',
    sec: 'INTERNAL', status: 'AKTIF', user: 7
  }
];

// Let's also add 10 more archives to reach 50+ total archives
const additionalArchives = [
  // More KEU
  {
    unitId: 1, catId: 2, docNo: 'SPJ/BIA/015/KEU/2026',
    title: 'SPJ Belanja Pemeliharaan Gedung dan Halaman Kantor Kanwil Kemenag Papua Bulan Januari 2026',
    date: '2026-01-28', year: 2026, subject: 'Pemeliharaan Gedung Kantor',
    origin: 'Subbag Umum & BMN', dest: 'PPK Kanwil Kemenag Papua',
    desc: 'Pekerjaan perbaikan atap ruang rapat, instalasi listrik, dan perawatan taman.',
    tags: 'spj, pemeliharaan, gedung kantor, listrik', sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  {
    unitId: 1, catId: 6, docNo: 'KWT/046/KEU/2026',
    title: 'Kwitansi Pembayaran Langganan Bandwidth Internet Dedicated 200 Mbps Kanwil Kemenag',
    date: '2026-02-05', year: 2026, subject: 'Pembayaran Internet Telkom Indonesia',
    origin: 'PT Telkom Indonesia (Persero) Tbk', dest: 'Bendahara Pengeluaran',
    desc: 'Tagihan internet broadband fiber optik untuk operasional SI-ARSIP dan layanan publik.',
    tags: 'kwitansi, telkom, internet, bandwidth', sec: 'INTERNAL', status: 'AKTIF', user: 3
  },
  // More PEG
  {
    unitId: 2, catId: 9, docNo: 'SK-PELATIKAN/005/KW-PAPUA/2026',
    title: 'SK Pengangkatan Pertama Kali dalam Jabatan Fungsional Arsiparis Kanwil Kemenag',
    date: '2026-01-10', year: 2026, subject: 'Pelantikan Pejabat Fungsional Kearsipan',
    origin: 'Kakanwil Kemenag Papua', dest: 'Faisal Akbar, S.Kom',
    desc: 'Keputusan pengangkatan ke dalam jabatan fungsional arsiparis dengan angka kredit awal.',
    tags: 'sk, arsiparis, jabatan fungsional, pelantikan', sec: 'TERBATAS', status: 'AKTIF', user: 4
  },
  {
    unitId: 2, catId: 10, docNo: 'ST-089/Kw.26.1/KP.01.2/02/2026',
    title: 'Surat Tugas Mengikuti Rapat Koordinasi Nasional Kepegawaian Kemenag RI di Jakarta',
    date: '2026-02-20', year: 2026, subject: 'Rakornas Kepegawaian Tahun 2026',
    origin: 'Kakanwil Kemenag Papua', dest: 'Yohanes Rumbewas, S.Sos, M.AP',
    desc: 'Partisipasi dalam evaluasi manajemen talenta ASN kementerian agama se-Indonesia.',
    tags: 'surat tugas, rakornas, jakarta, manajemen talenta', sec: 'INTERNAL', status: 'AKTIF', user: 4
  },
  // More UMH
  {
    unitId: 3, catId: 19, docNo: 'UND-043/Kw.26.1/BA.01.1/02/2026',
    title: 'Undangan Coffee Morning dan Ramah Tamah Pimpinan Kanwil Bersama Insan Pers Papua',
    date: '2026-02-18', year: 2026, subject: 'Silaturahmi Media Massa Bumi Cenderawasih',
    origin: 'Subbag Humas Kanwil', dest: 'Pimpinan Redaksi Media Lokal dan Nasional',
    desc: 'Diskusi informal mengenai publikasi program keagamaan dan toleransi umat beragama di Papua.',
    tags: 'undangan, pers, wartawan, media massa, humas', sec: 'PUBLIK', status: 'AKTIF', user: 5
  },
  {
    unitId: 3, catId: 18, docNo: 'B-215/Kw.26.1/HM.00/02/2026',
    title: 'Surat Keluar: Permohonan Pengamanan VIP Kedatangan Menteri Agama RI di Bandara Sentani',
    date: '2026-02-24', year: 2026, subject: 'Protokoler Kunjungan Kerja Menteri Agama',
    origin: 'Kakanwil Kemenag Papua', dest: 'Kapolda Papua & Komandan Lanud Silas Papare',
    desc: 'Koordinasi pengamanan VIP dan jalur konvoi rombongan kerja kementerian agama.',
    tags: 'surat keluar, polda papua, lanud sentani, protokol vip, menteri agama', sec: 'TERBATAS', status: 'AKTIF', user: 2
  },
  // More REN
  {
    unitId: 4, catId: 24, docNo: 'DIPA-REKAP/SATKER-DAERAH/2026',
    title: 'Buku Rekapitulasi Alokasi Pagu DIPA 29 Kantor Kemenag Kabupaten/Kota se-Provinsi Papua 2026',
    date: '2026-01-12', year: 2026, subject: 'Alokasi Pagu Anggaran Daerah se-Papua Total Rp 512 Milyar',
    origin: 'Bagian Perencanaan dan Anggaran', dest: 'Kakanwil & Inspektorat Jenderal Kemenag',
    desc: 'Kompilasi dokumen pagu seluruh satker kemenag kab/kota di tanah Papua untuk memudahkan pengawasan.',
    tags: 'rekapitulasi dipa, satker daerah, pagu kabupaten, 2026', sec: 'INTERNAL', status: 'AKTIF', user: 6
  },
  {
    unitId: 4, catId: 27, docNo: 'LAP-MONEV/SBSN-2025/FINAL',
    title: 'Laporan Akhir Monitoring dan Evaluasi Proyek SBSN Pembangunan Gedung PLHUT Kota Jayapura',
    date: '2025-12-22', year: 2025, subject: 'Serah Terima Gedung Pelayanan Haji Terpadu SBSN',
    origin: 'Tim Pengelola SBSN Kanwil', dest: 'Direktorat Jenderal PHU Kemenag RI',
    desc: 'Gedung PLHUT selesai 100% tepat waktu dengan realisasi fisik dan keuangan prima.',
    tags: 'monev, sbsn, plhut, kota jayapura, serah terima', sec: 'PUBLIK', status: 'AKTIF', user: 6
  },
  // More HAJI
  {
    unitId: 5, catId: 29, docNo: 'SILABUS-MANASIK/2026/ED-4',
    title: 'Silabus Standar Pelaksanaan Bimbingan Manasik Haji Berkelanjutan se-Tanah Papua 2026',
    date: '2026-01-08', year: 2026, subject: 'Kurikulum Manasik Mandiri Tingkat Kecamatan',
    origin: 'Bidang Pembinaan Haji', dest: 'Kepala Kantor Urusan Agama (KUA) se-Papua',
    desc: 'Panduan kurikulum manasik meliputi fikih thaharah, simulasi thawaf ifadhah, sai, dan jamarat.',
    tags: 'silabus, kurikulum manasik, kua, pembinaan', sec: 'PUBLIK', status: 'AKTIF', user: 7
  },
  {
    unitId: 5, catId: 33, docNo: 'SURVEY-KEPUASAN/HAJI-2025',
    title: 'Hasil Survei Indeks Kepuasan Jemaah Haji (IKHJ) Provinsi Papua Musim Haji 1446 H (Skor 92.15)',
    date: '2025-09-10', year: 2025, subject: 'Survei Kepuasan Pelayanan Haji Kategori Sangat Memuaskan',
    origin: 'Tim Independen Penjaminan Mutu Layanan', dest: 'Kakanwil Kemenag Papua & BPS Papua',
    desc: 'Hasil kuisioner 850 responden jemaah Papua mengenai layanan pendaftaran, manasik, dan penerbangan.',
    tags: 'survei, ikhj, kepuasan jemaah, bps, sangat memuaskan', sec: 'PUBLIK', status: 'AKTIF', user: 7
  }
];

const allArchivesToInsert = [...rawArchives, ...additionalArchives];

// Prepare sequential counter per unit
const unitCodeMap = {
  1: 'KEU',
  2: 'PEG',
  3: 'UMH',
  4: 'REN',
  5: 'HAJI'
};
const unitCounters = { KEU: 1, PEG: 1, UMH: 1, REN: 1, HAJI: 1 };

const insertArchive = db.prepare(`
  INSERT INTO archives (
    archive_code, unit_id, category_id, document_number, document_title,
    document_date, year, subject, origin, destination, description,
    keywords, security_level, status, file_path, file_name, file_size, file_type,
    created_by, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, datetime('now', 'localtime'), datetime('now', 'localtime')
  )
`);

for (const item of allArchivesToInsert) {
  const uCode = unitCodeMap[item.unitId] || 'GEN';
  const seq = unitCounters[uCode]++;
  const padSeq = String(seq).padStart(5, '0');
  const archiveCode = `ARS/${uCode}/${item.year}/${padSeq}`;

  const cleanFileName = `${archiveCode.replace(/\//g, '_')}.pdf`;
  const fileMeta = createSampleDocFile(
    cleanFileName,
    item.title,
    item.docNo,
    units.find(u => u.code === uCode)?.name || 'Kemenag Papua',
    item.date
  );

  insertArchive.run(
    archiveCode,
    item.unitId,
    item.catId,
    item.docNo,
    item.title,
    item.date,
    item.year,
    item.subject,
    item.origin,
    item.dest,
    item.desc,
    item.tags,
    item.sec,
    item.status,
    fileMeta.filePath,
    fileMeta.fileName,
    fileMeta.fileSize,
    fileMeta.fileType,
    item.user
  );
}

console.log('Seeding initial Audit Logs...');
const insertAudit = db.prepare(`
  INSERT INTO audit_logs (user_id, user_name, action, module, record_id, description, ip_address, user_agent, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const initialLogs = [
  { uId: 1, uName: 'Administrator Utama', action: 'SYSTEM_INIT', mod: 'SYSTEM', rec: 'SYSTEM', desc: 'Inisialisasi sistem database SI-ARSIP Kanwil Kemenag Papua', ip: '127.0.0.1', time: '2026-02-01 08:00:00' },
  { uId: 1, uName: 'Administrator Utama', action: 'CREATE_UNIT', mod: 'UNIT', rec: 'KEU, PEG, UMH, REN, HAJI', desc: 'Pembuatan 5 Unit Kerja Master awal Kanwil', ip: '127.0.0.1', time: '2026-02-01 08:15:00' },
  { uId: 3, uName: 'Kornelia Wanggai, S.E.', action: 'LOGIN', mod: 'AUTH', rec: null, desc: 'Login berhasil ke SI-ARSIP sebagai Admin Keuangan', ip: '192.168.1.45', time: '2026-02-18 08:30:00' },
  { uId: 3, uName: 'Kornelia Wanggai, S.E.', action: 'CREATE_ARCHIVE', mod: 'ARCHIVE', rec: 'ARS/KEU/2026/00001', desc: 'Mengunggah arsip: SPJ Belanja Operasional Perkantoran Bulan Januari 2026', ip: '192.168.1.45', time: '2026-02-18 09:12:00' },
  { uId: 4, uName: 'Markus Kogoya, S.IP', action: 'CREATE_ARCHIVE', mod: 'ARCHIVE', rec: 'ARS/PEG/2026/00001', desc: 'Mengunggah arsip: SK Penetapan Pegawai Teladan dan Agen Perubahan Zona Integritas', ip: '192.168.1.62', time: '2026-02-19 10:04:00' },
  { uId: 7, uName: 'Ust. Ridwan Mansur, S.Pd.I', action: 'CREATE_ARCHIVE', mod: 'ARCHIVE', rec: 'ARS/HAJI/2026/00001', desc: 'Mengunggah dokumen RAHASIA: Daftar Nominatif Jemaah Haji Reguler Papua 2026', ip: '192.168.1.77', time: '2026-02-20 11:25:00' },
  { uId: 8, uName: 'Pdt. Klemens Awi, S.Th., M.Si', action: 'LOGIN', mod: 'AUTH', rec: null, desc: 'Kakanwil login ke Executive Monitoring Dashboard', ip: '192.168.1.10', time: '2026-02-22 14:00:00' },
  { uId: 8, uName: 'Pdt. Klemens Awi, S.Th., M.Si', action: 'PREVIEW_ARCHIVE', mod: 'ARCHIVE', rec: 'ARS/HAJI/2026/00002', desc: 'Melihat pratinjau Laporan Pelaksanaan Bimbingan Manasik Haji Terpadu', ip: '192.168.1.10', time: '2026-02-22 14:15:00' }
];

for (const l of initialLogs) {
  insertAudit.run(l.uId, l.uName, l.action, l.mod, l.rec, l.desc, l.ip, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', l.time);
}

// Favorites for demo user (kakanwil and admin.arsip)
db.exec(`
  INSERT INTO favorites (user_id, archive_id) VALUES (1, 1), (1, 2), (8, 1), (8, 11), (8, 21);
`);

console.log('Database seeding successfully finished!');
console.log(`- Units: ${units.length}`);
console.log(`- Roles: ${roles.length}`);
console.log(`- Users: ${users.length}`);
console.log(`- Categories: ${categories.length}`);
console.log(`- Archives: ${allArchivesToInsert.length}`);
console.log(`- Audit Logs: ${initialLogs.length}`);
