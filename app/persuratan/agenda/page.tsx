'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import {
  BookOpen,
  Printer,
  Download,
  Search,
  Filter,
  Mail,
  Send,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function BukuAgendaPage() {
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>('masuk');
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'masuk') {
      fetch('/api/letters/incoming')
        .then((res) => res.json())
        .then((data) => {
          if (data.data) setLetters(data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch('/api/archives?q=Surat Keluar')
        .then((res) => res.json())
        .then((data) => {
          if (data.data) setLetters(data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeTab]);

  const filteredLetters = letters.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (activeTab === 'masuk') {
      return (
        l.agenda_number?.toLowerCase().includes(q) ||
        l.letter_number?.toLowerCase().includes(q) ||
        l.sender_institution?.toLowerCase().includes(q) ||
        l.subject?.toLowerCase().includes(q)
      );
    } else {
      return (
        l.archive_code?.toLowerCase().includes(q) ||
        l.document_number?.toLowerCase().includes(q) ||
        l.destination?.toLowerCase().includes(q) ||
        l.document_title?.toLowerCase().includes(q)
      );
    }
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Buku Agenda Persuratan Digital</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Buku register resmi Surat Masuk dan Surat Keluar Kanwil Kementerian Agama Provinsi Papua
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Buku Register</span>
            </button>
            <button
              onClick={() => alert('Fitur Ekspor Excel terintegrasi: mengunduh format register buku agenda .xlsx')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('masuk')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'masuk'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Buku Agenda Surat Masuk</span>
            </button>
            <button
              onClick={() => setActiveTab('keluar')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'keluar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Buku Agenda Surat Keluar</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari dalam buku agenda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Agenda Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {activeTab === 'masuk' ? 'Daftar Agenda Surat Masuk Tahun 2026' : 'Daftar Agenda Surat Keluar Tahun 2026'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total {filteredLetters.length} Nomor Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Agenda</th>
                  <th className="py-3 px-4">Tanggal Terima / Surat</th>
                  <th className="py-3 px-4">Nomor Surat Asli</th>
                  <th className="py-3 px-4">{activeTab === 'masuk' ? 'Instansi Pengirim' : 'Tujuan Surat'}</th>
                  <th className="py-3 px-4">Perihal / Isi Ringkas</th>
                  <th className="py-3 px-4">Unit Kerja</th>
                  <th className="py-3 px-4">Status & Disposisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Memuat data buku agenda...
                    </td>
                  </tr>
                ) : filteredLetters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data agenda ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredLetters.map((l, idx) => {
                    const agendaNo = activeTab === 'masuk' ? l.agenda_number : (l.document_number ? `SK/2026/${String(idx + 1).padStart(5, '0')}` : `SK/2026/${String(idx + 1).padStart(5, '0')}`);
                    const dateInfo = activeTab === 'masuk' ? `${l.received_date} (Surat: ${l.letter_date})` : l.document_date;
                    const letterNo = activeTab === 'masuk' ? l.letter_number : (l.document_number || '-');
                    const targetParty = activeTab === 'masuk' ? l.sender_institution : (l.destination || 'Instansi Terkait');
                    const subject = activeTab === 'masuk' ? l.subject : (l.document_title || l.subject);
                    const unitCode = l.unit_code;
                    const statusText = activeTab === 'masuk' ? l.status : 'TERARSIP';

                    return (
                      <tr key={l.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {agendaNo}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {dateInfo}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                          {letterNo}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                          {targetParty}
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-medium text-slate-800 line-clamp-1">{subject}</div>
                          {l.summary && (
                            <span className="text-[10px] text-slate-400 block line-clamp-1">{l.summary}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                            {unitCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              statusText === 'DIARSIPKAN' || statusText === 'TERARSIP'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
