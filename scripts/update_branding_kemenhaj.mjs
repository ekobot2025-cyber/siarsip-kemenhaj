import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@libsql/client';

console.log('=== UPDATE BRANDING KEMENTERIAN HAJI DAN UMRAH & BERSIHKAN DUMMY NAMA/NIP ===\n');

// 1. Update Local SQLite Database
const db = new DatabaseSync('data/siarsip.db');

console.log('1. Mengupdate SQLite Lokal (data/siarsip.db)...');

// Update Users: nama jadi nama peran/jabatan resmi, NIP dihapus (null), email ke @haji.go.id
const userUpdates = [
  { username: 'superadmin', name: 'Super Administrator', job: 'Pranata Komputer', email: 'superadmin@haji.go.id' },
  { username: 'admin.arsip', name: 'Admin E-Arsip', job: 'Pengelola Arsip Pusat', email: 'admin.arsip@haji.go.id' },
  { username: 'admin.keuangan', name: 'Admin Keuangan', job: 'Pengelola Keuangan', email: 'admin.keuangan@haji.go.id' },
  { username: 'admin.kepegawaian', name: 'Admin Kepegawaian', job: 'Pengelola Kepegawaian', email: 'admin.kepegawaian@haji.go.id' },
  { username: 'admin.umum', name: 'Admin Umum & Humas', job: 'Pengadministrasi Persuratan', email: 'admin.umum@haji.go.id' },
  { username: 'admin.perencanaan', name: 'Admin Perencanaan', job: 'Pengelola Perencanaan', email: 'admin.perencanaan@haji.go.id' },
  { username: 'admin.haji', name: 'Admin Bidang Haji', job: 'Pengelola Pelayanan Haji', email: 'admin.haji@haji.go.id' },
  { username: 'kakanwil', name: 'Kepala Kantor Wilayah', job: 'Kepala Kantor Wilayah Provinsi Papua', email: 'kakanwil@haji.go.id' },
  { username: 'kabag.tu', name: 'Kepala Bagian Tata Usaha', job: 'Kepala Bagian Tata Usaha', email: 'kabag.tu@haji.go.id' },
  { username: 'pegawai.keu', name: 'Pegawai Keuangan', job: 'Verifikator Keuangan', email: 'pegawai.keu@haji.go.id' },
];

for (const u of userUpdates) {
  db.prepare(`
    UPDATE users 
    SET full_name = ?, nip = NULL, job_title = ?, email = ?
    WHERE username = ?
  `).run(u.name, u.job, u.email, u.username);
}
console.log('   ✓ Users berhasil diupdate (nama resmi peran, NIP null, email @haji.go.id)');

// Update Units: pimpinan jadi nama jabatan resmi tanpa nama orang dummy dan tanpa NIP dummy
const unitUpdates = [
  { code: 'KEU', leader: 'Kepala Bagian Keuangan' },
  { code: 'PEG', leader: 'Kepala Bagian Kepegawaian' },
  { code: 'UMH', leader: 'Kepala Bagian Umum dan Humas' },
  { code: 'REN', leader: 'Kepala Bagian Perencanaan dan Anggaran' },
  { code: 'HAJI', leader: 'Kepala Bidang Pembinaan Haji dan Pelayanan Haji' },
];

for (const un of unitUpdates) {
  db.prepare(`
    UPDATE units 
    SET leader_name = ?, leader_nip = NULL
    WHERE code = ?
  `).run(un.leader, un.code);
}
console.log('   ✓ Units berhasil diupdate (pimpinan jabatan resmi, NIP null)');

// Update Categories
db.exec(`
  UPDATE archive_categories SET description = 'Laporan bulanan/semester/tahunan keuangan Kementerian Haji dan Umrah' WHERE code = 'CAT-KEU-07';
  UPDATE archive_categories SET description = 'Penilaian kinerja periodik ASN Kementerian Haji dan Umrah Papua' WHERE code = 'CAT-PEG-07';
  UPDATE archive_categories SET description = 'Arsip tembusan surat resmi yang diterbitkan Kementerian Haji dan Umrah Kantor Wilayah Papua' WHERE code = 'CAT-UMH-02';
`);
console.log('   ✓ Archive Categories berhasil diupdate');

// 2. Update Turso Cloud Database
console.log('\n2. Mengupdate Turso Cloud Database...');
const tursoUrl = 'libsql://siarsip-db-ekobot2025-cyber.aws-ap-northeast-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA2MDk3OTUsImlkIjoiMDFhMGU4YTgtYTcwMS03OTJkLWIzNzMtZjNlMmQxNWNlZTk2Iiwia2lkIjoiQmRLS1p5M3BaWXVNX0sxaDZLX1RFaGprNEd0ZjBpTlZMcTJNMlc2V1VNSSIsInJpZCI6ImZlMDIwMDQ0LWYwMDYtNGFjYy05ODZhLTA2ZGFmZjkwYjcxZSJ9.tayCRPY2yjSJfqV3Wfww67ZczCaXlDT8rAF5-nphbHER0ipzvmMI8YZ7J1jx7WPTx6jyE5x5dbotJKwuUiHWDg';

const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

for (const u of userUpdates) {
  await client.execute({
    sql: `UPDATE users SET full_name = ?, nip = NULL, job_title = ?, email = ? WHERE username = ?`,
    args: [u.name, u.job, u.email, u.username]
  });
}

for (const un of unitUpdates) {
  await client.execute({
    sql: `UPDATE units SET leader_name = ?, leader_nip = NULL WHERE code = ?`,
    args: [un.leader, un.code]
  });
}

await client.execute(`UPDATE archive_categories SET description = 'Laporan bulanan/semester/tahunan keuangan Kementerian Haji dan Umrah' WHERE code = 'CAT-KEU-07'`);
await client.execute(`UPDATE archive_categories SET description = 'Penilaian kinerja periodik ASN Kementerian Haji dan Umrah Papua' WHERE code = 'CAT-PEG-07'`);
await client.execute(`UPDATE archive_categories SET description = 'Arsip tembusan surat resmi yang diterbitkan Kementerian Haji dan Umrah Kantor Wilayah Papua' WHERE code = 'CAT-UMH-02'`);

console.log('   ✓ Turso Cloud Database berhasil diupdate sepenuhnya!\n');
console.log('=== SELESAI SINKRONISASI DATABASE ===');
