# Script to generate SI-ARSIP User Manual Word Document (.docx)
param(
    [string]$ImagePath = "d:\8 PROJECT\2026\DEV\KEMENHAJ\SiArsip_Kemenhaj\flowchart_aplikasi_siarsip.png",
    [string]$OutputPath = "d:\8 PROJECT\2026\DEV\KEMENHAJ\SiArsip_Kemenhaj\PANDUAN_PENGGUNAAN_APLIKASI_SIARSIP.docx"
)

try {
    Write-Host "Menginisialisasi Microsoft Word COM..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    $doc = $word.Documents.Add()

    # Set Margins (2.5 cm / 71 pt)
    $doc.PageSetup.TopMargin = 71
    $doc.PageSetup.BottomMargin = 71
    $doc.PageSetup.LeftMargin = 71
    $doc.PageSetup.RightMargin = 71

    # Warna Bertema Kemenhaj & Elegan
    $COLOR_GOLD_DARK = 1380937   # Dark Gold / Brownish Gold
    $COLOR_NAVY      = 8388608   # Deep Blue / Navy
    $COLOR_DARK      = 2105376   # Near black
    $COLOR_GRAY      = 6579300   # Muted gray
    $COLOR_BORDER    = 11184810

    # Helper: Paragraf
    function Add-P {
        param(
            [string]$Text,
            [int]$FontSize = 10.5,
            [bool]$Bold = $false,
            [bool]$Italic = $false,
            [int]$Alignment = 3, # 0=Left, 1=Center, 2=Right, 3=Justify
            [int]$SpaceBefore = 0,
            [int]$SpaceAfter = 5,
            [int]$Color = 0
        )
        $p = $doc.Paragraphs.Add()
        $r = $p.Range
        $r.Text = $Text
        $r.Font.Name = "Arial"
        $r.Font.Size = $FontSize
        $r.Font.Bold = [int]$Bold
        $r.Font.Italic = [int]$Italic
        if ($Color -ne 0) { $r.Font.Color = $Color }
        $p.Alignment = $Alignment
        $p.SpaceBefore = $SpaceBefore
        $p.SpaceAfter = $SpaceAfter
        $r.InsertParagraphAfter()
    }

    # Helper: Judul Bab (Heading 1)
    function Add-H1 {
        param([string]$Text)
        $p = $doc.Paragraphs.Add()
        $r = $p.Range
        $r.Text = $Text
        $r.Font.Name = "Arial"
        $r.Font.Size = 13.5
        $r.Font.Bold = 1
        $r.Font.Color = $COLOR_NAVY
        $p.SpaceBefore = 14
        $p.SpaceAfter = 6
        $p.Alignment = 0
        $r.InsertParagraphAfter()
    }

    # Helper: Subjudul (Heading 2)
    function Add-H2 {
        param([string]$Text)
        $p = $doc.Paragraphs.Add()
        $r = $p.Range
        $r.Text = $Text
        $r.Font.Name = "Arial"
        $r.Font.Size = 11.5
        $r.Font.Bold = 1
        $r.Font.Color = 3289650
        $p.SpaceBefore = 10
        $p.SpaceAfter = 4
        $p.Alignment = 0
        $r.InsertParagraphAfter()
    }

    # Helper: Bullet Item
    function Add-Bullet {
        param(
            [string]$BoldPrefix = "",
            [string]$Text = ""
        )
        $p = $doc.Paragraphs.Add()
        $r = $p.Range
        $bullet = "$([char]0x2022) "
        if ($BoldPrefix -ne "") {
            $r.Text = "$bullet$BoldPrefix $Text"
        } else {
            $r.Text = "$bullet$Text"
        }
        $r.Font.Name = "Arial"
        $r.Font.Size = 10
        $p.LeftIndent = 18
        $p.FirstLineIndent = -10
        $p.SpaceBefore = 0
        $p.SpaceAfter = 3
        $p.Alignment = 3
        $r.InsertParagraphAfter()
        $p.LeftIndent = 0
        $p.FirstLineIndent = 0
    }

    # Helper: Callout Box
    function Add-Box {
        param(
            [string]$Title,
            [string]$Body,
            [int]$BgColor = 16119285
        )
        $bp = $doc.Paragraphs.Add()
        $tbl = $doc.Tables.Add($bp.Range, 1, 1)
        $tbl.Borders.Enable = 1
        $tbl.Borders.OutsideColor = $COLOR_NAVY
        $tbl.Columns.Item(1).Width = 465
        $c = $tbl.Cell(1, 1)
        $c.Shading.BackgroundPatternColor = $BgColor
        $c.TopPadding = 5
        $c.BottomPadding = 5
        $c.LeftPadding = 8
        $c.RightPadding = 8
        
        $cr = $c.Range
        $cr.Text = "$Title`n$Body"
        $cr.Font.Name = "Arial"
        $cr.Font.Size = 9.5
        $cr.ParagraphFormat.Alignment = 3
        $bp.Range.InsertParagraphAfter()
    }

    # ================= COVER / HEADER =================
    Add-P -Text "BUKU PANDUAN PENGGUNAAN APLIKASI (USER MANUAL)" -FontSize 15 -Bold $true -Alignment 1 -SpaceAfter 4 -Color $COLOR_NAVY
    Add-P -Text "SI-ARSIP PAPUA - KEMENHAJ / KANWIL KEMENAG" -FontSize 13 -Bold $true -Alignment 1 -SpaceAfter 3 -Color 16711680
    Add-P -Text "SISTEM INFORMASI ARSIP DAN PERSURATAN DIGITAL TERPADU" -FontSize 11 -Bold $true -Alignment 1 -SpaceAfter 4 -Color 5592405
    Add-P -Text "Alamat Tautan Resmi: https://siarsip-kemenhaj.vercel.app" -FontSize 9.5 -Italic $true -Alignment 1 -SpaceAfter 12 -Color $COLOR_GRAY
    Add-P -Text "________________________________________________________________________________" -FontSize 8.5 -Alignment 1 -SpaceAfter 14 -Color 10526880

    # ================= BAB I =================
    Add-H1 -Text "BAB I. PENDAHULUAN & PROFIL SISTEM SI-ARSIP"
    Add-P -Text "SI-ARSIP (Sistem Informasi Arsip dan Persuratan Digital Terpadu) adalah platform tata kelola naskah dinas dan arsip elektronik resmi yang dirancang khusus untuk memfasilitasi administrasi persuratan dan pengarsipan di lingkungan Kantor Wilayah Kementerian Agama / Kementerian Haji dan Umrah Provinsi Papua."
    Add-P -Text "Sistem ini mendigitalkan seluruh siklus pengelolaan surat dan arsip fisik menjadi arsip digital terstruktur guna mewujudkan tata kelola persuratan yang tertib, cepat, aman, bebas risiko dokumen hilang, serta ramah lingkungan (paperless)."

    Add-H2 -Text "1.1 Cakupan 5 Unit Kerja Operasional"
    Add-P -Text "SI-ARSIP mengorganisir dokumen arsip ke dalam 5 (lima) repositori unit kerja utama:"
    Add-Bullet -BoldPart "1. Bagian Keuangan (Kode: KEU):" -Text "Pengelolaan arsip SPJ, SPM, DIPA, kwitansi, LPJ, dan berkas pertanggungjawaban anggaran."
    Add-Bullet -BoldPart "2. Bagian Kepegawaian (Kode: PEG):" -Text "Pengelolaan arsip SK kenaikan pangkat, berkas pegawai, cuti, penilaian kinerja, dan data ASN."
    Add-Bullet -BoldPart "3. Bagian Umum dan Humas (Kode: UMH):" -Text "Pengelolaan surat umum, naskah dinas keluar/masuk kanwil, dokumentasi rilis pers, dan kerumahtanggaan."
    Add-Bullet -BoldPart "4. Bagian Perencanaan dan Anggaran (Kode: REN):" -Text "Pengelolaan dokumen RKA-K/L, usulan program, Renstra, dan laporan capaian kinerja tahunan."
    Add-Bullet -BoldPart "5. Bidang Pembinaan Haji dan Umrah (Kode: HAJI):" -Text "Pengelolaan dokumen pendaftaran haji, arsip paspor/visa jamaah, data kuota, dan manifes kloter."

    Add-H2 -Text "1.2 Tingkat Hak Akses Pengguna (Role-Based Access Control)"
    Add-P -Text "Sistem dilengkapi dengan pembagian wewenang yang ketat untuk menjamin keamanan informasi:"

    # Table Role: 6 rows, 3 cols
    $tRolePara = $doc.Paragraphs.Add()
    $rTable = $doc.Tables.Add($tRolePara.Range, 6, 3)
    $rTable.Borders.Enable = 1
    $rTable.Borders.InsideColor = $COLOR_BORDER
    $rTable.Borders.OutsideColor = $COLOR_NAVY

    $rTable.Columns.Item(1).Width = 110
    $rTable.Columns.Item(2).Width = 120
    $rTable.Columns.Item(3).Width = 235

    $rHeaders = @("Peran (Role)", "Target Pengguna", "Hak Akses dan Kewenangan")
    for ($c = 1; $c -le 3; $c++) {
        $cell = $rTable.Cell(1, $c)
        $cell.Range.Text = $rHeaders[$c - 1]
        $cell.Range.Font.Bold = 1
        $cell.Range.Font.Name = "Arial"
        $cell.Range.Font.Size = 9
        $cell.Range.Font.Color = 16777215
        $cell.Shading.BackgroundPatternColor = $COLOR_NAVY
        $cell.VerticalAlignment = 1
        $cell.Range.ParagraphFormat.Alignment = 1
    }

    $rData = @(
        @("SUPER_ADMIN", "Administrator IT", "Akses penuh sistem, manajemen akun pengguna, master kategori, master unit, dan audit logs."),
        @("ADMIN_ARSIP", "Petugas Agendaris Pusat", "Registrasi surat masuk & keluar, penomoran agenda otomatis, cetak lembar disposisi, buku agenda."),
        @("ADMIN_UNIT", "Admin Seksi / Bagian", "Mengunggah, mengedit, dan mengelola arsip digital khusus pada unit kerjanya masing-masing."),
        @("PIMPINAN", "Kakanwil / Kabag / Kasie", "Dashboard eksekutif, memantau surat masuk mendesak, memberikan instruksi lembar disposisi digital."),
        @("PEGAWAI", "Staf Pelaksana", "Pencarian arsip berkas, pratinjau dokumen PDF (read-only), dan pengunduhan berkas yang berstatus publik/internal.")
    )

    for ($i = 0; $i -lt $rData.Count; $i++) {
        $rowIdx = $i + 2
        for ($c = 1; $c -le 3; $c++) {
            $cell = $rTable.Cell($rowIdx, $c)
            $cell.Range.Text = $rData[$i][$c - 1]
            $cell.Range.Font.Name = "Arial"
            $cell.Range.Font.Size = 8.5
            $cell.VerticalAlignment = 1
            if ($c -eq 1) { $cell.Range.Font.Bold = 1 }
            if ($c -eq 1 -or $c -eq 2) { $cell.Range.ParagraphFormat.Alignment = 0 } else { $cell.Range.ParagraphFormat.Alignment = 3 }
        }
    }
    $tRolePara.Range.InsertParagraphAfter()
    Add-P -Text "" -FontSize 4 -SpaceAfter 6

    Add-H2 -Text "1.3 Akun Pengguna Uji Coba (Demo Credentials)"
    Add-P -Text "Untuk keperluan pengujian dan pelatihan operasional, akun berikut telah dikonfigurasi aktif pada sistem:"

    # Table Demo Users: 6 rows, 4 cols
    $tDemoPara = $doc.Paragraphs.Add()
    $dTable = $doc.Tables.Add($tDemoPara.Range, 6, 4)
    $dTable.Borders.Enable = 1
    $dTable.Borders.InsideColor = $COLOR_BORDER
    $dTable.Borders.OutsideColor = $COLOR_NAVY

    $dTable.Columns.Item(1).Width = 100
    $dTable.Columns.Item(2).Width = 90
    $dTable.Columns.Item(3).Width = 120
    $dTable.Columns.Item(4).Width = 155

    $dHeaders = @("Username", "Password", "Peran (Role)", "Unit / Keterangan")
    for ($c = 1; $c -le 4; $c++) {
        $cell = $dTable.Cell(1, $c)
        $cell.Range.Text = $dHeaders[$c - 1]
        $cell.Range.Font.Bold = 1
        $cell.Range.Font.Name = "Arial"
        $cell.Range.Font.Size = 9
        $cell.Range.Font.Color = 16777215
        $cell.Shading.BackgroundPatternColor = $COLOR_NAVY
        $cell.VerticalAlignment = 1
        $cell.Range.ParagraphFormat.Alignment = 1
    }

    $demoData = @(
        @("superadmin", "admin123", "Super Administrator", "Akses Penuh Seluruh Menu"),
        @("admin.arsip", "arsip123", "Admin E-Arsip", "Agendaris Pusat & Persuratan"),
        @("admin.keuangan", "keu123", "Admin Unit Keuangan", "Pengelola Berkas Bagian Keuangan"),
        @("admin.haji", "haji123", "Admin Bidang Haji", "Pengelola Dokumen Haji & Paspor"),
        @("kakanwil", "kakanwil123", "Pimpinan", "Monitoring Eksekutif & Disposisi")
    )

    for ($i = 0; $i -lt $demoData.Count; $i++) {
        $rowIdx = $i + 2
        for ($c = 1; $c -le 4; $c++) {
            $cell = $dTable.Cell($rowIdx, $c)
            $cell.Range.Text = $demoData[$i][$c - 1]
            $cell.Range.Font.Name = "Arial"
            $cell.Range.Font.Size = 8.5
            $cell.VerticalAlignment = 1
            if ($c -eq 1 -or $c -eq 2) {
                $cell.Range.ParagraphFormat.Alignment = 1
                $cell.Range.Font.Name = "Consolas"
            } else {
                $cell.Range.ParagraphFormat.Alignment = 0
            }
        }
    }
    $tDemoPara.Range.InsertParagraphAfter()
    Add-P -Text "" -FontSize 4 -SpaceAfter 8

    # ================= BAB II (FLOWCHART WORKFLOW) =================
    Add-H1 -Text "BAB II. FLOWCHART ALUR KERJA TERPADU APLIKASI"
    Add-P -Text "Seluruh operasional pengelolaan persuratan dan pengarsipan digital dalam SI-ARSIP mengikuti alur kerja terstruktur sebagaimana digambarkan dalam bagan berikut:"

    if (Test-Path $ImagePath) {
        Write-Host "Menyisipkan Flowchart Aplikasi SI-ARSIP..."
        $imgPara = $doc.Paragraphs.Add()
        $imgRange = $imgPara.Range
        $shape = $imgRange.InlineShapes.AddPicture($ImagePath)
        if ($shape.Width -gt 455) {
            $ratio = 455 / $shape.Width
            $shape.Width = 455
            $shape.Height = $shape.Height * $ratio
        }
        $imgPara.Alignment = 1
        $imgPara.SpaceAfter = 4
        $imgRange.InsertParagraphAfter()
        Add-P -Text "Gambar 1: Bagan Alur Kerja Terpadu Persuratan Masuk/Keluar, Lembar Disposisi, dan Repositori E-Arsip Digital SI-ARSIP" -FontSize 9 -Italic $true -Alignment 1 -SpaceAfter 12 -Color $COLOR_GRAY
    }

    Add-H2 -Text "2.1 Penjelasan 4 Siklus Utama Alur Kerja Aplikasi"
    Add-Bullet -BoldPart "1. Siklus Surat Masuk & Disposisi:" -Text "Surat fisik yang masuk diagendakan oleh petugas agendaris, diinput data metadatanya, dan diunggah scan PDF-nya. Sistem menerbitkan Nomor Agenda otomatis berurutan (SM/YYYY/XXXXX). Surat otomatis tampil pada Dashboard Pimpinan untuk dibuatkan Lembar Disposisi resmi berkop Kanwil Papua, kemudian diteruskan ke unit kerja terkait."
    Add-Bullet -BoldPart "2. Fitur Jembatan 1-Klik E-Arsip (Zero Re-Upload):" -Text "Setelah surat selesai ditindaklanjuti, petugas cukup menekan tombol 'Simpan ke E-Arsip'. Berkas PDF dan seluruh informasi surat otomatis dipindahkan menjadi arsip digital permanen tanpa perlu mengunggah ulang file."
    Add-Bullet -BoldPart "3. Siklus Surat Keluar & Buku Register Agenda:" -Text "Surat keluar dinas diregistrasi, diunggah file finalnya, dan diterbitkan nomor agenda keluar resmi. Seluruh riwayat surat masuk dan keluar secara otomatis terangkum dalam Buku Agenda Digital yang dapat difilter dan diekspor."
    Add-Bullet -BoldPart "4. Siklus E-Arsip Digital & Pencarian Cepat:" -Text "Dokumen arsip unit (SPJ, SK, Paspor, dll) diunggah dengan klasifikasi kategori, masa retensi, dan tingkat keamanan. Seluruh staf yang memiliki hak akses dapat menemukan dokumen dalam hitungan detik menggunakan fitur pencarian cerdas terpadu dan penampil PDF bawaan."

    # ================= BAB III (STEP-BY-STEP USER MANUAL) =================
    Add-H1 -Text "BAB III. PANDUAN PENGGUNAAN LANGKAH DEMI LANGKAH"

    Add-H2 -Text "3.1 Langkah 1: Masuk ke Sistem (Login)"
    Add-Bullet -BoldPart "Langkah a:" -Text "Buka aplikasi peramban (Google Chrome, Microsoft Edge, atau Mozilla Firefox) pada komputer atau laptop Anda."
    Add-Bullet -BoldPart "Langkah b:" -Text "Ketik alamat resmi aplikasi: https://siarsip-kemenhaj.vercel.app pada bilah URL peramban."
    Add-Bullet -BoldPart "Langkah c:" -Text "Pada halaman login, masukkan Username dan Password Anda sesuai akun yang telah diberikan oleh administrator."
    Add-Bullet -BoldPart "Langkah d:" -Text "Klik tombol 'Masuk Sistem'. Sistem akan mengarahkan Anda ke Dashboard Utama sesuai dengan peran (role) akun Anda."

    Add-H2 -Text "3.2 Langkah 2: Mengoperasikan Dashboard Utama"
    Add-P -Text "Halaman Dashboard menyajikan ringkasan informasi dan metrik operasional secara real-time:"
    Add-Bullet -BoldPart "Kartu Statistik:" -Text "Menampilkan jumlah Total Berkas Arsip, Surat Masuk, Surat Keluar, dan Surat Menunggu Disposisi Pimpinan."
    Add-Bullet -BoldPart "Grafik Distribusi Arsip:" -Text "Menampilkan proporsi volume dokumen pada masing-masing unit kerja (Keuangan, Kepegawaian, Umum, Perencanaan, Haji)."
    Add-Bullet -BoldPart "Tabel Aktivitas Terkini:" -Text "Menampilkan 5 surat atau arsip terbaru yang baru saja diunggah ke dalam sistem."

    Add-H2 -Text "3.3 Langkah 3: Mengelola Surat Masuk & Lembar Disposisi"
    Add-Bullet -BoldPart "a. Mencatat Surat Masuk Baru:" -Text "Klik menu 'Persuratan' > 'Surat Masuk' pada navigasi samping. Klik tombol '+ Catat Surat Masuk'."
    Add-Bullet -BoldPart "b. Mengisi Formulir Metadata:" -Text "Isi field Nomor Surat Asli, Tanggal Surat, Tanggal Diterima, Asal Pengirim, Perihal Surat, Sifat Surat (Biasa / Segera / Sangat Segera), dan Ringkasan Isi."
    Add-Bullet -BoldPart "c. Mengunggah Berkas PDF:" -Text "Seret (*drag and drop*) file scan PDF surat ke area unggah atau klik 'Pilih Berkas'. Pastikan file berformat PDF dan teks dapat terbaca jelas."
    Add-Bullet -BoldPart "d. Menyimpan Data:" -Text "Klik tombol 'Simpan & Terbitkan Agenda'. Sistem secara otomatis menghasilkan Nomor Agenda resmi (contoh: SM/2026/00001)."
    Add-Bullet -BoldPart "e. Mencetak Lembar Disposisi Resmi:" -Text "Klik judul surat pada daftar, lalu klik tombol 'Cetak Lembar Disposisi'. Sistem akan membuka pratinjau lembar disposisi resmi ber-Kop Kantor Wilayah Kementerian Agama Provinsi Papua yang siap dicetak langsung ke printer."
    Add-Bullet -BoldPart "f. Menyimpan ke E-Arsip (Zero Re-Upload):" -Text "Setelah disposisi selesai ditindaklanjuti, buka detail surat lalu klik tombol 'Jadikan E-Arsip'. Berkas langsung tersimpan di repositori E-Arsip tanpa perlu upload ulang."

    Add-H2 -Text "3.4 Langkah 4: Mengelola Surat Keluar & Buku Agenda"
    Add-Bullet -BoldPart "a. Registrasi Surat Keluar:" -Text "Klik menu 'Persuratan' > 'Surat Keluar'. Klik tombol '+ Registrasi Surat Keluar'."
    Add-Bullet -BoldPart "b. Input Data Surat Keluar:" -Text "Masukkan Nomor Surat Keluar, Tanggal Surat, Unit Pengirim, Instansi Tujuan/Penerima, Perihal, dan unggah file PDF surat yang telah ditandatangani."
    Add-Bullet -BoldPart "c. Buku Register Agenda Persuratan:" -Text "Klik menu 'Persuratan' > 'Buku Agenda'. Pada halaman ini, petugas dapat memfilter register berdasarkan rentang tanggal, kategori surat masuk/keluar, dan mengekspor buku agenda untuk keperluan pelaporan."

    Add-H2 -Text "3.5 Langkah 5: Mengelola E-Arsip Digital (Upload, Filter, & Preview)"
    Add-Bullet -BoldPart "a. Mengunggah Arsip Baru:" -Text "Klik menu 'E-Arsip' > '+ Tambah Arsip'. Pilih Unit Kerja penanggung jawab (Keuangan/Kepegawaian/Umum/Perencanaan/Haji)."
    Add-Bullet -BoldPart "b. Memilih Klasifikasi Kategori:" -Text "Pilih kode klasifikasi arsip yang sesuai (misal: Keuangan > SPJ / LPJ, atau Haji > Berkas Paspor)."
    Add-Bullet -BoldPart "c. Mengatur Tingkat Keamanan:" -Text "Pilih tingkat kerahasiaan: PUBLIK (dapat dilihat seluruh pegawai), INTERNAL (khusus lingkungan kanwil), TERBATAS (hanya staf unit terkait), atau RAHASIA (hanya pimpinan dan admin)."
    Add-Bullet -BoldPart "d. Unggah Dokumen:" -Text "Unggah file dokumen PDF, lalu klik tombol 'Simpan Arsip Digital'."
    Add-Bullet -BoldPart "e. Pencarian Berkas Cerdas:" -Text "Ketik kata kunci (nomor berkas, perihal, atau nama pihak terkait) pada bilah pencarian di bagian atas daftar arsip. Hasil pencarian akan langsung muncul secara instan."
    Add-Bullet -BoldPart "f. Pratinjau & Unduh Dokumen:" -Text "Klik ikon 'Mata' (Pratinjau) pada baris arsip untuk membaca dokumen langsung di dalam aplikasi tanpa perlu mengunduhnya. Untuk menyimpan ke komputer lokal, klik ikon 'Unduh'."

    Add-H2 -Text "3.6 Langkah 6: Fitur Khusus Pimpinan (Executive Monitoring)"
    Add-Bullet -BoldPart "a. Monitoring Real-time:" -Text "Login menggunakan akun Pimpinan (kakanwil). Pimpinan langsung disajikan daftar surat masuk yang memerlukan arahan disposisi."
    Add-Bullet -BoldPart "b. Memberikan Instruksi Disposisi:" -Text "Pimpinan dapat memilih tujuan disposisi (Kabag TU, Bidang Haji, Bimas, dll), memilih sifat instruksi (Tindak Lanjuti / Koordinasikan / Hadiri / Arsip), dan menuliskan catatan arahan khusus."

    Add-H2 -Text "3.7 Langkah 7: Pengelolaan Master Data & Audit Trail (Khusus Admin)"
    Add-Bullet -BoldPart "a. Manajemen Pengguna:" -Text "Menu 'Master Data' > 'Pengguna' digunakan untuk membuat akun pegawai baru, mengubah peran (role), menonaktifkan akun yang mutasi, serta melakukan reset password."
    Add-Bullet -BoldPart "b. Manajemen Kategori Arsip:" -Text "Menu 'Master Data' > 'Kategori' digunakan untuk menambah atau menyesuaikan kode klasifikasi arsip dinas."
    Add-Bullet -BoldPart "c. Audit Trail (Jejak Log Keamanan):" -Text "Menu 'Audit Logs' mencatat secara otomatis seluruh rekam jejak aktivitas (siapa yang login, mengunggah file, melihat dokumen rahasia, atau menghapus arsip) beserta tanggal dan jam pastinya."

    # ================= BAB IV (TIPS & TROUBLESHOOTING) =================
    Add-H1 -Text "BAB IV. STANDAR OPERASIONAL, TIPS & TROUBLESHOOTING"

    Add-H2 -Text "4.1 Standar Format dan Penamaan Dokumen Scan"
    Add-Bullet -BoldPart "Format Berkas Wajib:" -Text "Seluruh berkas scan fisik wajib disimpan dalam format Portable Document Format (.PDF)."
    Add-Bullet -BoldPart "Resolusi Pemindaian:" -Text "Gunakan resolusi scanner 200 hingga 300 DPI (Dots Per Inch) hitam-putih atau warna agar teks tajam dan ukuran file tetap efisien (disarankan di bawah 10 MB per berkas)."
    Add-Bullet -BoldPart "Standar Penamaan File:" -Text "Gunakan format penamaan standar, contoh: [UNIT]_[JENIS]_[NOMOR]_[TAHUN].pdf (Contoh: KEU_SPJ_0142_2026.pdf)."

    Add-H2 -Text "4.2 Panduan Mengatasi Kendala (Troubleshooting)"
    Add-Bullet -BoldPart "1. Gagal Masuk Sistem (Invalid Credentials):" -Text "Pastikan tombol Caps Lock tidak aktif. Periksa ejaan username dan password. Jika masih terkendala, hubungi Super Administrator untuk melakukan reset password."
    Add-Bullet -BoldPart "2. File Scan Tidak Bisa Diunggah:" -Text "Pastikan koneksi internet stabil dan format file adalah .PDF (bukan .exe atau .zip). Periksa apakah ukuran file tidak melebihi batas maksimal server."
    Add-Bullet -BoldPart "3. Dokumen PDF Tidak Muncul di Pratinjau:" -Text "Periksa apakah peramban Anda memblokir pop-up/script. Segarkan halaman (tekan tombol Ctrl + F5 pada keyboard)."
    Add-Bullet -BoldPart "4. Keamanan Akun Pengguna:" -Text "Selalu klik tombol 'Keluar (Logout)' di pojok kanan atas setelah selesai menggunakan aplikasi, terutama jika menggunakan komputer bersama di kantor."

    # ================= PENUTUP =================
    Add-P -Text "________________________________________________________________________________" -FontSize 8.5 -Alignment 1 -SpaceBefore 14 -SpaceAfter 10 -Color 10526880
    Add-P -Text "Buku Panduan Penggunaan ini merupakan pedoman resmi operasional SI-ARSIP Kantor Wilayah Kementerian Agama / Kementerian Haji dan Umrah Provinsi Papua. Untuk konsultasi teknis lebih lanjut, silakan menghubungi Tim Pengelola TIK Kanwil." -FontSize 9.5 -Italic $true -Alignment 3 -SpaceAfter 8

    Write-Host "Menyimpan dokumen user manual ke $OutputPath..."
    $doc.SaveAs([ref]$OutputPath, [ref]16)
    $doc.Close()
    $word.Quit()

    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    Write-Host "BERHASIL_MEMBUAT_USER_MANUAL_SIARSIP"
} catch {
    Write-Error $_.Exception.Message
    if ($word) { $word.Quit() }
}
