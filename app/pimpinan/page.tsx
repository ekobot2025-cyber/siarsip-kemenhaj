'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/Layout/AppLayout';
import { SecurityBadge, StatusBadge } from '@/components/UI/Badge';
import { DocumentViewerModal } from '@/components/UI/DocumentViewerModal';
import {
  ShieldCheck,
  Building2,
  Mail,
  Send,
  Archive,
  Calendar,
  Eye,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Sparkles
} from 'lucide-react';

export default function PimpinanDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  useEffect(() => {
    fetch('/api/pimpinan/stats')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-slate-500 space-y-2">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Memuat Dashboard Pimpinan...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Pimpinan Executive Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-amber-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>DASHBOARD MONITORING EKSEKUTIF PIMPINAN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Monitoring Kearsipan & Tata Persuratan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Ikhtisar operasional, kepatuhan tata naskah dinas, dan pengarsipan digital seluruh satuan kerja Kantor Wilayah Kementerian Agama Provinsi Papua.
            </p>
          </div>
        </div>

        {/* 6 KPI Cards for Leaders */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Arsip</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{data.totalArchives}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">Tersentralisasi</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Arsip 2026</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{data.archivesThisYear}</p>
            <span className="text-[10px] text-teal-600 font-semibold">Tahun Berjalan</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Surat Masuk</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{data.suratMasukBulanIni}</p>
            <span className="text-[10px] text-blue-600 font-semibold">Bulan Berjalan</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Surat Keluar</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{data.suratKeluarBulanIni}</p>
            <span className="text-[10px] text-indigo-600 font-semibold">Telah Diterbitkan</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dokumen Baru</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{data.dokumenBaruBulanIni}</p>
            <span className="text-[10px] text-amber-600 font-semibold">Bulan Ini</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kepatuhan Unit</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">100%</p>
            <span className="text-[10px] text-purple-600 font-semibold">5 Bagian Terkoneksi</span>
          </div>
        </div>

        {/* Section: Monitoring Kinerja Tiap Unit */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Monitoring Kinerja Kearsipan per Bagian / Bidang</h2>
              <p className="text-xs text-slate-500">Status volume dokumen dan aktivitas terakhir tiap unit kerja</p>
            </div>
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-medium text-slate-600">
              Update Real-time
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode Unit</th>
                  <th className="py-3 px-4">Nama Unit Kerja</th>
                  <th className="py-3 px-4">Pimpinan Unit</th>
                  <th className="py-3 px-4">Total Berkas Tersimpan</th>
                  <th className="py-3 px-4">Waktu Aktivitas Terakhir</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.unitActivity.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {u.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {u.leader_name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold font-mono">
                        {u.archive_count} Dokumen
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {u.last_activity || 'Baru saja'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/archives/unit/${u.code.toLowerCase()}`}
                        className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        <span>Buka Arsip</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Dokumen Penting Terbaru */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dokumen Penting & Surat Masuk Terkini</h2>
              <p className="text-xs text-slate-500">Berkas yang baru masuk memerlukan perhatian pimpinan</p>
            </div>
            <Link href="/archives" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center">
              <span>Semua Arsip</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {data.recentDocs.map((doc: any) => (
              <div key={doc.id} className="p-3.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition flex items-start justify-between bg-slate-50/50">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-bold text-emerald-800">{doc.archive_code}</span>
                    <SecurityBadge level={doc.security_level} />
                  </div>
                  <Link href={`/archives/${doc.id}`} className="font-semibold text-slate-900 hover:text-emerald-700 line-clamp-1 block">
                    {doc.document_title}
                  </Link>
                  <span className="text-[10px] text-slate-400 block">{doc.unit_name} • {doc.document_date}</span>
                </div>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white rounded border border-slate-200 flex-shrink-0"
                  title="Lihat Pratinjau"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      <DocumentViewerModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        archive={previewDoc}
      />
    </AppLayout>
  );
}
