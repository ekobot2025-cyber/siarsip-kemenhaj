'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/Layout/AppLayout';
import {
  Send,
  PlusCircle,
  Eye,
  ArrowRight,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { Archive as ArchiveType } from '@/lib/types';
import { DocumentViewerModal } from '@/components/UI/DocumentViewerModal';

export default function SuratKeluarPage() {
  const [letters, setLetters] = useState<ArchiveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  useEffect(() => {
    fetch('/api/archives?q=Surat Keluar')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setLetters(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrasi Surat Keluar</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Penerbitan surat dinas keluar, penomoran otomatis, verifikasi tanda tangan, dan pengarsipan
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/archives/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Buat Registrasi Surat Keluar</span>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Agenda Surat Keluar Kanwil Kemenag Papua</h2>
            <span className="text-xs text-slate-500 font-mono">Format Agenda: SK/2026/XXXXX</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Agenda</th>
                  <th className="py-3 px-4">Nomor Surat Resmi</th>
                  <th className="py-3 px-4">Tanggal Terbit</th>
                  <th className="py-3 px-4">Tujuan Surat</th>
                  <th className="py-3 px-4">Perihal</th>
                  <th className="py-3 px-4">Unit Pembuat</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {letters.map((l, idx) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      SK/2026/{String(idx + 1).padStart(5, '0')}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {l.document_number || '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {l.document_date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {l.destination || 'Instansi Terkait'}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <Link href={`/archives/${l.id}`} className="font-semibold text-slate-900 hover:text-indigo-700 line-clamp-1">
                        {l.document_title}
                      </Link>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">{l.subject}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                        {l.unit_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        TERKIRIM & DIARSIPKAN
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setPreviewDoc(l)}
                        className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                        title="Pratinjau Surat"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/archives/${l.id}`}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded inline-block"
                        title="Detail"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
