'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { SecurityBadge, StatusBadge } from '@/components/UI/Badge';
import { DocumentViewerModal } from '@/components/UI/DocumentViewerModal';
import {
  Building2,
  PlusCircle,
  Search,
  Eye,
  Download,
  ChevronRight,
  UserCheck,
  FileText,
  Star
} from 'lucide-react';
import { Archive, Unit } from '@/lib/types';

export default function UnitArchivePage() {
  const params = useParams();
  const unitCode = (params.code as string).toUpperCase();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewArchive, setPreviewArchive] = useState<any>(null);

  useEffect(() => {
    // Fetch units to find the current unit
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const match = data.data.find((u: Unit) => u.code.toUpperCase() === unitCode);
          setUnit(match || null);
        }
      });
  }, [unitCode]);

  useEffect(() => {
    setLoading(true);
    const url = `/api/archives?unit_code=${unitCode}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setArchives(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [unitCode, searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-5">
        
        {/* Unit Header Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex-shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold bg-emerald-800 text-white px-2 py-0.5 rounded">
                  {unitCode}
                </span>
                <h1 className="text-xl font-bold text-slate-900">
                  {unit ? unit.name : `Unit ${unitCode}`}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {unit?.description || 'Pengelolaan arsip digital khusus pada satuan unit kerja Kantor Wilayah.'}
              </p>
              {unit?.leader_name && (
                <div className="flex items-center space-x-2 mt-2 text-xs text-slate-600">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Pimpinan: <span className="font-semibold text-slate-800">{unit.leader_name}</span> (NIP: {unit.leader_nip || '-'})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/archives/new?unit_id=${unit?.id || ''}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Arsip {unitCode}</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari arsip pada ${unit?.name || unitCode}...`}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {archives.length} Dokumen
          </span>
        </div>

        {/* Archives Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium">Memuat arsip unit...</p>
            </div>
          ) : archives.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum ada arsip pada unit ini</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan tambahkan dokumen arsip digital untuk unit {unit?.name || unitCode}.
              </p>
              <Link
                href={`/archives/new?unit_id=${unit?.id || ''}`}
                className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Unggah Arsip Sekarang</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Kode Arsip</th>
                    <th className="py-3 px-4">Tanggal / Thn</th>
                    <th className="py-3 px-4">Nomor Dokumen</th>
                    <th className="py-3 px-4">Judul Dokumen</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Akses</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {archives.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        <Link href={`/archives/${item.id}`} className="hover:underline">
                          {item.archive_code}
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {item.document_date}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {item.document_number || '-'}
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <Link href={`/archives/${item.id}`} className="font-semibold text-slate-900 hover:text-emerald-700 line-clamp-1">
                          {item.document_title}
                        </Link>
                        {item.subject && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                            {item.subject}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {item.category_name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SecurityBadge level={item.security_level} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setPreviewArchive(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          title="Pratinjau"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`/api/archives/${item.id}/file?download=1`}
                          download
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Unduh"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/archives/${item.id}`}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded inline-block transition-colors"
                          title="Detail"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <DocumentViewerModal
        isOpen={!!previewArchive}
        onClose={() => setPreviewArchive(null)}
        archive={previewArchive}
      />
    </AppLayout>
  );
}
