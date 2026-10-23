# Script to generate Word Document (.docx) for Panduan Pengadaan Aplikasi SPBE
param(
    [string]$ImagePath = "d:\8 PROJECT\2026\DEV\KEMENHAJ\SiArsip_Kemenhaj\flowchart_test.png",
    [string]$OutputPath = "d:\8 PROJECT\2026\DEV\KEMENHAJ\SiArsip_Kemenhaj\PANDUAN_PENGADAAN_APLIKASI_SPBE.docx"
)

try {
    Write-Host "Inisialisasi Word Application..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    $doc = $word.Documents.Add()

    # Set Margins (2.5 cm / ~70.87 pt)
    $doc.PageSetup.TopMargin = 71
    $doc.PageSetup.BottomMargin = 71
    $doc.PageSetup.LeftMargin = 71
    $doc.PageSetup.RightMargin = 71

    $selection = $word.Selection

    # Helper function to add paragraph
    function Add-Paragraph {
        param(
            [string]$Text,
            [string]$Style = "Normal",
            [int]$FontSize = 11,
            [bool]$Bold = $false,
            [bool]$Italic = $false,
            [int]$Alignment = 0, # 0=Left, 1=Center, 2=Right, 3=Justify
            [int]$SpaceAfter = 6,
            [int]$Color = 0 # 0=wdColorAutomatic, 16711680=Blue etc
        )
        $p = $doc.Paragraphs.Add()
        $range = $p.Range
        $range.Text = $Text
        $range.Font.Name = "Arial"
        $range.Font.Size = $FontSize
        $range.Font.Bold = [int]$Bold
        $range.Font.Italic = [int]$Italic
        if ($Color -ne 0) {
            $range.Font.Color = $Color
        }
        $p.Alignment = $Alignment
        $p.SpaceAfter = $SpaceAfter
        $range.InsertParagraphAfter()
    }

    # Helper function for heading
    function Add-Heading {
        param(
            [string]$Text,
            [int]$Level = 1
        )
        $p = $doc.Paragraphs.Add()
        $range = $p.Range
        $range.Text = $Text
        $range.Font.Name = "Arial"
        $range.Font.Bold = 1
        if ($Level -eq 1) {
            $range.Font.Size = 14
            $range.Font.Color = 8388608 # Deep Navy/Teal approx or 0x800000
            $p.SpaceBefore = 14
            $p.SpaceAfter = 6
        } elseif ($Level -eq 2) {
            $range.Font.Size = 12
            $range.Font.Color = 3289650
            $p.SpaceBefore = 10
            $p.SpaceAfter = 4
        } else {
            $range.Font.Size = 11
            $p.SpaceBefore = 6
            $p.SpaceAfter = 2
        }
        $p.Alignment = 0
        $range.InsertParagraphAfter()
    }

    # Helper function for bullet
    function Add-Bullet {
        param(
            [string]$Text,
            [bool]$BoldPrefix = $false,
            [string]$Prefix = ""
        )
        $p = $doc.Paragraphs.Add()
        $range = $p.Range
        if ($Prefix -ne "") {
            $range.Text = "$([char]0x2022) $Prefix $Text"
        } else {
            $range.Text = "$([char]0x2022) $Text"
        }
        $range.Font.Name = "Arial"
        $range.Font.Size = 10.5
        $p.LeftIndent = 20
        $p.FirstLineIndent = -10
        $p.SpaceAfter = 4
        $p.Alignment = 3 # Justify
        $range.InsertParagraphAfter()
        $p.LeftIndent = 0
        $p.FirstLineIndent = 0
    }

    # ================= TITLE SECTION =================
    Add-Paragraph -Text "PANDUAN STANDAR DAN PROSEDUR OPERASIONAL (SOP)" -FontSize 16 -Bold $true -Alignment 1 -SpaceAfter 4 -Color 8388608
    Add-Paragraph -Text "PENGADAAN DAN PENGEMBANGAN APLIKASI SISTEM INFORMASI" -FontSize 13 -Bold $true -Alignment 1 -SpaceAfter 2 -Color 16711680
    Add-Paragraph -Text "BERBASIS ARSITEKTUR SPBE & PENGADAAN BARANG/JASA PEMERINTAH" -FontSize 11 -Bold $true -Alignment 1 -SpaceAfter 12 -Color 5592405

    # Decorative Horizontal Line / Divider text
    Add-Paragraph -Text "________________________________________________________________________________" -FontSize 9 -Alignment 1 -SpaceAfter 14 -Color 10526880

    # ================= BAB I =================
    Add-Heading -Text "BAB I. LANDASAN HUKUM DAN KETENTUAN REGULASI" -Level 1
    Add-Paragraph -Text "Pengadaan dan pengembangan aplikasi sistem informasi pada instansi pemerintah wajib mematuhi kerangka regulasi nasional berikut:" -FontSize 11 -Alignment 3 -SpaceAfter 6

    Add-Bullet -Text "tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)." -Prefix "Peraturan Presiden RI Nomor 95 Tahun 2018"
    Add-Bullet -Text "tentang Pengadaan Barang/Jasa Pemerintah beserta pedoman perubahannya." -Prefix "Peraturan Presiden RI Nomor 16 Tahun 2018 jo. Perpres Nomor 12 Tahun 2021"
    Add-Bullet -Text "tentang Kebijakan Tata Kelola Satu Data Indonesia (SDI)." -Prefix "Peraturan Presiden RI Nomor 39 Tahun 2019"
    Add-Bullet -Text "tentang Pelindungan Data Pribadi (UU PDP)." -Prefix "Undang-Undang Republik Indonesia Nomor 27 Tahun 2022"
    Add-Bullet -Text "tentang Pedoman Pelaksanaan Pengadaan Barang/Jasa Melalui Penyedia." -Prefix "Peraturan Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah (LKPP) Nomor 12 Tahun 2021"
    Add-Bullet -Text "tentang Pedoman Manajemen Keamanan Informasi SPBE dan Standar Teknis Keamanan Siber." -Prefix "Peraturan BSSN Nomor 4 Tahun 2021"
    Add-Bullet -Text "terkait Tata Kelola TIK, Manajemen Perubahan Aplikasi, dan Arsitektur SPBE." -Prefix "Ketentuan Kebijakan Internal Kementerian/Lembaga"

    # ================= BAB II =================
    Add-Heading -Text "BAB II. PRINSIP UTAMA PENGADAAN APLIKASI SPBE" -Level 1
    Add-Paragraph -Text "Sebelum suatu aplikasi disetujui untuk diadakan atau dikembangkan, wajib memenuhi 5 (lima) Prinsip Pokok SPBE:" -FontSize 11 -Alignment 3 -SpaceAfter 6

    Add-Bullet -Text "Tidak diperkenankan membuat aplikasi baru jika fungsinya telah tersedia pada Aplikasi Umum Nasional (seperti SRIKANDI, SIPD, SP4N-LAPOR!) atau sudah ada aplikasi internal kementerian yang sejenis." -Prefix "1. Keterpaduan & Efisiensi (Anti-Duplikasi):"
    Add-Bullet -Text "Aplikasi wajib menyediakan Application Programming Interface (API/REST/GraphQL) terbuka dan mendukung Sistem Penghubung Layanan Pemerintah (SPLP)." -Prefix "2. Interoperabilitas & Satu Data:"
    Add-Bullet -Text "Seluruh kode program (source code), skema basis data, repositori Git, dan dokumen arsitektur mutlak menjadi aset milik Negara/Instansi (bukan hak milik vendor/penyedia)." -Prefix "3. Kepemilikan Penuh Negara (Source Code & HKI):"
    Add-Bullet -Text "Wajib menerapkan standar keamanan siber (security by design), enkripsi data sensitif, serta lolos audit kerentanan (Vulnerability Assessment & Penetration Test)." -Prefix "4. Keamanan Informasi (Security by Design):"
    Add-Bullet -Text "Menyertakan jaminan masa garansi/pemeliharaan (minimal 3-6 bulan), Service Level Agreement (SLA) dukungan teknis, dan transfer pengetahuan komprehensif kepada ASN teknis." -Prefix "5. Keberlanjutan & Transfer Pengetahuan:"

    # ================= BAB III (FLOWCHART) =================
    Add-Heading -Text "BAB III. FLOWCHART ALUR PERMINTAAN DAN PERSYARATAN" -Level 1
    Add-Paragraph -Text "Berikut adalah bagan alur proses terpadu dari pengajuan kebutuhan oleh unit kerja pemohon hingga penyerahan sistem dan operasional penuh:" -FontSize 11 -Alignment 3 -SpaceAfter 8

    # Insert Image if exists
    if (Test-Path $ImagePath) {
        Write-Host "Menyisipkan gambar flowchart..."
        $imgPara = $doc.Paragraphs.Add()
        $imgRange = $imgPara.Range
        $shape = $imgRange.InlineShapes.AddPicture($ImagePath)
        # Resize shape if too wide (Max width around 450 pt for A4/Letter margins)
        if ($shape.Width -gt 450) {
            $ratio = 450 / $shape.Width
            $shape.Width = 450
            $shape.Height = $shape.Height * $ratio
        }
        $imgPara.Alignment = 1 # Center
        $imgPara.SpaceAfter = 4
        $imgRange.InsertParagraphAfter()

        Add-Paragraph -Text "Gambar 1: Alur Terpadu Permintaan, Verifikasi Teknis, Pengadaan, dan Pengujian Aplikasi SPBE" -FontSize 9.5 -Italic $true -Alignment 1 -SpaceAfter 12 -Color 5592405
    }

    # ================= BAB IV =================
    Add-Heading -Text "BAB IV. RINCIAN TAHAPAN & PERSYARATAN PER FASE" -Level 1

    Add-Heading -Text "4.1 Fase Permintaan & Usulan Kebutuhan (Inisiasi)" -Level 2
    Add-Paragraph -Text "Pelaksana: Unit Kerja Pemohon (Bagian/Subbag/Seksi Pengguna)." -FontSize 10.5 -Italic $true -SpaceAfter 4
    Add-Paragraph -Text "Dokumen yang wajib disiapkan:" -FontSize 10.5 -Bold $true -SpaceAfter 2
    Add-Bullet -Text "Surat Permohonan Resmi / Nota Dinas ditandatangani minimal Pejabat Administrator (Eselon III) atau Pimpinan Satuan Kerja."
    Add-Bullet -Text "Formulir Usulan Permintaan Sistem Informasi yang memuat latar belakang masalah, proses bisnis (SOP), estimasi pengguna, serta volume transaksi data."

    Add-Heading -Text "4.2 Fase Penilaian Kelayakan Teknis & Verifikasi SPBE" -Level 2
    Add-Paragraph -Text "Pelaksana: Tim Koordinasi SPBE / Unit Pengelola TIK (Pusdatin / Pranata Komputer)." -FontSize 10.5 -Italic $true -SpaceAfter 4
    Add-Paragraph -Text "Kriteria pengujian kelaikan:" -FontSize 10.5 -Bold $true -SpaceAfter 2
    Add-Bullet -Text "Pengecekan Redudansi: Memastikan tidak ada duplikasi fungsi dengan aplikasi eksisting kementerian maupun aplikasi umum nasional."
    Add-Bullet -Text "Kesesuaian Arsitektur Data: Mendukung format baku Satu Data Indonesia dan tersedianya skema API/SPLP."
    Add-Bullet -Text "Infrastruktur & Domain: Penilaian kapasitas Pusat Data Nasional / Cloud pemerintah dan kesiapan domain instansi resmi (*.go.id)."
    Add-Bullet -Text "Penerbitan Surat Rekomendasi Teknis TIK sebagai prasyarat mutlak alokasi anggaran pengadaan."

    Add-Heading -Text "4.3 Fase Penyusunan Dokumen Pengadaan Barang/Jasa" -Level 2
    Add-Paragraph -Text "Pelaksana: Pejabat Pembuat Komitmen (PPK) dibantu Tim Teknis." -FontSize 10.5 -Italic $true -SpaceAfter 4
    Add-Bullet -Text "Kerangka Acuan Kerja (KAK / TOR): Memuat latar belakang, target capaian, ruang lingkup modul, spesifikasi platform teknologi, jadwal pelaksanaan, dan keahlian tenaga ahli."
    Add-Bullet -Text "Harga Perkiraan Sendiri (HPS): Dihitung secara wajar berdasarkan metode analisis man-month atau Function Point Analysis sesuai standar biaya masukan pemerintah."
    Add-Bullet -Text "Rancangan Kontrak Khusus: Wajib menyertakan klausul Penyerahan Penuh Source Code, Non-Disclosure Agreement (NDA), dan masa pemeliharaan resmi."

    Add-Heading -Text "4.4 Fase Eksekusi Pengembangan & Pengendalian Mutu" -Level 2
    Add-Paragraph -Text "Pelaksana: Tim Pengembang (Penyedia Jasa / Swakelola) dan Tim Pengawas." -FontSize 10.5 -Italic $true -SpaceAfter 4
    Add-Bullet -Text "Menerapkan metodologi pengembangan terstruktur (Agile / Waterfall) dengan pelaporan berkala (Weekly/Sprint Report)."
    Add-Bullet -Text "Memisahkan lingkungan server uji coba (Staging/Dev) secara ketat dari server produksi (Production)."

    Add-Heading -Text "4.5 Fase Uji Kelaikan, Keamanan & Serah Terima" -Level 2
    Add-Paragraph -Text "Pelaksana: Tim Pengembang, Unit Pemohon, dan Tim Keamanan Siber (CSIRT)." -FontSize 10.5 -Italic $true -SpaceAfter 4
    Add-Bullet -Text "User Acceptance Test (UAT): Pengujian fungsi seluruh fitur sesuai skenario uji, disahkan melalui Berita Acara UAT."
    Add-Bullet -Text "Security Vulnerability Assessment (Pentest): Pengujian kerentanan aplikasi terhadap celah keamanan (OWASP Top 10). Seluruh temuan level High/Critical wajib diperbaiki."
    Add-Bullet -Text "Alih Pengetahuan (Knowledge Transfer): Pelatihan teknis administrator sistem dan bimbingan teknis bagi pengguna akhir."
    Add-Bullet -Text "Serah Terima (BAST): Penyerahan repositori Git, skema database, buku manual, serta pendaftaran pada katalog SI-SPBE."

    # ================= BAB V (TABEL CHECKLIST) =================
    Add-Heading -Text "BAB V. MATRIKS CHECKLIST VERIFIKASI KELENGKAPAN" -Level 1
    Add-Paragraph -Text "Lembar verifikasi dokumen administratif dan teknis kelayakan pengadaan aplikasi:" -FontSize 11 -SpaceAfter 8

    # Create Table: 13 rows, 4 columns
    $tablePara = $doc.Paragraphs.Add()
    $table = $doc.Tables.Add($tablePara.Range, 14, 4)
    $table.Borders.Enable = 1
    $table.Borders.InsideColor = 11184810
    $table.Borders.OutsideColor = 8388608

    # Set column widths
    $table.Columns.Item(1).Width = 35   # No
    $table.Columns.Item(2).Width = 180  # Dokumen
    $table.Columns.Item(3).Width = 195  # Standar
    $table.Columns.Item(4).Width = 50   # Status

    # Header Row
    $headers = @("No", "Komponen Dokumen & Persyaratan", "Standar Ketentuan", "Status")
    for ($c = 1; $c -le 4; $c++) {
        $cell = $table.Cell(1, $c)
        $cell.Range.Text = $headers[$c - 1]
        $cell.Range.Font.Bold = 1
        $cell.Range.Font.Name = "Arial"
        $cell.Range.Font.Size = 9.5
        $cell.Range.Font.Color = 16777215 # White
        $cell.Shading.BackgroundPatternColor = 8388608 # Deep Navy
        $cell.VerticalAlignment = 1 # Center
        if ($c -eq 1 -or $c -eq 4) { $cell.Range.ParagraphFormat.Alignment = 1 }
    }

    $checklistData = @(
        @("A", "TAHAP PERMINTAAN (INISIASI)", "Persyaratan Kelayakan Awal", ""),
        @("1", "Surat Permohonan / Nota Dinas", "Ditandatangani minimal Pejabat Eselon III / KPA", "[   ]"),
        @("2", "Formulir Justifikasi Kebutuhan", "Memuat SOP proses bisnis & estimasi volume pengguna", "[   ]"),
        @("3", "Surat Rekomendasi Teknis TIK SPBE", "Diterbitkan resmi oleh Unit Pengelola TIK / Pusdatin", "[   ]"),
        @("B", "DOKUMEN PENGADAAN (PPK)", "Persyaratan Pelaksanaan Pengadaan", ""),
        @("4", "Kerangka Acuan Kerja (KAK / TOR)", "Spesifikasi modul, SLA, platform teknologi, dan ahli", "[   ]"),
        @("5", "Dokumen HPS & Kertas Kerja Biaya", "Dihitung berbasis SBM / Function Point Analysis", "[   ]"),
        @("6", "Klausul Kepemilikan Source Code & NDA", "Hak cipta mutlak milik instansi; NDA kerahasiaan", "[   ]"),
        @("C", "DOKUMEN HASIL AKHIR & SERAH TERIMA", "Persyaratan Kelaikan Operasional", ""),
        @("7", "Full Source Code & Repositori Git", "Repositori bersih, bebas hardcoded credentials", "[   ]"),
        @("8", "Berita Acara User Acceptance Test (BA UAT)", "Diteken unit pemohon dengan pemenuhan 100%", "[   ]"),
        @("9", "Laporan Uji Keamanan Siber (Pentest)", "Bebas kerentanan kategori High & Critical", "[   ]"),
        @("10", "Buku Panduan (User & Admin Manual)", "Format PDF dengan ilustrasi visual bertahap", "[   ]"),
        @("11", "Berita Acara Serah Terima (BAST) & Garansi", "Masa pemeliharaan resmi aktif dan terdaftar SI-SPBE", "[   ]")
    )

    for ($i = 0; $i -lt $checklistData.Count; $i++) {
        $rowIdx = $i + 2
        $row = $checklistData[$i]
        $isSection = ($row[0] -match "^[A-C]$")

        for ($c = 1; $c -le 4; $c++) {
            $cell = $table.Cell($rowIdx, $c)
            $cell.Range.Text = $row[$c - 1]
            $cell.Range.Font.Name = "Arial"
            $cell.Range.Font.Size = 9
            $cell.VerticalAlignment = 1

            if ($isSection) {
                $cell.Range.Font.Bold = 1
                $cell.Shading.BackgroundPatternColor = 14474460 # Light Gray
                if ($c -eq 1) { $cell.Range.ParagraphFormat.Alignment = 1 }
            } else {
                if ($c -eq 1 -or $c -eq 4) {
                    $cell.Range.ParagraphFormat.Alignment = 1 # Center
                } else {
                    $cell.Range.ParagraphFormat.Alignment = 0 # Left
                }
            }
        }
    }

    $tablePara.Range.InsertParagraphAfter()
    Add-Paragraph -Text "" -FontSize 6 -SpaceAfter 6

    # ================= BAB VI =================
    Add-Heading -Text "BAB VI. TEMPLATE FORMULIR PERMINTAAN PENGADAAN APLIKASI" -Level 1
    Add-Paragraph -Text "Format template di bawah ini dapat disalin untuk lampiran nota dinas permohonan:" -FontSize 11 -SpaceAfter 6

    $formBox = $doc.Paragraphs.Add()
    $formTable = $doc.Tables.Add($formBox.Range, 1, 1)
    $formTable.Borders.Enable = 1
    $formTable.Borders.OutsideColor = 10526880
    $formTable.Columns.Item(1).Width = 460
    $cellBox = $formTable.Cell(1, 1)
    $cellBox.Shading.BackgroundPatternColor = 15921906 # Very light gray

    $formText = @"
FORMULIR USULAN PERMINTAAN SISTEM INFORMASI

I. INFORMASI UNIT KERJA PEMOHON
1. Nama Unit Kerja          : ............................................................................
2. Penanggung Jawab / PIC   : ............................................................................
3. NIP / Jabatan            : ............................................................................
4. Kontak HP / Email Dinas  : ............................................................................

II. IDENTIFIKASI KEBUTUHAN SISTEM
1. Nama Usulan Aplikasi     : ............................................................................
2. Kategori Layanan         : [  ] Layanan Administrasi Pemerintahan (G2G/Internal)
                              [  ] Layanan Publik Masyarakat (G2C/Eksternal)
3. Permasalahan Proses Kerja: (Uraikan kendala operasional saat ini secara ringkas)
4. Target Pengguna          : [  ] Staf Teknis   [  ] Pimpinan   [  ] Masyarakat Umum
5. Estimasi Jumlah Pengguna : ............. Pengguna aktif harian

III. KELAYAKAN TEKNIS & INTEGRASI
1. Kebutuhan Integrasi      : Apakah memerlukan integrasi sistem lain? [  ] Ya  [  ] Tidak
   Sebutkan nama sistem     : ............................................................................
2. Kategori Data Dikelola   : [  ] Data Terbuka   [  ] Data Terbatas   [  ] Rahasia Negara
3. Target Waktu Pemanfaatan : Triwulan ..... Tahun Anggaran ...........

Diusulkan oleh,                              Diverifikasi oleh (Tim SPBE/TIK),
Pimpinan Unit Kerja Pemohon                  Pranata Komputer / Pengelola TIK


(.......................................)     (.......................................)
NIP.                                          NIP.
"@
    $cellBox.Range.Text = $formText
    $cellBox.Range.Font.Name = "Consolas"
    $cellBox.Range.Font.Size = 8.5
    $formBox.Range.InsertParagraphAfter()

    Write-Host "Menyimpan dokumen ke $OutputPath..."
    # 16 = wdFormatXMLDocument (.docx)
    $doc.SaveAs([ref]$OutputPath, [ref]16)
    $doc.Close()
    $word.Quit()

    # Release COM object
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    Write-Host "DOKUMEN_BERHASIL_DIBUAT"
} catch {
    Write-Error $_.Exception.Message
    if ($word) { $word.Quit() }
}
