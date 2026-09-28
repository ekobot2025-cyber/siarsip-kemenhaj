'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Tag,
  Shield,
  HelpCircle,
  FileCheck,
  X
} from 'lucide-react';
import { Unit, ArchiveCategory } from '@/lib/types';

function NewArchiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectUnitId = searchParams.get('unit_id') || '';

  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<ArchiveCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ArchiveCategory[]>([]);

  // Form states
  const [unitId, setUnitId] = useState(preselectUnitId);
  const [categoryId, setCategoryId] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().slice(0, 10));
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [subject, setSubject] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [securityLevel, setSecurityLevel] = useState('INTERNAL');
  const [status, setStatus] = useState('AKTIF');

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Units & Categories
  useEffect(() => {
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setUnits(data.data.filter((u: Unit) => u.is_active === 1));
          if (!unitId && data.data.length > 0) {
            setUnitId(data.data[0].id.toString());
          }
        }
      });

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setCategories(data.data);
      });
  }, []);

  // Filter categories when unitId changes
  useEffect(() => {
    if (unitId) {
      const selectedUnitNum = parseInt(unitId, 10);
      const filtered = categories.filter(
        (c) => c.unit_id === selectedUnitNum || c.unit_id === null
      );
      setFilteredCategories(filtered);
      if (filtered.length > 0 && !filtered.find((c) => c.id.toString() === categoryId)) {
        setCategoryId(filtered[0].id.toString());
      }
    } else {
      setFilteredCategories(categories);
    }
  }, [unitId, categories]);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Get selected unit code for live code preview
  const currentUnit = units.find((u) => u.id.toString() === unitId);
  const previewArchiveCode = `ARS/${currentUnit ? currentUnit.code : 'UNIT'}/${year}/##### (Otomatis)`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!unitId || !categoryId || !documentTitle.trim() || !documentDate) {
      setError('Mohon lengkapi semua field yang ditandai dengan bintang (*)');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('unit_id', unitId);
      formData.append('category_id', categoryId);
      formData.append('document_title', documentTitle.trim());
      formData.append('document_number', documentNumber.trim());
      formData.append('document_date', documentDate);
      formData.append('year', year);
      formData.append('subject', subject.trim());
      formData.append('origin', origin.trim());
      formData.append('destination', destination.trim());
      formData.append('description', description.trim());
      formData.append('keywords', keywords.trim());
      formData.append('security_level', securityLevel);
      formData.append('status', status);

      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('/api/archives', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan arsip.');
        setLoading(false);
        return;
      }

      setSuccess(`Arsip berhasil disimpan dengan Kode: ${data.archive_code}`);
      setLoading(false);

      setTimeout(() => {
        router.push(`/archives/${data.id}`);
      }, 1200);
    } catch {
      setError('Terjadi kendala jaringan saat mengunggah arsip.');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Tambah Arsip Digital Baru
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Formulir pendaftaran dan klasifikasi berkas resmi ke dalam database E-Arsip
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Format Kode Arsip</span>
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {previewArchiveCode}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Klasifikasi & Kode */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Klasifikasi Unit & Kategori</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Unit Kerja Pengelola *
                </label>
                <select
                  required
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">Pilih Bagian / Bidang</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.code}] {u.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Kode unit akan menentukan prefix kode arsip.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Kategori Arsip *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">Pilih Kategori</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.unit_id ? `(${currentUnit?.code || ''})` : '(Umum)'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Menentukan pengelompokan arsip pada laporan kearsipan.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Informasi Dokumen */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Metadata & Identitas Berkas</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Judul Dokumen / Nama Berkas *
                </label>
                <input
                  type="text"
                  required
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Contoh: Surat Pertanggungjawaban (SPJ) Belanja Operasional Kantor Bulan Januari 2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nomor Dokumen / Surat
                  </label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Contoh: SPJ/014/KEU/2026"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tanggal Dokumen *
                  </label>
                  <input
                    type="date"
                    required
                    value={documentDate}
                    onChange={(e) => {
                      setDocumentDate(e.target.value);
                      if (e.target.value) {
                        setYear(new Date(e.target.value).getFullYear().toString());
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tahun Anggaran / Arsip *
                  </label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Asal Dokumen / Instansi Pengirim
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Contoh: KPPN Jayapura / Kanwil DJPb Papua"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tujuan Dokumen / Penerima
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Contoh: KPA Kanwil Kemenag Papua"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Perihal / Ringkasan Isi
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ringkasan singkat isi surat atau dokumen"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Deskripsi Lengkap & Keterangan
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan tambahan, rincian lampiran, atau instruksi khusus berkas..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tag / Kata Kunci Pencarian
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Contoh: spj, belanja, daya jasa, operasional (pisahkan dengan koma)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Keamanan & Status */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Tingkat Akses & Keamanan Dokumen</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  Tingkat Akses Dokumen *
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'PUBLIK', label: 'Publik', desc: 'Dapat dilihat oleh seluruh aparatur dan publik sesuai kebijakan.' },
                    { val: 'INTERNAL', label: 'Internal', desc: 'Hanya dapat diakses seluruh pengguna internal Kanwil Kemenag Papua.' },
                    { val: 'TERBATAS', label: 'Terbatas', desc: 'Hanya dapat diakses oleh personil pada unit kerja bersangkutan.' },
                    { val: 'RAHASIA', label: 'Rahasia', desc: 'Hanya dapat diakses oleh Super Admin, Pimpinan, dan pejabat berwenang khusus.' },
                  ].map((lvl) => (
                    <label
                      key={lvl.val}
                      className={`flex items-start p-3 rounded-lg border cursor-pointer transition ${
                        securityLevel === lvl.val
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="securityLevel"
                        value={lvl.val}
                        checked={securityLevel === lvl.val}
                        onChange={(e) => setSecurityLevel(e.target.value)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="ml-3">
                        <span className="font-bold text-slate-900">{lvl.label}</span>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{lvl.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Status Retensi Arsip *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 mb-3"
                >
                  <option value="AKTIF">Aktif (Masih dalam masa guna operasional)</option>
                  <option value="INAKTIF">Inaktif (Jarang digunakan, disimpan di depo)</option>
                  <option value="PERMANEN">Permanen (Bernilai guna statis bersejarah)</option>
                </select>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-2 text-[11px]">
                  <p className="font-bold text-slate-800">Prinsip Keamanan E-Arsip:</p>
                  <p>
                    Dokumen yang tersimpan dalam SI-ARSIP dilindungi dengan pembatasan hak akses berbasis peran (RBAC). Setiap tindakan pengunduhan dan pembacaan berkas otomatis dicatat dalam Audit Trail.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Upload Berkas */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>Unggah Berkas Fisik Digital (PDF / Scan)</span>
            </h2>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-8 border-2 border-dashed rounded-xl text-center transition ${
                dragActive
                  ? 'border-emerald-600 bg-emerald-50/60'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-300 max-w-md mx-auto shadow-xs">
                  <div className="flex items-center space-x-3 truncate">
                    <FileText className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    <div className="text-left truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Dokumen'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div>
                    <span className="text-xs font-semibold text-slate-700">
                      Tarik & lepaskan berkas arsip Anda ke sini, atau{' '}
                    </span>
                    <label className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer">
                      Pilih dari Komputer
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mendukung PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Maks 50 MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <span>Menyimpan Berkas...</span>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>SIMPAN ARSIP DIGITAL</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </AppLayout>
  );
}

export default function NewArchivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">Memuat formulir arsip...</p>
      </div>
    }>
      <NewArchiveContent />
    </Suspense>
  );
}

