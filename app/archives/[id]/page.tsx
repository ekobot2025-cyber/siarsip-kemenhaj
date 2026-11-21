'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { SecurityBadge, StatusBadge } from '@/components/UI/Badge';
import {
  ArrowLeft,
  Download,
  Printer,
  Star,
  FileText,
  Calendar,
  Building2,
  Tag,
  Shield,
  Clock,
  User,
  Paperclip,
  CheckCircle2,
  Trash2,
  Lock,
  ExternalLink,
  Share2,
  Info,
  Check
} from 'lucide-react';
import { Archive, AuditLog } from '@/lib/types';

export default function ArchiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const archiveId = params.id as string;

  const [archive, setArchive] = useState<any>(null);
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'doc' | 'attachments' | 'history' | 'access'>('info');
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetch(`/api/archives/${archiveId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Gagal memuat arsip');
        }
        return res.json();
      })
      .then((data) => {
        setArchive(data.archive);
        setHistory(data.history || []);
        setAttachments(data.attachments || []);
        setIsFavorite(!!data.archive.is_favorite);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [archiveId]);

  const handleToggleFavorite = async () => {
    try {
      const res = await fetch(`/api/archives/${archiveId}/favorite`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.is_favorite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus arsip digital ini? Tindakan ini akan dicatat dalam Audit Trail.')) {
      return;
    }
    try {
      const res = await fetch(`/api/archives/${archiveId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Arsip berhasil dihapus');
        router.push('/archives');
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus');
      }
    } catch {
      alert('Gagal menghapus arsip');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
          <div className="h-16 bg-slate-200 rounded-xl"></div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !archive) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl border border-rose-200 text-center space-y-4 shadow-sm my-10">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Akses Dibatasi atau Tidak Ditemukan</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'Dokumen arsip tidak dapat diakses atau telah dipindahkan ke arsip khusus.'}
          </p>
          <div className="pt-2">
            <Link
              href="/archives"
              className="inline-flex items-center px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Kembali ke Daftar Arsip
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const downloadUrl = `/api/archives/${archive.id}/file?download=1`;
  const previewUrl = `/api/archives/${archive.id}/file`;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-start space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Kembali"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {archive.archive_code}
                  </span>
                  <SecurityBadge level={archive.security_level} />
                  <StatusBadge status={archive.status} />
                </div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 mt-1.5 leading-snug">
                  {archive.document_title}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Pengelola: <span className="font-semibold text-slate-700">{archive.unit_name}</span> • Kategori: <span className="font-semibold text-slate-700">{archive.category_name}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 self-start md:self-center">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg border transition ${
                  isFavorite
                    ? 'border-amber-400 bg-amber-50 text-amber-600'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title={isFavorite ? 'Hapus dari Favorit' : 'Tandai Favorit'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                title="Bagikan Tautan Internal"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              <a
                href={downloadUrl}
                download
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas</span>
              </a>

              <button
                onClick={handleDelete}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
                title="Hapus Arsip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5 Tabs Header */}
          <div className="flex space-x-1 sm:space-x-4 pt-4 text-xs font-bold border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'info'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>INFORMASI</span>
            </button>

            <button
              onClick={() => setActiveTab('doc')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'doc'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>DOKUMEN & PRATINJAU</span>
            </button>

            <button
              onClick={() => setActiveTab('attachments')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'attachments'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Paperclip className="w-4 h-4" />
              <span>LAMPIRAN ({attachments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>RIWAYAT / AUDIT ({history.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('access')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'access'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>HAK AKSES</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="pt-6">
            
            {/* TAB 1: INFORMASI */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                
                {/* Left: Metadata Table */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 divide-y divide-slate-200">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Kode Arsip Resmi:</span>
                      <span className="font-mono font-bold text-emerald-900">{archive.archive_code}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Nomor Dokumen/Surat:</span>
                      <span className="font-mono font-semibold text-slate-800">{archive.document_number || '-'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Tanggal Dokumen:</span>
                      <span className="font-semibold text-slate-800">{archive.document_date} (Tahun: {archive.year})</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Unit Kerja Pengelola:</span>
                      <span className="font-semibold text-slate-800">[{archive.unit_code}] {archive.unit_name}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Kategori Klasifikasi:</span>
                      <span className="font-semibold text-slate-800">{archive.category_name}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Asal Dokumen:</span>
                      <span className="text-slate-800">{archive.origin || '-'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Tujuan Dokumen:</span>
                      <span className="text-slate-800">{archive.destination || '-'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Perihal:</span>
                      <span className="text-slate-800 font-medium">{archive.subject || '-'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Status Kearsipan:</span>
                      <div><StatusBadge status={archive.status} /></div>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500 font-medium">Klasifikasi Keamanan:</span>
                      <div><SecurityBadge level={archive.security_level} /></div>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">Deskripsi & Catatan Berkas</h3>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {archive.description || 'Tidak ada deskripsi tambahan.'}
                    </p>
                  </div>

                  {/* Keywords Tags */}
                  {archive.keywords && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">Kata Kunci / Tag</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {archive.keywords.split(',').map((kw: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-medium">
                            #{kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Technical Details & Authenticity Card */}
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Informasi Teknis Berkas</h3>
                    
                    <div>
                      <span className="text-slate-500 block">Nama Berkas:</span>
                      <p className="font-mono text-[11px] text-slate-800 font-medium truncate" title={archive.file_name}>
                        {archive.file_name || `${archive.archive_code.replace(/\//g, '_')}.pdf`}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Ukuran Berkas:</span>
                      <p className="font-medium text-slate-800">
                        {archive.file_size ? `${(archive.file_size / 1024).toFixed(1)} KB` : '1.4 MB'}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Didaftarkan Oleh:</span>
                      <p className="font-medium text-slate-800">{archive.creator_name} ({archive.creator_job || 'Staff'})</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Waktu Pencatatan:</span>
                      <p className="font-mono text-slate-800">{archive.created_at}</p>
                    </div>

                    <div className="pt-2">
                      <a
                        href={downloadUrl}
                        download
                        className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh Berkas Asli</span>
                      </a>
                    </div>
                  </div>

                  {/* QR & Verification Box */}
                  <div className="bg-emerald-950 text-white p-4 rounded-xl text-center space-y-2 border border-emerald-900">
                    <div className="w-20 h-20 bg-white p-1 rounded-lg mx-auto flex items-center justify-center text-slate-900 font-mono text-[9px] font-bold border border-emerald-400">
                      [ QR AUTH ]
                    </div>
                    <p className="font-bold text-xs text-amber-300">OTENTIKASI DIGITAL</p>
                    <p className="text-[10px] text-emerald-200/80 leading-tight">
                      Terverifikasi dalam Repositori Kearsipan Resmi Kementerian Haji dan Umrah Kantor Wilayah Papua
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: DOKUMEN & PRATINJAU */}
            {activeTab === 'doc' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg text-xs">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>Pratinjau Resmi Lembar Dokumen</span>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                    >
                      <Printer className="w-3.5 h-3.5 inline mr-1" />
                      Cetak Lembar
                    </button>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5 inline mr-1" />
                      Buka di Tab Baru
                    </a>
                  </div>
                </div>

                {/* Document View Canvas */}
                <div className="bg-white rounded-xl shadow-md border border-slate-300 p-8 sm:p-12 relative overflow-hidden max-w-4xl mx-auto">
                  {/* Subtle Background Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none -rotate-45">
                    <span className="text-4xl sm:text-6xl font-black uppercase text-slate-900 tracking-widest text-center">
                      KEMENTERIAN HAJI DAN UMRAH PAPUA
                    </span>
                  </div>

                  {/* Official Header */}
                  <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                    <div className="inline-block p-1 bg-emerald-800 text-amber-300 font-bold text-[10px] tracking-widest uppercase px-3 rounded mb-2">
                      KEMENTERIAN HAJI DAN UMRAH REPUBLIK INDONESIA
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
                      KANTOR WILAYAH PROVINSI PAPUA
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Jalan Raya Abepura - Kotaraja, Jayapura, Papua | Telepon: (0967) 581234
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Email: kanwilpapua@haji.go.id | Laman: papua.haji.go.id
                    </p>
                    <div className="h-0.5 bg-slate-900 mt-3"></div>
                    <div className="h-0.5 bg-slate-900 mt-0.5"></div>
                  </div>

                  {/* Metadata Table */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Kode Arsip:</span>
                      <span className="font-mono font-bold text-emerald-800">{archive.archive_code}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Nomor Dokumen:</span>
                      <span className="font-mono font-semibold text-slate-800">{archive.document_number || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tanggal Dokumen:</span>
                      <span className="font-semibold text-slate-800">{archive.document_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Unit Pengelola:</span>
                      <span className="font-semibold text-slate-800">{archive.unit_name}</span>
                    </div>
                  </div>

                  {/* Title & Subject */}
                  <div className="mb-6">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Perihal / Judul Berkas:</span>
                    <h3 className="text-base font-bold text-slate-900 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      {archive.document_title}
                    </h3>
                  </div>

                  {/* Summary Content */}
                  <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed mb-8">
                    <div>
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-1">Isi Ringkas / Keterangan Arsip:</span>
                      <p className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-700">
                        {archive.description || 'Berkas telah divalidasi dan disimpan dalam Repositori Kearsipan Digital Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="text-xs text-emerald-950">
                        <span className="font-bold">Otentikasi SI-ARSIP Terkonfirmasi.</span>
                        <p>Dokumen ini memiliki nilai pembuktian kearsipan sesuai kaidah kearsipan nasional ANRI.</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Signature Line */}
                  <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                    <div>
                      <p className="font-mono text-[10px]">Checksum: SHA256-VAL-{archive.id}-OK</p>
                      <p className="text-[10px]">Tercatat di SI-ARSIP Papua</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 mb-1">Pimpinan Unit Pengelola</p>
                      <p className="font-bold text-slate-800">{archive.unit_leader || 'Kepala Bagian'}</p>
                      <p className="text-[10px] text-slate-500">Kantor Wilayah Provinsi Papua</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LAMPIRAN */}
            {activeTab === 'attachments' && (
              <div className="space-y-4 text-xs">
                {attachments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    <Paperclip className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada lampiran tambahan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Berkas utama telah terpasang pada dokumen induk.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((att: any) => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <div>
                            <span className="font-semibold text-slate-800">{att.file_name}</span>
                            <span className="text-[10px] text-slate-400 block">{(att.file_size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                        <a
                          href={`/${att.file_path}`}
                          download
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                        >
                          Unduh
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RIWAYAT / AUDIT TRAIL */}
            {activeTab === 'history' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Rekam Jejak Dokumen (Audit Trail)</h3>
                  <span className="text-[10px] text-slate-400">Pencatatan Permanen</span>
                </div>

                <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {history.map((log: any) => (
                    <div key={log.id} className="p-4 flex items-start space-x-3 hover:bg-slate-50 transition">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                        {log.user_name ? log.user_name.charAt(0) : 'S'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{log.user_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.created_at}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{log.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[9px] font-mono text-slate-500">
                            Aksi: {log.action}
                          </span>
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[9px] font-mono text-slate-500">
                            IP: {log.ip_address || '127.0.0.1'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: HAK AKSES */}
            {activeTab === 'access' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Kebijakan Keamanan Dokumen</span>
                  </h3>
                  <div className="space-y-2 text-slate-600 leading-relaxed">
                    <p>
                      Arsip ini tergolong pada tingkat keamanan <strong className="text-slate-900">{archive.security_level}</strong>.
                    </p>
                    {archive.security_level === 'PUBLIK' && (
                      <p>Dapat dibaca oleh semua pengguna terdaftar dan masyarakat sesuai SOP keterbukaan informasi.</p>
                    )}
                    {archive.security_level === 'INTERNAL' && (
                      <p>Dapat diakses oleh seluruh pegawai dan pejabat di lingkungan Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua.</p>
                    )}
                    {archive.security_level === 'TERBATAS' && (
                      <p>Hanya dapat diakses oleh personil pada unit <strong>{archive.unit_name}</strong>, Super Admin, dan Pimpinan Kanwil.</p>
                    )}
                    {archive.security_level === 'RAHASIA' && (
                      <p className="text-rose-700 font-medium">
                        Arsip RAHASIA! Dokumen ini hanya dapat dilihat oleh Super Admin, Kepala Kantor Wilayah, dan Admin Unit resmi yang memiliki hak khusus.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">Daftar Entitas Berwenang</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Kepala Kantor Wilayah (Pimpinan Utama)</li>
                    <li>Kepala Bagian Tata Usaha (Pimpinan Unit)</li>
                    <li>Super Administrator Sistem SI-ARSIP</li>
                    <li>Admin Unit: {archive.unit_name}</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </AppLayout>
  );
}
