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

### A. Publish ke GitHub

1. Inisialisasi repository git lokal:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit SI-ARSIP Kemenhaj Papua"
   ```
2. Buat repository baru di **[GitHub](https://github.com/new)** (misalnya: `siarsip-kemenhaj`).
3. Hubungkan dan push kode ke GitHub:
   ```bash
   git remote add origin https://github.com/USERNAME-ANDA/siarsip-kemenhaj.git
   git branch -M main
   git push -u origin main
   ```

---

### B. Pertimbangan Deployment ke Vercel

> [!IMPORTANT]
> **Karakteristik Arsitektur Vercel (Serverless):**
> Vercel adalah platform *serverless* di mana fungsi backend berjalan tanpa disk penyimpanan fisik yang persisten (*stateless & read-only filesystem*).

Jika Anda ingin mendeploy ke **Vercel**:
1. **Untuk Mode Demo / Portfolio / Showcase**:
   * Dapat langsung dideploy dengan menyertakan file database `data/siarsip.db` yang sudah di-seed. Pengunjung dapat login, membaca dokumen, melihat dashboard, dan mengunduh berkas.
   * Catatan: Data baru yang diinput via formulir tidak akan tersimpan permanen saat serverless function Vercel di-restart (*cold start*).
   * Pada pengaturan Vercel (**Project Settings &rarr; General &rarr; Node.js Version**), pastikan memilih **Node.js 22.x**.

2. **Untuk Mode Produksi Penuh (Full Persistence) di Vercel**:
   * **Database**: Hubungkan ke Cloud Database seperti **Turso (LibSQL Serverless SQLite)** atau **Supabase / Neon (Serverless PostgreSQL)**.
   * **Penyimpanan Berkas Scan PDF**: Gunakan **Vercel Blob Storage** atau **Supabase Storage / AWS S3** untuk menyimpan file scan PDF.

3. **Alternatif Terbaik untuk Instansi Pemerintah (VPS Mandiri / Docker / Pusat Data Nasional)**:
   * Karena aplikasi ini mengelola persuratan kedinasan dan arsip berklasifikasi rahasia, opsi deployment yang paling direkomendasikan adalah **VPS Kanwil / Cloud Server Internal / Docker**:
   * Seluruh kode dan penyimpanan lokal (`storage/documents/` serta SQLite) berjalan 100% persisten, aman, tanpa biaya langganan cloud database pihak ketiga, dan kedaulatan data arsip instansi tetap terjaga.

---

## 🏛️ Lisensi & Hak Cipta
Hak Cipta © 2026 Kantor Wilayah Kementerian Agama / Kementerian Haji dan Umrah Provinsi Papua.
