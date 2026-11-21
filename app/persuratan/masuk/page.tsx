'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/Layout/AppLayout';
import {
  Mail,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Printer,
  Sparkles,
  Info,
  Edit3,
  Trash2
} from 'lucide-react';
import { NewIncomingLetterModal } from '@/components/Letters/NewIncomingLetterModal';
import { DisposisiModal } from '@/components/Letters/DisposisiModal';
import { LetterViewerModal } from '@/components/Letters/LetterViewerModal';

export default function SuratMasukPage() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [units, setUnits] = useState<any[]>([]);
  
  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<any>(null);
  const [disposisiLetter, setDisposisiLetter] = useState<any>(null);
  const [previewLetter, setPreviewLetter] = useState<any>(null);

  // Notification state
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLetters = () => {
    setLoading(true);
    let url = '/api/letters/incoming';
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (statusFilter) params.append('status', statusFilter);
    if (unitFilter) params.append('unit_id', unitFilter);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setLetters(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load incoming letters', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLetters();
  }, [searchQuery, statusFilter, unitFilter]);

  useEffect(() => {
    fetch('/api/units')
      .then((res) => res.json())
      .then((d) => {
        if (d.data) setUnits(d.data);
      });
  }, []);

  const handleArchiveToEArsip = async (letterId: number) => {
    try {
      const res = await fetch(`/api/letters/incoming/${letterId}/archive`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: 'error', text: data.error || 'Gagal memasukkan ke E-Arsip' });
        return;
      }

      setFeedbackMsg({
        type: 'success',
        text: `Berhasil! Berkas surat masuk telah dialihkan menjadi E-Arsip aktif dengan kode: ${data.archive_code}`,
      });

      setDisposisiLetter(null);
      setPreviewLetter(null);
      fetchLetters();

      setTimeout(() => {
        setFeedbackMsg(null);
      }, 5000);
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Terjadi kendala saat menghubungi server' });
    }
  };

  const handleDeleteLetter = async (letterId: number, agendaNumber: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data surat masuk dengan No. Agenda: ${agendaNumber}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/letters/incoming/${letterId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: 'error', text: data.error || 'Gagal menghapus surat masuk' });
        return;
      }

      setFeedbackMsg({
        type: 'success',
        text: `Surat masuk ${agendaNumber} berhasil dihapus dari sistem.`,
      });
      fetchLetters();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Gagal menghubungi server saat menghapus' });
    }
  };

  const totalCount = letters.length;
  const newCount = letters.filter((l) => l.status === 'BARU').length;
  const disposisiCount = letters.filter((l) => l.status === 'DISPOSISI' || l.status === 'PROSES').length;
  const archivedCount = letters.filter((l) => l.status === 'DIARSIPKAN' || l.archive_id).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Banner Fitur Penomoran & Scan (Kemenhaj Obsidian & Gold) */}
        <div className="bg-gradient-to-r from-[#1A1410] via-[#2A2018] to-[#1A1410] text-white p-6 rounded-2xl shadow-md border border-[#c9a961]/30 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAF9F5]/10 text-[#c9a961] border border-[#c9a961]/40 text-[11px] font-bold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buku Register Persuratan &amp; Digitalisasi Scan PDF</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Administrasi Surat Masuk &amp; Penomoran Agenda Otomatis
              </h1>
              <p className="text-xs text-[#FAF9F5]/80 leading-relaxed">
                Setiap surat fisik yang diterima Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua dapat langsung dicatat manual, 
                diunggah berkas scan PDF, dan diberi <strong>Nomor Agenda Otomatis</strong> (format: <code className="bg-black/40 px-1.5 py-0.5 rounded text-[#c9a961] font-mono border border-[#c9a961]/30">SM/2026/00001</code>). 
                Tersedia <strong>Lembar Disposisi Kakanwil</strong> siap cetak dan fitur <strong>1-Klik Masuk E-Arsip</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditingLetter(null);
                  setIsNewModalOpen(true);
                }}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:brightness-105 text-white rounded-xl text-xs font-bold shadow-md shadow-[#c9a961]/30 transition active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Input Surat Masuk &amp; Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-semibold">{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-xs underline font-bold ml-4"
            >
              Tutup
            </button>
          </div>
        )}

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#e8dfc8] shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Total Surat Masuk</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#1A1410]">{totalCount}</span>
              <div className="p-1.5 bg-[#fbf8ee] rounded-lg text-[#8a6d2b] border border-[#e8dfc8]">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[10px] text-[#8a6d2b] mt-1 block font-medium">Tercatat di Buku Agenda</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e8dfc8] shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Surat Baru (Belum Disposisi)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-700">{newCount}</span>
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[10px] text-amber-700 mt-1 block font-medium">Menunggu arahan pimpinan</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e8dfc8] shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Sedang Didisposisikan</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-blue-700">{disposisiCount}</span>
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-700 border border-blue-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[10px] text-blue-700 mt-1 block font-medium">Dalam tindak lanjut unit</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e8dfc8] shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Telah Masuk E-Arsip</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-700">{archivedCount}</span>
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-700 mt-1 block font-medium">Permanen di repositori digital</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8dfc8] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8a6d2b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan No. Agenda (SM/2026/00001), No. Surat, Pengirim, atau Perihal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#e8dfc8] rounded-xl text-xs text-[#1A1410] focus:ring-2 focus:ring-[#c9a961] focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-[#8a6d2b]" />
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="bg-[#FAF9F5] border border-[#e8dfc8] text-stone-700 text-xs rounded-xl px-2.5 py-2 focus:ring-[#c9a961]"
              >
                <option value="">Semua Unit Tujuan</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF9F5] border border-[#e8dfc8] text-stone-700 text-xs rounded-xl px-2.5 py-2 focus:ring-[#c9a961]"
            >
              <option value="">Semua Status</option>
              <option value="BARU">Surat Baru</option>
              <option value="DISPOSISI">Dalam Disposisi</option>
              <option value="PROSES">Sedang Proses</option>
              <option value="DIARSIPKAN">Telah Masuk E-Arsip</option>
            </select>
          </div>
        </div>

        {/* Letters Table */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#e8dfc8] flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#1A1410]">Buku Register &amp; Agenda Surat Masuk</h2>
              <span className="text-[11px] bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] px-2 py-0.5 rounded-full font-bold">
                {letters.length} data ditemukan
              </span>
            </div>
            <div className="text-xs text-[#8a6d2b] font-mono hidden sm:block">
              Siklus: Scan &rarr; Registrasi &rarr; Disposisi &rarr; E-Arsip
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf8ee] text-[#8a6d2b] font-bold uppercase text-[10px] tracking-wider border-b border-[#e8dfc8]">
                <tr>
                  <th className="py-3 px-4">No. Agenda</th>
                  <th className="py-3 px-4">Nomor &amp; Tgl Asli</th>
                  <th className="py-3 px-4">Asal Instansi</th>
                  <th className="py-3 px-4">Perihal &amp; Ringkasan</th>
                  <th className="py-3 px-4">Sifat / Unit</th>
                  <th className="py-3 px-4">Scan PDF</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi &amp; Disposisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F5] text-stone-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      <div className="animate-spin w-6 h-6 border-2 border-[#b8941e] border-t-transparent rounded-full mx-auto mb-2"></div>
                      Memuat agenda surat masuk...
                    </td>
                  </tr>
                ) : letters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      <Mail className="w-10 h-10 mx-auto text-[#c9a961] mb-2 opacity-60" />
                      <p className="font-bold text-[#1A1410]">Belum ada data surat masuk</p>
                      <p className="text-[11px] text-[#786c5e] mt-1">
                        Klik tombol <strong>&ldquo;+ Input Surat Masuk &amp; Scan&rdquo;</strong> di atas untuk mendaftarkan dokumen pertama.
                      </p>
                    </td>
                  </tr>
                ) : (
                  letters.map((l) => {
                    const natureBadge = {
                      Biasa: 'bg-stone-100 text-stone-700 border-stone-200',
                      Penting: 'bg-amber-50 text-amber-800 border-amber-200',
                      Segera: 'bg-blue-50 text-blue-800 border-blue-200',
                      Rahasia: 'bg-rose-50 text-rose-800 border-rose-200',
                    }[l.letter_nature as string] || 'bg-stone-100 text-stone-700 border-stone-200';

                    const statusBadge = {
                      BARU: 'bg-blue-50 text-blue-700 border-blue-200',
                      DISPOSISI: 'bg-amber-50 text-amber-700 border-amber-200',
                      PROSES: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                      DIARSIPKAN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    }[l.status as string] || 'bg-stone-100 text-stone-700 border-stone-200';

                    return (
                      <tr key={l.id} className="hover:bg-[#fbf8ee]/60 transition-colors">
                        {/* No Agenda */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#8a6d2b] bg-[#fbf8ee] px-2 py-1 rounded border border-[#e8dfc8] block w-fit">
                            {l.agenda_number}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-1">
                            Diterima: {l.received_date}
                          </span>
                        </td>

                        {/* Asal Surat */}
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-mono font-semibold text-[#1A1410] block truncate" title={l.letter_number}>
                            {l.letter_number}
                          </span>
                          <span className="text-[10px] text-stone-500 block">
                            Tgl Surat: {l.letter_date}
                          </span>
                        </td>

                        {/* Pengirim */}
                        <td className="py-3 px-4 font-semibold text-[#1A1410] max-w-xs truncate" title={l.sender_institution}>
                          {l.sender_institution}
                        </td>

                        {/* Perihal */}
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-medium text-[#1A1410] line-clamp-1" title={l.subject}>
                            {l.subject}
                          </p>
                          {l.summary && (
                            <p className="text-[10px] text-[#786c5e] line-clamp-1 mt-0.5" title={l.summary}>
                              {l.summary}
                            </p>
                          )}
                        </td>

                        {/* Sifat & Unit */}
                        <td className="py-3 px-4 whitespace-nowrap space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${natureBadge}`}>
                            {l.letter_nature || 'Biasa'}
                          </span>
                          <div>
                            <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#e8dfc8] text-stone-700 rounded text-[10px] font-bold">
                              {l.unit_code}
                            </span>
                          </div>
                        </td>

                        {/* Berkas Scan */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {l.file_name ? (
                            <button
                              onClick={() => setPreviewLetter(l)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#fbf8ee] hover:bg-[#f3ebd3] text-[#8a6d2b] rounded-lg border border-[#e8dfc8] text-[11px] font-semibold transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#b8941e]" />
                              <span>PDF Scan</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">Draft Fisik</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${statusBadge}`}>
                            {l.status}
                          </span>
                          {l.archive_id && (
                            <Link
                              href={`/archives/${l.archive_id}`}
                              className="block text-[10px] font-bold text-emerald-700 hover:underline mt-1"
                            >
                              Lihat E-Arsip &rarr;
                            </Link>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                          {/* Lembar Disposisi Button */}
                          <button
                            onClick={() => setDisposisiLetter(l)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#fbf8ee] hover:bg-[#f3ebd3] text-[#8a6d2b] border border-[#e8dfc8] rounded-lg text-[11px] font-bold transition cursor-pointer"
                            title="Buka Lembar Disposisi & Cetak"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#b8941e]" />
                            <span>Disposisi</span>
                          </button>

                          {/* Preview Scan PDF */}
                          <button
                            onClick={() => setPreviewLetter(l)}
                            className="p-1.5 text-stone-500 hover:text-[#8a6d2b] hover:bg-[#fbf8ee] rounded-lg transition"
                            title="Pratinjau Berkas Scan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Manual Input */}
                          <button
                            onClick={() => setEditingLetter(l)}
                            className="p-1.5 text-stone-500 hover:text-[#8a6d2b] hover:bg-[#fbf8ee] rounded-lg transition"
                            title="Edit Input Data Surat"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Quick Archive Bridge */}
                          {!l.archive_id ? (
                            <button
                              onClick={() => handleArchiveToEArsip(l.id)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:brightness-105 text-white rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer"
                              title="Pindahkan ke E-Arsip Digital"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>+ E-Arsip</span>
                            </button>
                          ) : (
                            <Link
                              href={`/archives/${l.archive_id}`}
                              className="inline-flex items-center space-x-1 px-2 py-1 text-stone-500 hover:text-[#1A1410] hover:bg-stone-100 rounded text-[11px]"
                              title="Buka Berkas E-Arsip"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Delete Letter */}
                          {!l.archive_id && (
                            <button
                              onClick={() => handleDeleteLetter(l.id, l.agenda_number)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Register Surat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Input / Edit Incoming Letter Registration */}
        <NewIncomingLetterModal
          isOpen={isNewModalOpen || !!editingLetter}
          letterToEdit={editingLetter}
          onClose={() => {
            setIsNewModalOpen(false);
            setEditingLetter(null);
          }}
          onSuccess={() => {
            fetchLetters();
            setFeedbackMsg({
              type: 'success',
              text: editingLetter
                ? 'Data surat masuk berhasil diperbarui!'
                : 'Surat masuk berhasil diregistrasi ke dalam Buku Agenda!',
            });
            setTimeout(() => setFeedbackMsg(null), 5000);
          }}
        />

        {/* Modal: Lembar Disposisi Kakanwil */}
        <DisposisiModal
          isOpen={!!disposisiLetter}
          onClose={() => setDisposisiLetter(null)}
          letter={disposisiLetter}
          onArchiveToEArsip={handleArchiveToEArsip}
        />

        {/* Modal: Scanned PDF Document Viewer */}
        <LetterViewerModal
          isOpen={!!previewLetter}
          onClose={() => setPreviewLetter(null)}
          letter={previewLetter}
          onOpenDisposisi={(letter) => setDisposisiLetter(letter)}
          onArchiveToEArsip={handleArchiveToEArsip}
        />

      </div>
    </AppLayout>
  );
}
