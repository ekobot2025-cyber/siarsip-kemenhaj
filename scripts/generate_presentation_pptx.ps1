# Script to generate PowerPoint (.pptx) Presentation for SI-ARSIP Socialization
param(
    [string]$ImagePath = "d:\8 PROJECT\2026\DEV\KEMENHAJ\SiArsip_Kemenhaj\flowchart_aplikasi_siarsip.png",
    [string]$OutputPath = "d:\8 PROJECT\2026\DEV\KEMENHAJ\SiArsip_Kemenhaj\SOSIALISASI_APLIKASI_SIARSIP.pptx",
    [string]$DesktopPath = "C:\Users\ACER\Desktop\SOSIALISASI_APLIKASI_SIARSIP.pptx"
)

try {
    Write-Host "Menginisialisasi PowerPoint COM Object..."
    $ppt = New-Object -ComObject PowerPoint.Application
    $pres = $ppt.Presentations.Add([Microsoft.Office.Core.MsoTriState]::msoTrue)

    # Set 16:9 Widescreen (960 pt x 540 pt)
    $pres.PageSetup.SlideWidth = 960
    $pres.PageSetup.SlideHeight = 540

    # Colors (BGR values)
    $C_CHARCOAL  = 1053722    # RGB(26, 20, 16)
    $C_GOLD      = 6398409    # RGB(201, 169, 97)
    $C_NAVY      = 5844007    # RGB(15, 44, 89)
    $C_IVORY     = 16120314   # RGB(250, 249, 245)
    $C_WHITE     = 16777215   # White
    $C_TEXT_DARK = 2696481    # RGB(33, 37, 41)
    $C_TEXT_MUTED= 8222060    # RGB(108, 117, 125)
    $C_GREEN     = 3433750    # RGB(22, 101, 52)
    $C_BORDER    = 15722722   # RGB(226, 232, 240)
    $C_SOFT_BLUE = 16579835   # Very soft blue

    # Helper: Set Slide Background
    function Set-SlideBg {
        param($Slide, [int]$Color)
        $Slide.FollowMasterBackground = [Microsoft.Office.Core.MsoTriState]::msoFalse
        $Slide.Background.Fill.Solid()
        $Slide.Background.Fill.ForeColor.RGB = $Color
    }

    # Helper: Add Header Bar to Content Slides
    function Add-SlideHeader {
        param($Slide, [string]$Title, [string]$Category = "SI-ARSIP PAPUA • KEMENHAJ / KANWIL KEMENAG")
        
        $banner = $Slide.Shapes.AddShape(1, 0, 0, 960, 68)
        $banner.Fill.Solid()
        $banner.Fill.ForeColor.RGB = $C_NAVY
        $banner.Line.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse

        $line = $Slide.Shapes.AddShape(1, 0, 68, 960, 3)
        $line.Fill.Solid()
        $line.Fill.ForeColor.RGB = $C_GOLD
        $line.Line.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse

        $catBox = $Slide.Shapes.AddTextbox(1, 40, 8, 880, 18)
        $catBox.TextFrame.TextRange.Text = $Category.ToUpper()
        $catBox.TextFrame.TextRange.Font.Name = "Arial"
        $catBox.TextFrame.TextRange.Font.Size = 9
        $catBox.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $catBox.TextFrame.TextRange.Font.Color.RGB = $C_GOLD
        $catBox.TextFrame.MarginLeft = 0; $catBox.TextFrame.MarginTop = 0

        $titleBox = $Slide.Shapes.AddTextbox(1, 40, 26, 880, 34)
        $titleBox.TextFrame.TextRange.Text = $Title
        $titleBox.TextFrame.TextRange.Font.Name = "Arial"
        $titleBox.TextFrame.TextRange.Font.Size = 18
        $titleBox.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $titleBox.TextFrame.TextRange.Font.Color.RGB = $C_WHITE
        $titleBox.TextFrame.MarginLeft = 0; $titleBox.TextFrame.MarginTop = 0

        $footerBox = $Slide.Shapes.AddTextbox(1, 40, 515, 880, 20)
        $footerBox.TextFrame.TextRange.Text = "Sosialisasi SI-ARSIP Papua | https://siarsip-kemenhaj.vercel.app"
        $footerBox.TextFrame.TextRange.Font.Name = "Arial"
        $footerBox.TextFrame.TextRange.Font.Size = 8.5
        $footerBox.TextFrame.TextRange.Font.Color.RGB = $C_TEXT_MUTED
    }

    # Helper: Add Card Box
    function Add-Card {
        param(
            $Slide,
            [float]$Left,
            [float]$Top,
            [float]$Width,
            [float]$Height,
            [string]$Title,
            [string]$Body,
            [int]$BorderColor = 15722722,
            [int]$BgColor = 16777215,
            [int]$TitleColor = 5844007
        )
        
        $card = $Slide.Shapes.AddShape(1, $Left, $Top, $Width, $Height)
        $card.Fill.Solid()
        $card.Fill.ForeColor.RGB = $BgColor
        $card.Line.ForeColor.RGB = $BorderColor
        $card.Line.Weight = 1.5

        if ($Title -ne "") {
            $tBox = $Slide.Shapes.AddTextbox(1, ($Left + 14), ($Top + 12), ($Width - 28), 26)
            $tBox.TextFrame.TextRange.Text = $Title
            $tBox.TextFrame.TextRange.Font.Name = "Arial"
            $tBox.TextFrame.TextRange.Font.Size = 11.5
            $tBox.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
            $tBox.TextFrame.TextRange.Font.Color.RGB = $TitleColor
            $tBox.TextFrame.MarginLeft = 0; $tBox.TextFrame.MarginTop = 0
        }

        if ($Body -ne "") {
            $bTop = if ($Title -ne "") { $Top + 40 } else { $Top + 12 }
            $bHeight = if ($Title -ne "") { $Height - 50 } else { $Height - 24 }
            $bBox = $Slide.Shapes.AddTextbox(1, ($Left + 14), $bTop, ($Width - 28), $bHeight)
            $bBox.TextFrame.TextRange.Text = $Body
            $bBox.TextFrame.TextRange.Font.Name = "Arial"
            $bBox.TextFrame.TextRange.Font.Size = 9.5
            $bBox.TextFrame.TextRange.Font.Color.RGB = $C_TEXT_DARK
            $bBox.TextFrame.WordWrap = [Microsoft.Office.Core.MsoTriState]::msoTrue
            $bBox.TextFrame.MarginLeft = 0; $bBox.TextFrame.MarginTop = 0
        }
    }

    # ==============================================================
    # SLIDE 1: COVER
    # ==============================================================
    Write-Host "Membuat Slide 1: Cover..."
    $s1 = $pres.Slides.Add(1, 12)
    Set-SlideBg -Slide $s1 -Color $C_CHARCOAL

    $borderS1 = $s1.Shapes.AddShape(1, 40, 40, 880, 460)
    $borderS1.Fill.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse
    $borderS1.Line.ForeColor.RGB = $C_GOLD
    $borderS1.Line.Weight = 2

    $hInst = $s1.Shapes.AddTextbox(1, 60, 65, 840, 40)
    $hInst.TextFrame.TextRange.Text = "KEMENTERIAN AGAMA / KEMENTERIAN HAJI DAN UMRAH RI`nKANTOR WILAYAH PROVINSI PAPUA"
    $hInst.TextFrame.TextRange.Font.Name = "Arial"
    $hInst.TextFrame.TextRange.Font.Size = 12
    $hInst.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $hInst.TextFrame.TextRange.Font.Color.RGB = $C_GOLD
    $hInst.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    $mTitle = $s1.Shapes.AddTextbox(1, 60, 140, 840, 70)
    $mTitle.TextFrame.TextRange.Text = "SI-ARSIP PAPUA"
    $mTitle.TextFrame.TextRange.Font.Name = "Arial"
    $mTitle.TextFrame.TextRange.Font.Size = 40
    $mTitle.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $mTitle.TextFrame.TextRange.Font.Color.RGB = $C_WHITE
    $mTitle.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    $subTitle = $s1.Shapes.AddTextbox(1, 60, 215, 840, 50)
    $subTitle.TextFrame.TextRange.Text = "Sistem Informasi Arsip dan Persuratan Digital Terpadu"
    $subTitle.TextFrame.TextRange.Font.Name = "Arial"
    $subTitle.TextFrame.TextRange.Font.Size = 18
    $subTitle.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $subTitle.TextFrame.TextRange.Font.Color.RGB = $C_GOLD
    $subTitle.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    $descBox = $s1.Shapes.AddTextbox(1, 120, 280, 720, 70)
    $descBox.TextFrame.TextRange.Text = "Sosialisasi & Bimbingan Teknis Tata Kelola Persuratan Masuk/Keluar, Lembar Disposisi Kakanwil, dan E-Arsip Digital Terpadu 5 Unit Kerja"
    $descBox.TextFrame.TextRange.Font.Name = "Arial"
    $descBox.TextFrame.TextRange.Font.Size = 13
    $descBox.TextFrame.TextRange.Font.Color.RGB = $C_IVORY
    $descBox.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    $urlCard = $s1.Shapes.AddShape(1, 260, 380, 440, 44)
    $urlCard.Fill.Solid()
    $urlCard.Fill.ForeColor.RGB = $C_NAVY
    $urlCard.Line.ForeColor.RGB = $C_GOLD
    $urlCard.Line.Weight = 1.5

    $urlBox = $s1.Shapes.AddTextbox(1, 260, 390, 440, 30)
    $urlBox.TextFrame.TextRange.Text = "Akses Aplikasi: https://siarsip-kemenhaj.vercel.app"
    $urlBox.TextFrame.TextRange.Font.Name = "Arial"
    $urlBox.TextFrame.TextRange.Font.Size = 11
    $urlBox.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $urlBox.TextFrame.TextRange.Font.Color.RGB = $C_WHITE
    $urlBox.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    $yBox = $s1.Shapes.AddTextbox(1, 60, 455, 840, 25)
    $yBox.TextFrame.TextRange.Text = "Jayapura, Papua | Tahun Anggaran 2026"
    $yBox.TextFrame.TextRange.Font.Name = "Arial"
    $yBox.TextFrame.TextRange.Font.Size = 10
    $yBox.TextFrame.TextRange.Font.Color.RGB = $C_TEXT_MUTED
    $yBox.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    # ==============================================================
    # SLIDE 2: LATAR BELAKANG & TANTANGAN PERSURATAN
    # ==============================================================
    Write-Host "Membuat Slide 2: Latar Belakang..."
    $s2 = $pres.Slides.Add(2, 12)
    Set-SlideBg -Slide $s2 -Color $C_IVORY
    Add-SlideHeader -Slide $s2 -Title "Latar Belakang & Transformasi Digital Persuratan"

    Add-Card -Slide $s2 -Left 40 -Top 95 -Width 275 -Height 185 `
        -Title "1. Risiko Dokumen Fisik" `
        -Body "• Surat fisik rentan terselip, rusak, atau tercecer saat proses sirkulasi.`n• Penumpukan berkas lemari arsip memakan ruang kerja kantor.`n• Waktu pencarian dokumen fisik lama (bisa berjam-jam/berhari-hari)." `
        -BorderColor 13421823 -TitleColor 255

    Add-Card -Slide $s2 -Left 342 -Top 95 -Width 275 -Height 185 `
        -Title "2. Kendala Disposisi Manual" `
        -Body "• Keterlambatan tindak lanjut surat mendesak/segera jika pimpinan sedang tugas luar daerah.`n• Lembar disposisi manual berisiko hilang dari bundel surat asli.`n• Sulit melacak status apakah disposisi sudah ditindaklanjuti seksi." `
        -BorderColor 13421823 -TitleColor 255

    Add-Card -Slide $s2 -Left 645 -Top 95 -Width 275 -Height 185 `
        -Title "3. Tata Kelola Terfragmentasi" `
        -Body "• Format penomoran agenda persuratan rentan terjadi nomor ganda.`n• Pengarsipan dokumen unit kerja (SPJ, SK, Paspor) masih terpencar di laptop masing-masing staf.`n• Tidak adanya jejak rekam (audit trail) akses data." `
        -BorderColor 13421823 -TitleColor 255

    $bSol = "Platform terintegrasi yang mendigitalkan seluruh siklus pengelolaan surat dan arsip fisik Kanwil Kemenag Papua:`n`n1. Penerbitan Nomor Agenda Otomatis (SM/2026/00001 & SK/2026/00001) yang mencegah nomor ganda.`n2. Cetak Lembar Disposisi Resmi Berkop Kanwil Kemenag Papua yang print-ready.`n3. Fitur Jembatan 1-Klik Zero Re-Upload: Memindahkan surat masuk menjadi E-Arsip permanen tanpa unggah ulang.`n4. Repositori Digital 5 Unit Kerja dengan proteksi keamanan RBAC 4 tingkat dan Integrated PDF Viewer."
    Add-Card -Slide $s2 -Left 40 -Top 305 -Width 880 -Height 185 `
        -Title "Solusi Digital: SI-ARSIP PAPUA" `
        -Body $bSol `
        -BorderColor $C_GOLD -BgColor $C_SOFT_BLUE -TitleColor $C_NAVY

    # ==============================================================
    # SLIDE 3: 5 UNIT KERJA TERPADU
    # ==============================================================
    Write-Host "Membuat Slide 3: Ekosistem 5 Unit Kerja..."
    $s3 = $pres.Slides.Add(3, 12)
    Set-SlideBg -Slide $s3 -Color $C_IVORY
    Add-SlideHeader -Slide $s3 -Title "Struktur Organisasi & 5 Unit Kerja Terpadu"

    $s3Sub = $s3.Shapes.AddTextbox(1, 40, 78, 880, 24)
    $s3Sub.TextFrame.TextRange.Text = "Seluruh dokumen arsip dikelompokkan secara terstruktur berdasarkan 5 pilar unit kerja:"
    $s3Sub.TextFrame.TextRange.Font.Name = "Arial"; $s3Sub.TextFrame.TextRange.Font.Size = 10.5
    $s3Sub.TextFrame.TextRange.Font.Color.RGB = $C_TEXT_MUTED

    $uW = 166; $uGap = 12; $uTop = 110; $uH = 370
    
    Add-Card -Slide $s3 -Left 40 -Top $uTop -Width $uW -Height $uH `
        -Title "KEUANGAN`n(KEU)" `
        -Body "Pengelolaan Arsip Anggaran:`n`n• SPJ Belanja Operasional`n• SPM & SP2D Pencairan`n• Bukti Kwitansi Sah`n• Laporan Keuangan SAKTI`n• DIPA Petikan Kanwil`n• Dokumen Pajak Setoran`n`nAdmin Unit:`nKornelia Wanggai, S.E." `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    Add-Card -Slide $s3 -Left (40 + ($uW+$uGap)*1) -Top $uTop -Width $uW -Height $uH `
        -Title "KEPEGAWAIAN`n(PEG)" `
        -Body "Pengelolaan Berkas ASN:`n`n• SK Kenaikan Pangkat`n• SK Jabatan & Agen WBK`n• KGB (Kenaikan Gaji Berkala)`n• Cuti & Izin Pegawai`n• Penilaian SKP Tahunan`n• Berkas Pensiun & Mutasi`n`nAdmin Unit:`nMarkus Kogoya, S.IP" `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    Add-Card -Slide $s3 -Left (40 + ($uW+$uGap)*2) -Top $uTop -Width $uW -Height $uH `
        -Title "UMUM & HUMAS`n(UMH)" `
        -Body "Tata Usaha & Humas:`n`n• Surat Masuk Eksternal`n• Surat Keluar Kanwil`n• Undangan Upacara/HAB`n• Nota Dinas Internal`n• Siaran Pers & Liputan`n• Aset BMN & Inventaris`n`nAdmin Unit:`nDewi Sartika Wanimbo" `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    Add-Card -Slide $s3 -Left (40 + ($uW+$uGap)*3) -Top $uTop -Width $uW -Height $uH `
        -Title "PERENCANAAN`n(REN)" `
        -Body "Rencana & Evaluasi:`n`n• Dokumen RKA-K/L`n• DIPA 29 Kemenag Kab/Kota`n• KAK / TOR & RAB Kegiatan`n• Revisi Anggaran Matriks`n• Laporan Kinerja Tahunan`n• Monev Capaian SMART`n`nAdmin Unit:`nBudi Santoso, S.E." `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    Add-Card -Slide $s3 -Left (40 + ($uW+$uGap)*4) -Top $uTop -Width $uW -Height $uH `
        -Title "BIDANG HAJI`n(HAJI)" `
        -Body "Pelayanan Ibadah Haji:`n`n• Data Jemaah Haji Papua`n• Berkas Paspor & Bio Visa`n• Bimbingan Manasik Haji`n• Manifes Kloter Embarkasi`n• SK Petugas PHD / TPHI`n• Laporan Evaluasi Haji`n`nAdmin Unit:`nUst. Ridwan Mansur" `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    # ==============================================================
    # SLIDE 4: FLOWCHART ALUR KERJA TERPADU
    # ==============================================================
    Write-Host "Membuat Slide 4: Flowchart Alur Kerja..."
    $s4 = $pres.Slides.Add(4, 12)
    Set-SlideBg -Slide $s4 -Color $C_IVORY
    Add-SlideHeader -Slide $s4 -Title "Bagan Alur Kerja Terpadu (Workflow Diagram)"

    if (Test-Path $ImagePath) {
        $null = $s4.Shapes.AddPicture($ImagePath, 0, -1, [float]40, [float]85, [float]520, [float]410)
    }

    $bFlow = "1. Surat Masuk & Disposisi:`nPetugas menginput surat fisik, mengunggah scan PDF, dan sistem menerbitkan Nomor Agenda otomatis (SM/YYYY/XXXXX). Pimpinan mengisi instruksi pada lembar disposisi berkop Kanwil.`n`n2. Jembatan 1-Klik Zero Re-Upload:`nSurat yang selesai ditindaklanjuti langsung disimpan menjadi E-Arsip permanen tanpa perlu unggah ulang file.`n`n3. Surat Keluar & Register Agenda:`nSurat dinas keluar dicatat, diunggah naskah finalnya, dan otomatis terangkum dalam Buku Agenda Digital.`n`n4. E-Arsip Digital & Pencarian Cepat:`nSeluruh berkas tersimpan aman di cloud repositori terpusat dan dapat ditemukan dalam hitungan detik."
    Add-Card -Slide $s4 -Left 580 -Top 85 -Width 340 -Height 410 `
        -Title "4 Siklus Terintegrasi" `
        -Body $bFlow `
        -BorderColor $C_GOLD -TitleColor $C_NAVY

    # ==============================================================
    # SLIDE 5: MODUL SURAT MASUK & LEMBAR DISPOSISI
    # ==============================================================
    Write-Host "Membuat Slide 5: Modul Surat Masuk & Disposisi..."
    $s5 = $pres.Slides.Add(5, 12)
    Set-SlideBg -Slide $s5 -Color $C_IVORY
    Add-SlideHeader -Slide $s5 -Title "Modul Persuratan Masuk & Lembar Disposisi Kakanwil"

    Add-Card -Slide $s5 -Left 40 -Top 95 -Width 425 -Height 190 `
        -Title "1. Pencatatan Metadata & Nomor Agenda Otomatis" `
        -Body "• Pengisian nomor surat asli, tanggal terbit, tanggal diterima, instansi pengirim, dan perihal.`n• Sifat surat: Biasa, Penting, Segera, Rahasia.`n• Sistem menghasilkan Nomor Agenda resmi otomatis berurutan (SM/2026/00001).`n• Bebas dari risiko nomor agenda ganda / terlompat." `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    Add-Card -Slide $s5 -Left 495 -Top 95 -Width 425 -Height 190 `
        -Title "2. Unggah Scan PDF & Pratinjau Dokumen" `
        -Body "• Dukungan drag-and-drop file scan PDF surat masuk.`n• Pratinjau dokumen langsung di peramban tanpa harus mengunduh file.`n• Terhubung langsung dengan dokumen fisik pendukung resmi." `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    Add-Card -Slide $s5 -Left 40 -Top 305 -Width 425 -Height 185 `
        -Title "3. Lembar Disposisi Kakanwil Print-Ready" `
        -Body "• Lembar disposisi resmi ber-Kop Kantor Wilayah Kementerian Agama Provinsi Papua.`n• Pilihan instruksi: Tindak Lanjuti, Koordinasikan, Hadiri/Wakilkan, Siapkan Sambutan, Arsip.`n• Catatan arahan pimpinan tercetak rapi untuk diserahkan ke unit kerja pelaksana." `
        -BorderColor $C_GOLD -TitleColor $C_NAVY

    Add-Card -Slide $s5 -Left 495 -Top 305 -Width 425 -Height 185 `
        -Title "4. Jembatan 1-Klik Zero Re-Upload ke E-Arsip" `
        -Body "• Surat yang selesai diproses tidak perlu diinput atau di-upload ulang.`n• Cukup klik tombol 'Jadikan E-Arsip', seluruh berkas scan PDF dan data surat otomatis masuk ke Repositori E-Arsip Kanwil.`n• Efisiensi waktu staf 100% lebih cepat." `
        -BorderColor $C_GREEN -TitleColor $C_GREEN

    # ==============================================================
    # SLIDE 6: MODUL SURAT KELUAR & BUKU AGENDA
    # ==============================================================
    Write-Host "Membuat Slide 6: Modul Surat Keluar & Buku Agenda..."
    $s6 = $pres.Slides.Add(6, 12)
    Set-SlideBg -Slide $s6 -Color $C_IVORY
    Add-SlideHeader -Slide $s6 -Title "Modul Persuratan Keluar & Buku Agenda Persuratan"

    $bSK = "Fasilitas penerbitan dan pengarsipan naskah dinas keluar:`n`n1. Registrasi Nomor Surat Keluar Resmi:`nMencatat nomor dinas (contoh: S-1110/KW.33/2026 dan S-1077/KW.33/2026), tanggal surat, dan unit kerja penerbit.`n`n2. Penomoran Agenda Keluar Otomatis:`nSistem menerbitkan nomor agenda standar (SK/2026/00001, SK/2026/00002) secara berurutan.`n`n3. Unggah Naskah Final Bertanda Tangan:`nMenyimpan file PDF surat resmi yang telah ditandatangani dan dicap basah / barcode TTE.`n`n4. Dokumentasi Tujuan & Instansi Penerima:`nMencatat pihak tujuan (Sekjen Kemenhaj RI, Narasumber, Bupati, OPD, Majelis Agama)."
    Add-Card -Slide $s6 -Left 40 -Top 95 -Width 425 -Height 395 `
        -Title "Administrasi Surat Keluar Dinas" `
        -Body $bSK `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    $bAgenda = "Buku register terpadu pengganti buku ekspedisi manual kertas:`n`n1. Tab Terpadu Masuk & Keluar:`nBeralih cepat antara register Surat Masuk dan Surat Keluar hanya dalam 1 klik.`n`n2. Pencarian Cerdas Multi-Parameter:`nPencarian instan berdasarkan nomor agenda, nomor surat, perihal, instansi pengirim, atau penerima.`n`n3. Fitur Cetak Register Resmi:`nMencetak lembar buku register agenda sewaktu-waktu untuk pelaporan dinas atau arsip fisik berkala.`n`n4. Ekspor Rekapitulasi Excel (.xlsx):`nMengunduh rekapitulasi data persuratan ke format lembar kerja Excel untuk analisis dan pelaporan kinerja."
    Add-Card -Slide $s6 -Left 495 -Top 95 -Width 425 -Height 395 `
        -Title "Buku Agenda Persuratan Digital" `
        -Body $bAgenda `
        -BorderColor $C_GOLD -TitleColor $C_NAVY

    # ==============================================================
    # SLIDE 7: MODUL E-ARSIP DIGITAL
    # ==============================================================
    Write-Host "Membuat Slide 7: Modul E-Arsip Digital..."
    $s7 = $pres.Slides.Add(7, 12)
    Set-SlideBg -Slide $s7 -Color $C_IVORY
    Add-SlideHeader -Slide $s7 -Title "Repositori E-Arsip Digital & Pencarian Cepat"

    Add-Card -Slide $s7 -Left 40 -Top 95 -Width 275 -Height 395 `
        -Title "1. Standar Metadata" `
        -Body "Setiap berkas tersimpan dengan atribut lengkap:`n`n• Kode Arsip Unik (contoh: ARS/KEU/2026/00001)`n• Unit Kerja Pengelola`n• Kategori Klasifikasi Baku`n• Nomor & Judul Dokumen`n• Tanggal & Tahun Berkas`n• Ringkasan & Kata Kunci (Tags)`n• Masa Retensi Arsip" `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    Add-Card -Slide $s7 -Left 342 -Top 95 -Width 275 -Height 395 `
        -Title "2. Keamanan Dokumen" `
        -Body "4 Tingkat Kerahasiaan Berkas:`n`n• PUBLIK:`nDapat diakses seluruh ASN/staf kanwil.`n`n• INTERNAL:`nKhusus operasional kedinasan kantor.`n`n• TERBATAS:`nHanya unit kerja penanggung jawab berkas.`n`n• RAHASIA:`nHanya Pimpinan & Super Admin." `
        -BorderColor $C_GOLD -TitleColor $C_NAVY

    Add-Card -Slide $s7 -Left 645 -Top 95 -Width 275 -Height 395 `
        -Title "3. Penemuan Kembali" `
        -Body "Kemudahan Temu Kembali Arsip:`n`n• Pencarian Cerdas Instan:`nKetik nomor atau kata kunci perihal, hasil muncul seketika.`n`n• Filter Multi-Dimensi:`nFilter per unit, kategori klasifikasi, tahun, dan tingkat keamanan.`n`n• Integrated PDF Viewer:`nPratinjau langsung di layar.`n`n• Fitur Berkas Favorit." `
        -BorderColor $C_GREEN -TitleColor $C_GREEN

    # ==============================================================
    # SLIDE 8: DATA RIIL CONTOH SURAT
    # ==============================================================
    Write-Host "Membuat Slide 8: Data Riil Surat..."
    $s8 = $pres.Slides.Add(8, 12)
    Set-SlideBg -Slide $s8 -Color $C_IVORY
    Add-SlideHeader -Slide $s8 -Title "Data Riil Contoh Surat yang Telah Aktif di SI-ARSIP"

    $bSMReal = "Asal Surat:`nPusat Data dan Teknologi Informasi Kementerian Haji dan Umrah RI`n`nNomor Surat:`nS-100/PDT/2026`n`nTanggal: 30 September 2026`n`nPerihal:`nPendataan Operator Sistem Informasi Kementerian (SISKOHAT, SISKOPATUH, Simpeg, Haji Store)`n`nStatus: DIPROSES`nDisposisi ke Bagian Umum & Humas`n`nBerkas Asli: Scan PDF 376 KB"
    Add-Card -Slide $s8 -Left 40 -Top 95 -Width 275 -Height 395 `
        -Title "CONTOH SURAT MASUK`n(SM/2026/00001)" `
        -Body $bSMReal `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    $bSK1Real = "Tujuan Surat:`nIbu Novi Trihadi (Narasumber)`n`nNomor Surat:`nS-1110/KW.33/2026`n`nTanggal: 21 Oktober 2026`n`nPerihal:`nPermohonan sebagai Narasumber Pembinaan dan Peningkatan SDM di Hotel Horison Kotaraja Jayapura`n`nPenandatangan:`nDian Nurlina (Plh. Kepala)`n`nUnit Kerja: Kepegawaian`nBerkas Asli: PDF 561 KB (Cap Basah)"
    Add-Card -Slide $s8 -Left 342 -Top 95 -Width 275 -Height 395 `
        -Title "CONTOH SURAT KELUAR 1`n(SK/2026/00001)" `
        -Body $bSK1Real `
        -BorderColor $C_GOLD -TitleColor $C_NAVY

    $bSK2Real = "Tujuan Surat:`nSekretaris Jenderal Kementerian Haji dan Umrah RI di Jakarta`n`nNomor Surat:`nS-1077/KW.33/2026`n`nTanggal: 14 Oktober 2026`n`nPerihal:`nPenyampaian Laporan Langkah Strategi Belanja TW IV 2026 & Efisiensi Akun 542 Satker 695295-695297`n`nPenandatangan:`nMusa Narwawan (Kepala)`n`nUnit Kerja: Keuangan`nBerkas Asli: PDF 132 KB (Cap Basah)"
    Add-Card -Slide $s8 -Left 645 -Top 95 -Width 275 -Height 395 `
        -Title "CONTOH SURAT KELUAR 2`n(SK/2026/00002)" `
        -Body $bSK2Real `
        -BorderColor $C_GREEN -TitleColor $C_GREEN

    # ==============================================================
    # SLIDE 9: PERAN PENGGUNA & AKUN DEMO
    # ==============================================================
    Write-Host "Membuat Slide 9: Peran Pengguna & Akun Demo..."
    $s9 = $pres.Slides.Add(9, 12)
    Set-SlideBg -Slide $s9 -Color $C_IVORY
    Add-SlideHeader -Slide $s9 -Title "Hak Akses Pengguna & Panduan Akun Uji Coba (Demo)"

    $bRBAC = "1. Super Administrator (superadmin):`nAkses menyeluruh, manajemen master user, master kategori, master unit kerja, dan log audit keamanan.`n`n2. Admin E-Arsip / Agendaris (admin.arsip):`nMengelola pendaftaran persuratan masuk/keluar, buku register agenda, lembar disposisi, dan e-arsip pusat.`n`n3. Admin Unit Kerja (admin.keuangan, admin.haji, dll):`nMengunggah dan mengelola dokumen kearsipan khusus pada bagian/bidangnya masing-masing.`n`n4. Pimpinan (kakanwil):`nExecutive dashboard, pemantauan surat masuk mendesak, dan instruksi lembar disposisi digital.`n`n5. Pegawai (pegawai.keu):`nPencarian berkas dan pembaca dokumen (read-only)."
    Add-Card -Slide $s9 -Left 40 -Top 95 -Width 425 -Height 395 `
        -Title "Hak Akses Berdasarkan Peran (RBAC)" `
        -Body $bRBAC `
        -BorderColor $C_NAVY -TitleColor $C_NAVY

    $bDemo = "Gunakan akun di bawah ini untuk latihan pada masa sosialisasi:`n`n• Administrator Utama:`n  User: superadmin  |  Pass: admin123`n`n• Agendaris Persuratan & E-Arsip:`n  User: admin.arsip  |  Pass: arsip123`n`n• Admin Unit Keuangan:`n  User: admin.keuangan  |  Pass: keu123`n`n• Admin Bidang Haji:`n  User: admin.haji  |  Pass: haji123`n`n• Pimpinan (Kakanwil):`n  User: kakanwil  |  Pass: kakanwil123`n`n• Staf Pegawai:`n  User: pegawai.keu  |  Pass: pegawai123`n`nAkses URL: https://siarsip-kemenhaj.vercel.app"
    Add-Card -Slide $s9 -Left 495 -Top 95 -Width 425 -Height 395 `
        -Title "Akun Uji Coba Latihan (Demo Credentials)" `
        -Body $bDemo `
        -BorderColor $C_GOLD -BgColor $C_SOFT_BLUE -TitleColor $C_NAVY

    # ==============================================================
    # SLIDE 10: RENCANA TINDAK LANJUT & PENUTUP
    # ==============================================================
    Write-Host "Membuat Slide 10: Penutup & Tindak Lanjut..."
    $s10 = $pres.Slides.Add(10, 12)
    Set-SlideBg -Slide $s10 -Color $C_CHARCOAL

    $b10 = $s10.Shapes.AddShape(1, 40, 40, 880, 460)
    $b10.Fill.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse
    $b10.Line.ForeColor.RGB = $C_GOLD
    $b10.Line.Weight = 2

    $t10 = $s10.Shapes.AddTextbox(1, 60, 60, 840, 45)
    $t10.TextFrame.TextRange.Text = "RENCANA TINDAK LANJUT & PEMBERLAKUAN"
    $t10.TextFrame.TextRange.Font.Name = "Arial"
    $t10.TextFrame.TextRange.Font.Size = 22
    $t10.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $t10.TextFrame.TextRange.Font.Color.RGB = $C_GOLD
    $t10.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    Add-Card -Slide $s10 -Left 70 -Top 120 -Width 250 -Height 180 `
        -Title "Minggu I: Bimbingan Teknis" `
        -Body "• Pelatihan operasional bagi seluruh admin unit kerja dan agendaris.`n• Uji coba input persuratan harian real-time.`n• Pendampingan penggunaan lembar disposisi digital." `
        -BorderColor $C_GOLD -BgColor $C_NAVY -TitleColor $C_GOLD

    Add-Card -Slide $s10 -Left 355 -Top 120 -Width 250 -Height 180 `
        -Title "Minggu II: Digitalisasi Arsip" `
        -Body "• Digitalisasi dan upload arsip dokumen aktif tahun 2026.`n• Verifikasi kelengkapan berkas per unit kerja.`n• Pengecekan tingkat kerahasiaan dan retensi." `
        -BorderColor $C_GOLD -BgColor $C_NAVY -TitleColor $C_GOLD

    Add-Card -Slide $s10 -Left 640 -Top 120 -Width 250 -Height 180 `
        -Title "Bulan I: Penerapan Penuh" `
        -Body "• Penerapan penuh tata kelola surat masuk/keluar via SI-ARSIP.`n• Monitoring dan evaluasi kinerja disposisi berkala.`n• Pencatatan audit trail kepatuhan SPBE." `
        -BorderColor $C_GOLD -BgColor $C_NAVY -TitleColor $C_GOLD

    $tyBox = $s10.Shapes.AddTextbox(1, 60, 320, 840, 60)
    $tyBox.TextFrame.TextRange.Text = "TERIMA KASIH`nMari Bersama Wujudkan Tata Kelola Persuratan Modern & Paperless!"
    $tyBox.TextFrame.TextRange.Font.Name = "Arial"
    $tyBox.TextFrame.TextRange.Font.Size = 16
    $tyBox.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $tyBox.TextFrame.TextRange.Font.Color.RGB = $C_WHITE
    $tyBox.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    $cBox = $s10.Shapes.AddTextbox(1, 60, 400, 840, 80)
    $cBox.TextFrame.TextRange.Text = "Tim Pengelola TIK Kantor Wilayah Kementerian Agama / Kementerian Haji dan Umrah Provinsi Papua`nWebsite: https://siarsip-kemenhaj.vercel.app  |  Email: papua@haji.go.id"
    $cBox.TextFrame.TextRange.Font.Name = "Arial"
    $cBox.TextFrame.TextRange.Font.Size = 11
    $cBox.TextFrame.TextRange.Font.Color.RGB = $C_GOLD
    $cBox.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    # Save Presentation
    Write-Host "Menyimpan file presentasi ke $OutputPath..."
    $pres.SaveAs($OutputPath)
    $pres.Close()
    $ppt.Quit()

    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    if (Test-Path "C:\Users\ACER\Desktop") {
        Write-Host "Menyalin file presentasi ke Desktop..."
        Copy-Item -Path $OutputPath -Destination $DesktopPath -Force
    }

    Write-Host "BERHASIL_MEMBUAT_PRESENTASI_PPTX"
} catch {
    Write-Host "Error pada baris $($_.InvocationInfo.ScriptLineNumber): $($_.Exception.Message)"
    if ($ppt) { $ppt.Quit() }
}
