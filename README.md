# SI-ARSIP PAPUA • Kemenhaj / Kanwil Kemenag
### Sistem Informasi Arsip dan Persuratan Digital Terpadu
**Kantor Wilayah Kementerian Agama / Kementerian Haji dan Umrah Provinsi Papua**

SI-ARSIP adalah platform digital modern tingkat instansi (*enterprise-grade*) untuk pengelolaan **arsip digital resmi, registrasi persuratan masuk dan keluar, penomoran agenda otomatis, lembar disposisi pimpinan, serta audit trail kepatuhan**.

Aplikasi ini mengadopsi bahasa desain resmi **Kemenhaj RI (haji.go.id)** dengan palet *Hajj Royal Gold* (`#c9a961`), *Ka'bah Charcoal Obsidian* (`#1A1410`), dan *Warm Ivory* (`#FAF9F5`).

---

## 🌟 Fitur Utama

1. **E-Arsip Digital Terpadu 5 Unit Kerja**:
   - Bagian Keuangan (KEU)
   - Bagian Kepegawaian (PEG)
   - Bagian Umum dan Humas (UMH)
   - Bagian Perencanaan dan Anggaran (REN)
   - Bidang Pembinaan Haji dan Pelayanan Haji (HAJI)
2. **Administrasi Surat Masuk & Scan PDF**:
   - Pencatatan manual metadata fisik: Nomor Surat Asli, Tanggal Surat, Tanggal Diterima, Asal Instansi Pengirim, Perihal, Sifat Surat, Ringkasan, dan Catatan.
   - **Nomor Agenda Otomatis**: Format standar `SM/2026/00001` yang dihasilkan berurutan untuk mencegah nomor ganda.
   - Unggah berkas scan PDF langsung dengan drag-and-drop.
3. **Lembar Disposisi Kakanwil**:
   - Lembar disposisi resmi ber-Kop Kantor Wilayah Kementerian Agama Provinsi Papua yang siap dicetak (*print-ready*).
4. **Jembatan 1-Klik ke E-Arsip (*Zero Re-Upload*)**:
   - Memindahkan berkas surat masuk yang sudah selesai diproses ke repositori permanen E-Arsip tanpa perlu upload ulang.
5. **Buku Register Agenda Digital**:
   - Tab navigasi Surat Masuk dan Surat Keluar lengkap dengan filter dan fitur ekspor.
6. **Keamanan & Otorisasi RBAC 4 Tingkat**:
   - Keamanan dokumen bertingkat: `PUBLIK`, `INTERNAL`, `TERBATAS`, dan `RAHASIA`.
   - Role pengguna: `SUPER_ADMIN`, `ADMIN_ARSIP`, `ADMIN_UNIT`, `PIMPINAN`, dan `PEGAWAI`.
   - Enkripsi password menggunakan **PBKDF2 100.000 iterasi**.
7. **Audit Trail Lengkap**:
   - Setiap aktivitas registrasi, pratinjau, pengunduhan, pengeditan, dan penghapusan berkas tercatat rapi ke tabel audit trail.

---

## 🚀 Persyaratan & Menjalankan di Lokal (Development / Production)

### Prasyarat
* **Node.js**: Versi **22.5.0+** (atau Node 24 LTS) karena menggunakan modul native `node:sqlite`.
* **NPM**: Versi 10+.

### Langkah Menjalankan:
```bash
# 1. Masuk ke direktori proyek
cd SiArsip_Kemenhaj

# 2. Install dependensi
npm install

# 3. Seed data awal (Unit, Kategori, Pengguna Demo, Arsip, Surat Masuk)
npm run seed

# 4. Jalankan server lokal (berjalan di Port 3050 agar tidak bentrok dengan SIAP HAJI di Port 3000)
npm run dev
# atau untuk mode production:
npm run build
npm start
```

Buka browser ke alamat: **http://localhost:3050**

### Akun Demo:
| Username | Password | Peran (Role) | Hak Akses |
| :--- | :--- | :--- | :--- |
| `superadmin` | `admin123` | Super Administrator | Akses Penuh Seluruh Sistem & Master Data |
| `admin.arsip` | `arsip123` | Admin E-Arsip | Pengelola Arsip Pusat & Agenda Persuratan |
| `admin.keuangan`| `keu123` | Admin Unit Keuangan | Pengelola Arsip Khusus Bagian Keuangan |
| `admin.haji` | `haji123` | Admin Bidang Haji | Pengelola Arsip Dokumen Haji & Paspor |
| `kakanwil` | `kakanwil123`| Pimpinan | Executive Monitoring & Lembar Disposisi |
| `pegawai.keu` | `pegawai123` | Pegawai | Pencarian & Pratinjau Dokumen |

---

## 📦 Panduan Publikasi ke GitHub & Vercel

### A. Repositori GitHub Resmi
Repositori proyek ini telah dipublikasikan dan aktif di:
👉 **[https://github.com/ekobot2025-cyber/siarsip-kemenhaj](https://github.com/ekobot2025-cyber/siarsip-kemenhaj)**

Untuk sinkronisasi atau pembaruan kode selanjutnya:
```bash
git add .
git commit -m "Update fitur atau perbaikan"
git push origin main
```

---

### B. Panduan Deployment 1-Klik ke Vercel

Karena aplikasi ini telah dikonfigurasi untuk **Node.js 22.x** dan mendukung Cloud Database **Turso (LibSQL Serverless SQLite)**, Anda dapat mendeploy ke Vercel dengan langkah mudah:

1. **Buka Vercel Dashboard**:
   - Masuk ke akun Vercel Anda di [https://vercel.com/new](https://vercel.com/new).
2. **Import Repository**:
   - Pilih akun GitHub `ekobot2025-cyber`.
   - Pilih repository **`siarsip-kemenhaj`** lalu klik **Import**.
3. **Konfigurasi Environment Variables (Opsional untuk Turso Cloud DB)**:
   - Di bagian **Environment Variables**, tambahkan:
     * `TURSO_DATABASE_URL` = `libsql://siarsip-db-ekobot2025-cyber.aws-ap-northeast-1.turso.io`
     * `TURSO_AUTH_TOKEN` = `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` *(lihat di `.env.example`)*
4. **Deploy**:
   - Klik tombol **Deploy**.
   - Tunggu proses build selesai (~1-2 menit). Aplikasi Anda akan langsung aktif dengan URL resmi Vercel (contoh: `https://siarsip-kemenhaj.vercel.app`)!

---

### C. Migrasi & Sinkronisasi Database Turso Cloud

Database Turso Cloud telah diinisialisasi dan diisi seluruh data awal (14 tabel, 5 unit kerja, 10 akun pengguna, 33 kategori arsip, 62 berkas dokumen, dan 5 surat masuk).

Untuk menjalankan migrasi ulang atau pengujian koneksi ke Turso:
```bash
# Uji koneksi ke Turso Cloud
npm run test:turso

# Migrasi ulang data lokal ke Turso Cloud
npm run migrate:turso
```

---

## 🏛️ Lisensi & Hak Cipta
Hak Cipta © 2026 Kantor Wilayah Kementerian Agama / Kementerian Haji dan Umrah Provinsi Papua.
