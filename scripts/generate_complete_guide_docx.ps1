# Script to generate Comprehensive Technical Guideline Word Document (.docx)
param(
    [string]$ImagePath = "d:\8 PROJECT\2026\DEV\KEMENHAJ\SiArsip_Kemenhaj\flowchart_spbe_lengkap.png",
    [string]$OutputPath = "d:\8 PROJECT\2026\DEV\KEMENHAJ\SiArsip_Kemenhaj\PANDUAN_PENGADAAN_APLIKASI_SPBE.docx"
)

try {
    Write-Host "Menginisialisasi Microsoft Word COM Object..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    $doc = $word.Documents.Add()

    # Setting Margins (2.5 cm ~ 71 pt)
    $doc.PageSetup.TopMargin = 71
    $doc.PageSetup.BottomMargin = 71
    $doc.PageSetup.LeftMargin = 71
    $doc.PageSetup.RightMargin = 71

    # Color Palette
    $COLOR_NAVY   = 8388608    # RGB(0, 51, 102) / 0x800000 (BGR)
    $COLOR_TEAL   = 8421376    # RGB(0, 128, 128)
    $COLOR_DARK   = 2105376    # RGB(32, 32, 32)
    $COLOR_GRAY   = 6579300    # RGB(100, 100, 100)
    $COLOR_BORDER = 11184810   # Light Border
    $COLOR_BG_BOX = 15921906   # Shading box light gray

    # Helper: Add Paragraph
    function Add-Para {
        param(
            [string]$Text,
            [int]$FontSize = 10.5,
            [bool]$Bold = $false,
            [bool]$Italic = $false,
            [int]$Alignment = 3, # 0=Left, 1=Center, 2=Right, 3=Justify
            [int]$SpaceBefore = 0,
            [int]$SpaceAfter = 5,
            [int]$Color = 0,
            [string]$FontName = "Arial"
        )
        $p = $doc.Paragraphs.Add()
        $r = $p.Range
        $r.Text = $Text
        $r.Font.Name = $FontName
        $r.Font.Size = $FontSize
        $r.Font.Bold = [int]$Bold
        $r.Font.Italic = [int]$Italic
        if ($Color -ne 0) { $r.Font.Color = $Color }
        $p.Alignment = $Alignment
        $p.SpaceBefore = $SpaceBefore
        $p.SpaceAfter = $SpaceAfter
        $r.InsertParagraphAfter()
    }

    # Helper: Add Chapter Heading (Level 1)
    function Add-Chapter {
        param([string]$Text)
        $p = $doc.Paragraphs.Add()
        $r = $p.Range
        $r.Text = $Text
        $r.Font.Name = "Arial"
        $r.Font.Size = 13
        $r.Font.Bold = 1
        $r.Font.Color = $COLOR_NAVY
        $p.SpaceBefore = 14
        $p.SpaceAfter = 6
        $p.Alignment = 0
        $r.InsertParagraphAfter()
    }

    # Helper: Add Subheading (Level 2)
    function Add-SubHeading {
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

    # Helper: Add Sub-subheading (Level 3)
    function Add-SubSubHeading {
        param([string]$Text)
        $p = $doc.Paragraphs.Add()
        $r = $p.Range
        $r.Text = $Text
        $r.Font.Name = "Arial"
        $r.Font.Size = 10.5
        $r.Font.Bold = 1
        $r.Font.Color = 0
        $p.SpaceBefore = 6
        $p.SpaceAfter = 2
        $p.Alignment = 0
        $r.InsertParagraphAfter()
    }

    # Helper: Add Bullet
    function Add-BulletItem {
        param(
            [string]$BoldPart = "",
            [string]$Text = ""
        )
        $p = $doc.Paragraphs.Add()
        $r = $p.Range
        $prefix = "$([char]0x2022) "
        if ($BoldPart -ne "") {
            $r.Text = "$prefix$BoldPart $Text"
        } else {
            $r.Text = "$prefix$Text"
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

    # Helper: Add Callout Box
    function Add-CalloutBox {
        param(
            [string]$Title,
            [string]$Body
        )
        $boxP = $doc.Paragraphs.Add()
        $tbl = $doc.Tables.Add($boxP.Range, 1, 1)
        $tbl.Borders.Enable = 1
        $tbl.Borders.OutsideColor = $COLOR_NAVY
        $tbl.Columns.Item(1).Width = 465
        $cell = $tbl.Cell(1, 1)
        $cell.Shading.BackgroundPatternColor = 16119285 # soft ice blue / light gray
        $cell.TopPadding = 6
        $cell.BottomPadding = 6
        $cell.LeftPadding = 8
        $cell.RightPadding = 8
        
        $cRange = $cell.Range
        $cRange.Text = "$Title`n$Body"
        $cRange.Font.Name = "Arial"
        $cRange.Font.Size = 9.5
        $cRange.ParagraphFormat.Alignment = 3
        $boxP.Range.InsertParagraphAfter()
    }

    # ================= TITLE & COVER BANNER =================
    Add-Para -Text "PETUNJUK TEKNIS & STANDAR OPERASIONAL PROSEDUR" -FontSize 15 -Bold $true -Alignment 1 -SpaceAfter 4 -Color $COLOR_NAVY
    Add-Para -Text "PENGADAAN DAN PENGEMBANGAN APLIKASI SISTEM INFORMASI" -FontSize 13 -Bold $true -Alignment 1 -SpaceAfter 3 -Color 16711680
    Add-Para -Text "PEDOMAN TATA KELOLA TIK, KELAIKAN ARSITEKTUR SPBE, DAN STANDAR KEAMANAN SIBER" -FontSize 10.5 -Bold $true -Alignment 1 -SpaceAfter 14 -Color $COLOR_GRAY
    Add-Para -Text "________________________________________________________________________________" -FontSize 8.5 -Alignment 1 -SpaceAfter 14 -Color 10526880

    # ================= BAB I =================
    Add-Chapter -Text "BAB I. KETENTUAN UMUM DAN KONSEPSI DASAR"
    Add-Para -Text "Buku Petunjuk Teknis ini disusun sebagai acuan baku bagi seluruh Unit Kerja Pemohon, Pejabat Pembuat Komitmen (PPK), Tim Pembina/Koordinasi SPBE, serta Tim Teknis Pengelola TIK dalam merencanakan, menilai kelaikan, mengadakan, menguji, hingga mengoperasikan perangkat lunak sistem informasi di lingkungan instansi pemerintah."
    
    Add-SubHeading -Text "1.1 Definisi Operasional"
    Add-BulletItem -BoldPart "Sistem Pemerintahan Berbasis Elektronik (SPBE):" -Text "Penyelenggaraan pemerintahan yang memanfaatkan teknologi informasi dan komunikasi untuk memberikan layanan kepada instansi, aparatur sipil negara, pelaku bisnis, dan masyarakat luas."
    Add-BulletItem -BoldPart "Aplikasi Umum SPBE:" -Text "Aplikasi yang dirancang dan ditetapkan secara nasional oleh kementerian pembina untuk digunakan secara berbagi pakai oleh seluruh kementerian/lembaga/pemerintah daerah (misalnya: SRIKANDI untuk kearsipan dinamis, SP4N-LAPOR! untuk aspirasi pengaduan, SIPD untuk keuangan daerah)."
    Add-BulletItem -BoldPart "Aplikasi Khusus SPBE:" -Text "Aplikasi yang dibangun dan dioperasikan oleh suatu instansi untuk memenuhi proses bisnis spesifik yang belum dan tidak diakomodasi oleh Aplikasi Umum Nasional."
    Add-BulletItem -BoldPart "Interoperabilitas Sistem:" -Text "Kemampuan dua atau lebih sistem informasi atau komponen untuk bertukar data/informasi secara mulus melalui protokol standar (REST API, Web Service, SPLP) tanpa manipulasi manual."
    Add-BulletItem -BoldPart "Kepemilikan Kode Sumber (Source Code Escrow):" -Text "Kewajiban penyerahan 100% kode sumber pemrograman beserta dokumentasi dan hak ciptanya kepada instansi pemerintah, guna menjamin kedaulatan data dan mencegah ketergantungan sepihak (vendor lock-in)."

    # ================= BAB II =================
    Add-Chapter -Text "BAB II. LANDASAN HUKUM DAN KETENTUAN REGULASI"
    Add-Para -Text "Setiap tahapan pengadaan dan pengembangan perangkat lunak sistem informasi wajib berpedoman pada regulasi nasional yang berlaku:"
    Add-BulletItem -BoldPart "Peraturan Presiden Nomor 95 Tahun 2018" -Text "tentang Sistem Pemerintahan Berbasis Elektronik (SPBE), yang mengatur keterpaduan layanan, tata kelola TIK, dan larangan duplikasi aplikasi pemerintah."
    Add-BulletItem -BoldPart "Peraturan Presiden Nomor 16 Tahun 2018 jo. Perpres Nomor 12 Tahun 2021" -Text "tentang Pengadaan Barang/Jasa Pemerintah, yang mengatur tata cara perencanaan, pemilihan penyedia, kontrak kerja sama, dan serah terima hasil pekerjaan."
    Add-BulletItem -BoldPart "Peraturan Presiden Nomor 39 Tahun 2019" -Text "tentang Satu Data Indonesia (SDI), yang mewajibkan standarisasi data, kode referensi baku, interoperabilitas, dan keterbukaan metadata antar-aplikasi."
    Add-BulletItem -BoldPart "Undang-Undang Nomor 27 Tahun 2022" -Text "tentang Pelindungan Data Pribadi (UU PDP), yang membebankan tanggung jawab hukum perlindungan data pengendali terhadap data pengguna/publik yang diproses dalam aplikasi."
    Add-BulletItem -BoldPart "Peraturan Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah (LKPP) Nomor 12 Tahun 2021" -Text "tentang Pedoman Pengadaan Barang/Jasa Melalui Penyedia (spesifikasi TIK, KAK, HPS, dan Kontrak)."
    Add-BulletItem -BoldPart "Peraturan Badan Siber dan Sandi Negara (BSSN) Nomor 4 Tahun 2021" -Text "tentang Pedoman Manajemen Keamanan Informasi SPBE dan Standar Teknis Pengamanan Aplikasi Layanan Publik."

    # ================= BAB III =================
    Add-Chapter -Text "BAB III. PRINSIP KELAIKAN DAN KEBIJAKAN ZERO NEW APPS"
    Add-Para -Text "Sesuai arahan reformasi birokrasi dan keterpaduan SPBE nasional, pembangunan aplikasi baru harus melalui penapisan ketat (*screening*) untuk menghindari fragmentasi data dan pemborosan anggaran negara."

    Add-CalloutBox -Title "PRINSIP PENAPISAN KEBUTUHAN (ZERO DUPLICATION POLICY):" -Body "Instansi pemerintah TIDAK DIPERKENANKAN membangun aplikasi baru apabila: (1) Fungsinya sudah tercakup dalam Aplikasi Umum Nasional yang ditetapkan KemenPAN-RB; atau (2) Sudah terdapat aplikasi eksisting internal kementerian yang memiliki modul serupa dan dapat diperluas fungsinya; atau (3) Kebutuhan operasional dapat dipenuhi secara optimal melalui penyesuaian/integrasi API sistem yang ada."

    Add-SubHeading -Text "3.1 Kriteria Pemenuhan Izin Pembangunan Aplikasi Baru"
    Add-Para -Text "Aplikasi baru hanya dapat disetujui apabila memenuhi seluruh kriteria berikut:"
    Add-BulletItem -BoldPart "Adanya Kesenjangan Nyata (Real Gap):" -Text "Terdapat proses bisnis spesifik regulasi yang mutlak memerlukan otomasi digital dan tidak diwadahi oleh sistem informasi yang ada."
    Add-BulletItem -BoldPart "Kesiapan Sumber Daya Operasional:" -Text "Unit kerja memiliki personil penanggung jawab data (*data owner*), operator terverifikasi, dan alokasi pemeliharaan berkala."
    Add-BulletItem -BoldPart "Kepatuhan Arsitektur SPBE:" -Text "Wajib berbasis web responsif/cloud, memiliki basis data relasional yang ternormalisasi, dan menyediakan antarmuka integrasi (REST API)."
    Add-BulletItem -BoldPart "Kedaulatan Kepemilikan:" -Text "Vendor pengembang wajib menyepakati bahwa hak kepemilikan intelektual, source code, basis data, dan dokumentasi menjadi milik sah instansi pemerintah."

    # ================= BAB IV (FLOWCHART & MATRIKS) =================
    Add-Chapter -Text "BAB IV. FLOWCHART ALUR DAN PROSEDUR OPERASIONAL TERPADU"
    Add-Para -Text "Seluruh proses pengadaan dan pengembangan sistem informasi wajib mengikuti alur logis 5 (lima) tahapan terpadu berikut:"

    # Insert Mermaid Diagram Image
    if (Test-Path $ImagePath) {
        Write-Host "Menyisipkan Flowchart Terpadu..."
        $imgPara = $doc.Paragraphs.Add()
        $imgRange = $imgPara.Range
        $shape = $imgRange.InlineShapes.AddPicture($ImagePath)
        if ($shape.Width -gt 450) {
            $ratio = 450 / $shape.Width
            $shape.Width = 450
            $shape.Height = $shape.Height * $ratio
        }
        $imgPara.Alignment = 1
        $imgPara.SpaceAfter = 4
        $imgRange.InsertParagraphAfter()
        Add-Para -Text "Gambar 1: Alur Terpadu Permintaan, Verifikasi Arsitektur, Pengadaan, Pengujian Keamanan, dan Registrasi Aplikasi SPBE" -FontSize 9 -Italic $true -Alignment 1 -SpaceAfter 12 -Color $COLOR_GRAY
    }

    Add-SubHeading -Text "4.1 Matriks Peran dan Tanggung Jawab Pemangku Kepentingan (RACI Matrix)"
    Add-Para -Text "Untuk menjamin akuntabilitas tata kelola, pembagian peran dalam setiap tahapan didefinisikan sebagai berikut:"

    # Table RACI Matrix: 6 rows, 6 cols
    $tPara = $doc.Paragraphs.Add()
    $raciTable = $doc.Tables.Add($tPara.Range, 6, 6)
    $raciTable.Borders.Enable = 1
    $raciTable.Borders.InsideColor = $COLOR_BORDER
    $raciTable.Borders.OutsideColor = $COLOR_NAVY

    $colWidths = @(130, 65, 65, 65, 70, 70)
    for ($c = 1; $c -le 6; $c++) { $raciTable.Columns.Item($c).Width = $colWidths[$c - 1] }

    $rHeaders = @("Tahapan Operasional", "Unit Pemohon", "Tim SPBE / TIK", "PPK / Pokja", "Pengembang", "Tim Keamanan")
    for ($c = 1; $c -le 6; $c++) {
        $cell = $raciTable.Cell(1, $c)
        $cell.Range.Text = $rHeaders[$c - 1]
        $cell.Range.Font.Bold = 1
        $cell.Range.Font.Name = "Arial"
        $cell.Range.Font.Size = 8.5
        $cell.Range.Font.Color = 16777215
        $cell.Shading.BackgroundPatternColor = $COLOR_NAVY
        $cell.VerticalAlignment = 1
        $cell.Range.ParagraphFormat.Alignment = 1
    }

    $raciData = @(
        @("1. Inisiasi & Analisis Masalah", "Responsible", "Consulted", "Informed", "-", "-"),
        @("2. Verifikasi Teknis & Skrining", "Informed", "Accountable", "Consulted", "-", "-"),
        @("3. Penyusunan KAK, HPS & Kontrak", "Consulted", "Consulted", "Accountable", "-", "-"),
        @("4. Eksekusi SDLC & Uji Fungsi (UAT)", "Accountable", "Consulted", "Informed", "Responsible", "-"),
        @("5. Audit Keamanan & Serah Terima", "Informed", "Accountable", "Accountable", "Consulted", "Responsible")
    )

    for ($i = 0; $i -lt $raciData.Count; $i++) {
        $rowIdx = $i + 2
        for ($c = 1; $c -le 6; $c++) {
            $cell = $raciTable.Cell($rowIdx, $c)
            $cell.Range.Text = $raciData[$i][$c - 1]
            $cell.Range.Font.Name = "Arial"
            $cell.Range.Font.Size = 8.5
            $cell.VerticalAlignment = 1
            if ($c -eq 1) {
                $cell.Range.ParagraphFormat.Alignment = 0
            } else {
                $cell.Range.ParagraphFormat.Alignment = 1
                if ($raciData[$i][$c - 1] -eq "Accountable") { $cell.Range.Font.Bold = 1; $cell.Shading.BackgroundPatternColor = 15132390 }
            }
        }
    }
    $tPara.Range.InsertParagraphAfter()
    Add-Para -Text "Keterangan: Responsible (Pelaksana), Accountable (Penanggung Jawab), Consulted (Konsultan), Informed (Penerima Laporan)." -FontSize 8 -Italic $true -SpaceAfter 10

    # ================= BAB V =================
    Add-Chapter -Text "BAB V. STANDAR ARSITEKTUR DAN SPESIFIKASI TEKNOLOGI"
    Add-Para -Text "Seluruh aplikasi yang diadakan di lingkungan instansi pemerintah wajib mematuhi standar teknologi terbuka (open standard) untuk memastikan efisiensi pemeliharaan jangka panjang:"

    Add-SubHeading -Text "5.1 Arsitektur Aplikasi dan Bahasa Pemrograman"
    Add-BulletItem -BoldPart "Model Arsitektur:" -Text "Wajib menggunakan arsitektur berbasis modular/layanan (Modular Monolith atau Microservices) dengan pola MVC (Model-View-Controller) yang memisahkan business logic dari antarmuka visual."
    Add-BulletItem -BoldPart "Framework Standar:" -Text "Mengutamakan framework modern dengan dukungan komunitas luas dan siklus LTS (Long Term Support) aktif (misal: Next.js/React, TypeScript, Laravel, atau Go/Python)."
    Add-BulletItem -BoldPart "Platform Distribusi:" -Text "Berbasis web responsif (Mobile-First responsive design) yang dapat diakses optimal melalui berbagai jenis perangkat dan browser standar (Chrome, Firefox, Edge, Safari)."

    Add-SubHeading -Text "5.2 Standar Basis Data dan Interoperabilitas"
    Add-BulletItem -BoldPart "Database Engine:" -Text "Wajib menggunakan basis data relasional standar (RDBMS) seperti PostgreSQL, MariaDB, atau LibSQL/Turso yang mendukung ACID transaction, foreign key constraint, dan indexing terstruktur."
    Add-BulletItem -BoldPart "Protokol Integrasi (API):" -Text "Wajib menyediakan REST API atau GraphQL yang terdokumentasi lengkap (OpenAPI / Swagger Specification 3.0), mendukung autentikasi standar (OAuth 2.0 / JWT), dan siap terhubung ke Sistem Penghubung Layanan Pemerintah (SPLP)."
    Add-BulletItem -BoldPart "Standarisasi Kode Referensi:" -Text "Wajib menggunakan kode referensi baku nasional sesuai Satu Data Indonesia (kode wilayah Kemendagri, kode satuan kerja kementerian, format penomoran arsip nasional)."

    # ================= BAB VI =================
    Add-Chapter -Text "BAB VI. PEDOMAN PENYUSUNAN KAK, METODE PENGADAAN & HPS"
    
    Add-SubHeading -Text "6.1 Struktur Wajib Kerangka Acuan Kerja (KAK / TOR)"
    Add-Para -Text "Dokumen KAK yang disusun oleh PPK wajib memuat sekurang-kurangnya 9 (sembilan) bab standar pengadaan perangkat lunak:"
    Add-BulletItem -BoldPart "Bab 1 - Latar Belakang & Urgensi:" -Text "Justifikasi kebutuhan dan permasalahan operasional yang diselesaikan."
    Add-BulletItem -BoldPart "Bab 2 - Maksud dan Tujuan:" -Text "Sasaran kuantitatif dan kualitatif implementasi sistem informasi."
    Add-BulletItem -BoldPart "Bab 3 - Ruang Lingkup Fungsional:" -Text "Daftar fitur, modul, hak akses peran (Role-Based Access Control), dan batasan sistem."
    Add-BulletItem -BoldPart "Bab 4 - Spesifikasi Teknis:" -Text "Persyaratan arsitektur perangkat lunak, database, API, dan infrastruktur komputasi."
    Add-BulletItem -BoldPart "Bab 5 - Kebutuhan Tenaga Ahli:" -Text "Komposisi dan kualifikasi personil tim pengembang."
    Add-BulletItem -BoldPart "Bab 6 - Metodologi Pelaksanaan:" -Text "Penerapan metode pengembangan terstruktur (Agile/Scrum), sprint plan, dan milestone."
    Add-BulletItem -BoldPart "Bab 7 - Jadwal Pelaksanaan & Deliverables:" -Text "Jadwal tahapan kerja dan luaran dokumen yang wajib diserahkan."
    Add-BulletItem -BoldPart "Bab 8 - Pengujian Mutu & Keamanan:" -Text "Persyaratan uji UAT, uji beban, dan vulnerability assessment BSSN."
    Add-BulletItem -BoldPart "Bab 9 - Alih Pengetahuan & Pemeliharaan:" -Text "Jadwal pelatihan ASN teknis, masa garansi resmi, dan SLA dukungan teknis."

    Add-SubHeading -Text "6.2 Standar Kualifikasi Minimum Tenaga Ahli Pengembang"
    Add-Para -Text "Untuk menjamin mutu perangkat lunak, penyedia jasa wajib menyediakan tim personil dengan kualifikasi terukur:"

    # Table Tenaga Ahli: 6 rows, 4 cols
    $tPara2 = $doc.Paragraphs.Add()
    $ahliTable = $doc.Tables.Add($tPara2.Range, 6, 4)
    $ahliTable.Borders.Enable = 1
    $ahliTable.Borders.InsideColor = $COLOR_BORDER
    $ahliTable.Borders.OutsideColor = $COLOR_NAVY

    $ahliTable.Columns.Item(1).Width = 35
    $ahliTable.Columns.Item(2).Width = 120
    $ahliTable.Columns.Item(3).Width = 140
    $ahliTable.Columns.Item(4).Width = 170

    $aHeaders = @("No", "Posisi Tenaga Ahli", "Kualifikasi Pendidikan & Pengalaman", "Tugas & Tanggung Jawab")
    for ($c = 1; $c -le 4; $c++) {
        $cell = $ahliTable.Cell(1, $c)
        $cell.Range.Text = $aHeaders[$c - 1]
        $cell.Range.Font.Bold = 1
        $cell.Range.Font.Name = "Arial"
        $cell.Range.Font.Size = 8.5
        $cell.Range.Font.Color = 16777215
        $cell.Shading.BackgroundPatternColor = $COLOR_NAVY
        $cell.VerticalAlignment = 1
        $cell.Range.ParagraphFormat.Alignment = 1
    }

    $ahliData = @(
        @("1", "Project Manager", "S1 Informatika/Sistem Informasi, Min. 5 th, Sertifikasi PMP/Scrum Master", "Manajemen jadwal kerja, risiko, koordinasi tim, dan komunikasi berkala ke PPK."),
        @("2", "System Analyst", "S1 Komputer/Informatika, Min. 3 th, Berpengalaman UML & Data Modeling", "Perancangan proses bisnis, use case, ERD basis data, dan spesifikasi arsitektur."),
        @("3", "Senior Developer", "S1 Komputer, Min. 3 th, Menguasai Fullstack Web & RDBMS", "Pembangunan modul utama, integrasi API, security coding, dan optimasi query."),
        @("4", "UI/UX Designer", "S1 Desain Komunikasi / Komputer, Min. 2 th, Portofolio Aplikasi Web", "Penyusunan wireframe, mockup fungsional, dan desain antarmuka responsif ramah pengguna."),
        @("5", "QA & Security Tester", "S1 Komputer, Min. 2 th, Memahami Blackbox Testing & OWASP Tools", "Penyusunan test scenario, eksekusi UAT bersama pengguna, dan pemindaian kerentanan.")
    )

    for ($i = 0; $i -lt $ahliData.Count; $i++) {
        $rowIdx = $i + 2
        for ($c = 1; $c -le 4; $c++) {
            $cell = $ahliTable.Cell($rowIdx, $c)
            $cell.Range.Text = $ahliData[$i][$c - 1]
            $cell.Range.Font.Name = "Arial"
            $cell.Range.Font.Size = 8.5
            $cell.VerticalAlignment = 1
            if ($c -eq 1) {
                $cell.Range.ParagraphFormat.Alignment = 1
            } else {
                $cell.Range.ParagraphFormat.Alignment = 0
            }
        }
    }
    $tPara2.Range.InsertParagraphAfter()
    Add-Para -Text "" -FontSize 4 -SpaceAfter 6

    Add-SubHeading -Text "6.3 Metode Perhitungan Harga Perkiraan Sendiri (HPS)"
    Add-Para -Text "Penyusunan nilai HPS pengadaan perangkat lunak wajib mengacu pada regulasi biaya pemerintah dan tidak boleh semata-mata mengandalkan penawaran vendor:"
    Add-BulletItem -BoldPart "Pendekatan Billing Rate Tenaga Ahli (Man-Month Rate):" -Text "Perhitungan berbasis perkalian antara standar upah tenaga ahli per bulan (mengacu pada Standar Biaya Masukan Kementerian Keuangan atau Panduan Standar Remunerasi INKINDO yang berlaku) dengan estimasi waktu pengerjaan person-month."
    Add-BulletItem -BoldPart "Pendekatan Function Point Analysis (FPA):" -Text "Mengukur estimasi beban kerja berdasarkan jumlah dan kompleksitas fungsi input, output, file logika internal, dan interface eksternal sistem."
    Add-BulletItem -BoldPart "Biaya Langsung Non-Personil:" -Text "Mencakup biaya infrastruktur server pengujian/cloud staging, workshop bimbingan teknis, sertifikasi SSL/keamanan, serta pencetakan dokumen manual."

    # ================= BAB VII =================
    Add-Chapter -Text "BAB VII. STANDAR KEAMANAN SIBER DAN PERLINDUNGAN DATA"
    Add-Para -Text "Keamanan sistem bukan tahapan tambahan, melainkan prinsip bawaan (*Security by Design*) yang wajib tertanam sejak perancangan awal."

    Add-SubHeading -Text "7.1 Mitigasi Ancaman Kerentanan (Standar OWASP Top 10)"
    Add-Para -Text "Pengembang wajib memastikan sistem kebal terhadap 10 celah keamanan paling kritis:"
    Add-BulletItem -BoldPart "Injection Flaws (SQLi/Command Injection):" -Text "Wajib menggunakan parameterized queries / ORM dan sanitasi input ketat."
    Add-BulletItem -BoldPart "Broken Authentication:" -Text "Wajib menerapkan proteksi brute force (rate limiting), session timeout, dan enkripsi kata sandi menggunakan algoritma modern (Argon2 atau Bcrypt)."
    Add-BulletItem -BoldPart "Sensitive Data Exposure:" -Text "Wajib mengenkripsi transmisi data menggunakan TLS 1.3 (HTTPS) dan mengenkripsi data sensitif (NIK, password, token) di tingkat basis data."
    Add-BulletItem -BoldPart "Broken Access Control (IDOR):" -Text "Wajib memvalidasi kepemilikan data di sisi server (backend validation) pada setiap pemanggilan endpoint API."

    Add-SubHeading -Text "7.2 Pengujian Kerentanan Mandiri dan Audit CSIRT"
    Add-Para -Text "Sebelum aplikasi dioperasikan secara luas (*go-live*), wajib dilakukan pengujian kerentanan dengan klasifikasi dan batas remediasi sebagai berikut:"

    # Table Security SLA: 5 rows, 4 cols
    $tPara3 = $doc.Paragraphs.Add()
    $secTable = $doc.Tables.Add($tPara3.Range, 5, 4)
    $secTable.Borders.Enable = 1
    $secTable.Borders.InsideColor = $COLOR_BORDER
    $secTable.Borders.OutsideColor = $COLOR_NAVY

    $secTable.Columns.Item(1).Width = 70
    $secTable.Columns.Item(2).Width = 145
    $secTable.Columns.Item(3).Width = 150
    $secTable.Columns.Item(4).Width = 100

    $sHeaders = @("Tingkat Celah", "Dampak Potensial", "Contoh Temuan", "Toleransi Go-Live")
    for ($c = 1; $c -le 4; $c++) {
        $cell = $secTable.Cell(1, $c)
        $cell.Range.Text = $sHeaders[$c - 1]
        $cell.Range.Font.Bold = 1
        $cell.Range.Font.Name = "Arial"
        $cell.Range.Font.Size = 8.5
        $cell.Range.Font.Color = 16777215
        $cell.Shading.BackgroundPatternColor = $COLOR_NAVY
        $cell.VerticalAlignment = 1
        $cell.Range.ParagraphFormat.Alignment = 1
    }

    $secData = @(
        @("Critical", "Pengambilalihan penuh server, peretasan database massal.", "Remote Code Execution, SQL Injection autentikasi.", "0 Temuan (Wajib Ditutup)"),
        @("High", "Pencurian kredensial akun, pengubahan data tanpa hak.", "IDOR data sensitif, Stored Cross-Site Scripting.", "0 Temuan (Wajib Ditutup)"),
        @("Medium", "Kebocoran konfigurasi internal, manipulasi session minor.", "Weak SSL cipher, Cross-Site Request Forgery (CSRF).", "Maks. 3 (Dengan mitigasi)"),
        @("Low / Info", "Pengungkapan informasi versi framework/server banner.", "Server Header disclosure, cookie missing SameSite flag.", "Dapat diterima")
    )

    for ($i = 0; $i -lt $secData.Count; $i++) {
        $rowIdx = $i + 2
        for ($c = 1; $c -le 4; $c++) {
            $cell = $secTable.Cell($rowIdx, $c)
            $cell.Range.Text = $secData[$i][$c - 1]
            $cell.Range.Font.Name = "Arial"
            $cell.Range.Font.Size = 8.5
            $cell.VerticalAlignment = 1
            if ($c -eq 1 -or $c -eq 4) {
                $cell.Range.ParagraphFormat.Alignment = 1
                if ($secData[$i][0] -eq "Critical" -or $secData[$i][0] -eq "High") {
                    $cell.Range.Font.Bold = 1
                    if ($c -eq 4) { $cell.Shading.BackgroundPatternColor = 13421823 } # Soft Red
                }
            } else {
                $cell.Range.ParagraphFormat.Alignment = 0
            }
        }
    }
    $tPara3.Range.InsertParagraphAfter()
    Add-Para -Text "" -FontSize 4 -SpaceAfter 6

    # ================= BAB VIII =================
    Add-Chapter -Text "BAB VIII. KETENTUAN SERAH TERIMA, DOKUMENTASI & PEMELIHARAAN"
    
    Add-SubHeading -Text "8.1 Daftar Serah Terima Wajib (Deliverables Checklist)"
    Add-Para -Text "Berita Acara Serah Terima (BAST) pekerjaan hanya dapat ditandatangani oleh PPK setelah penyedia menyerahkan seluruh komponen berikut secara lengkap:"
    Add-BulletItem -BoldPart "1. Repositori Source Code Penuh:" -Text "Source code lengkap dalam format Git (beserta commit history), bebas dari kredensial hardcode, dan siap di-build (dilengkapi dockerfile / build script)."
    Add-BulletItem -BoldPart "2. Skema & Skrip Migrasi Basis Data:" -Text "Skrip DDL tabel, relation constraint, stored procedure, serta data awal (seeding) untuk setup database dari awal."
    Add-BulletItem -BoldPart "3. Dokumen Software Requirement Specification (SRS):" -Text "Dokumen spesifikasi kebutuhan sistem yang telah diverifikasi sesuai kondisi riil sistem akhir."
    Add-BulletItem -BoldPart "4. Dokumen Software Architecture & API Specification:" -Text "Diagram arsitektur sistem, ERD basis data, dan dokumentasi API interaktif (Swagger/Postman Collection)."
    Add-BulletItem -BoldPart "5. Buku Panduan Pengguna (User Manual & Admin Manual):" -Text "Buku petunjuk operasional berbahasa Indonesia berilustrasi visual langkah demi langkah untuk level Admin dan Pengguna Akhir."
    Add-BulletItem -BoldPart "6. Berita Acara UAT & Laporan Pengujian Keamanan:" -Text "Bukti kelulusan uji fungsi 100% dan laporan audit penetrasi bebas kerentanan Critical/High."
    Add-BulletItem -BoldPart "7. Sertifikat Hak Cipta & Surat Pernyataan Pelepasan Hak:" -Text "Surat pernyataan resmi bermeterai bahwa seluruh hak kekayaan intelektual (HKI) atas sistem diserahkan mutlak kepada instansi pemerintah."

    Add-SubHeading -Text "8.2 Masa Garansi dan Service Level Agreement (SLA) Pemeliharaan"
    Add-Para -Text "Penyedia jasa wajib memberikan masa pemeliharaan dan garansi resmi minimal selama 6 (enam) bulan setelah penandatanganan BAST, dengan ketentuan SLA sebagai berikut:"
    Add-BulletItem -BoldPart "Insiden Tingkat Kritis (Aplikasi Tidak Dapat Diakses / Down):" -Text "Waktu respons maksimal 1 (satu) jam, perbaikan bug darurat diselesaikan maksimal dalam 1x24 jam."
    Add-BulletItem -BoldPart "Insiden Tingkat Menengah (Fitur Tertentu Error):" -Text "Waktu respons maksimal 4 (empat) jam, perbaikan diselesaikan maksimal dalam 2x24 jam."
    Add-BulletItem -BoldPart "Pembaruan Keamanan Berkala:" -Text "Penyedia wajib melakukan patching terhadap dependensi atau pustaka sistem yang terindikasi celah keamanan baru selama masa garansi aktif tanpa biaya tambahan."

    Add-SubHeading -Text "8.3 Registrasi pada Repositori Aplikasi SI-SPBE Nasional"
    Add-Para -Text "Setelah aplikasi beroperasi di lingkungan pusat data pemerintah, Unit Pengelola TIK instansi wajib mendaftarkan metadata aplikasi ke dalam Sistem Informasi SPBE Nasional (SI-SPBE) yang dikelola oleh Kementerian PAN-RB dan Kementerian Kominfo untuk pencatatan inventaris aset digital negara."

    # ================= PENUTUP =================
    Add-Para -Text "________________________________________________________________________________" -FontSize 8.5 -Alignment 1 -SpaceBefore 14 -SpaceAfter 10 -Color 10526880
    Add-Para -Text "Buku Petunjuk Teknis ini berlaku sebagai standar resmi sejak tanggal ditetapkan dan wajib dijadikan pedoman oleh seluruh pemangku kepentingan dalam setiap siklus pengadaan dan pengembangan perangkat lunak sistem informasi instansi." -FontSize 9.5 -Italic $true -Alignment 3 -SpaceAfter 8

    Write-Host "Menyimpan dokumen final ke $OutputPath..."
    $doc.SaveAs([ref]$OutputPath, [ref]16)
    $doc.Close()
    $word.Quit()

    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    Write-Host "BERHASIL_MEMBUAT_PANDUAN_LENGKAP"
} catch {
    Write-Error $_.Exception.Message
    if ($word) { $word.Quit() }
}
