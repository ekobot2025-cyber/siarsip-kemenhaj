'use client';

import React from 'react';
import { X, Printer, CheckCircle, FileText, ArrowRight, Shield } from 'lucide-react';

interface DisposisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: any;
  onArchiveToEArsip?: (letterId: number) => void;
}

export function DisposisiModal({ isOpen, onClose, letter, onArchiveToEArsip }: DisposisiModalProps) {
  if (!isOpen || !letter) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1410]/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e8dfc8] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#1A1410] text-white border-b border-[#c9a961]/25 shrink-0">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-[#c9a961]" />
            <h3 className="font-bold text-sm">Lembar Disposisi Surat Masuk</h3>
            <span className="font-mono text-xs font-bold text-[#8a6d2b] bg-[#fbf8ee] px-2 py-0.5 rounded border border-[#e8dfc8]">
              {letter.agenda_number}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#FAF9F5]/10 hover:bg-[#FAF9F5]/20 text-[#c9a961] border border-[#c9a961]/40 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-[#c9a961]" />
              <span>Cetak Lembar Disposisi</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF9F5] flex justify-center">
          <div className="bg-white w-full max-w-2xl p-6 sm:p-8 rounded-xl shadow-md border border-[#e8dfc8] text-slate-900 text-xs flex flex-col justify-between">
            
            <div>
              {/* Header Kop */}
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-700">
                  KEMENTERIAN HAJI DAN UMRAH REPUBLIK INDONESIA
                </p>
                <h2 className="font-black text-sm uppercase tracking-wide text-slate-900 mt-0.5">
                  KANTOR WILAYAH PROVINSI PAPUA
                </h2>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Jl. Raya Abepura &ndash; Kotaraja, Jayapura, Papua &bull; Email: kanwilpapua@haji.go.id
                </p>
                <div className="h-0.5 bg-slate-900 mt-2"></div>
                <div className="h-0.5 bg-slate-900 mt-0.5"></div>
              </div>

              {/* Title */}
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-1 border border-slate-800 font-bold uppercase tracking-wider text-xs">
                  LEMBAR DISPOSISI KEPALA KANTOR WILAYAH
                </span>
              </div>

              {/* Metadata Grid */}
              <div className="border border-slate-300 divide-y divide-slate-300 mb-4 text-[11px]">
                <div className="grid grid-cols-2 divide-x divide-slate-300 bg-slate-50">
                  <div className="p-2">
                    <span className="text-slate-500 block">NOMOR AGENDA:</span>
                    <span className="font-mono font-bold text-slate-900">{letter.agenda_number}</span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">TANGGAL DITERIMA:</span>
                    <span className="font-semibold text-slate-900">{letter.received_date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-300">
                  <div className="p-2">
                    <span className="text-slate-500 block">NOMOR SURAT ASLI:</span>
                    <span className="font-mono font-semibold text-slate-900">{letter.letter_number}</span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">TANGGAL SURAT:</span>
                    <span className="font-semibold text-slate-900">{letter.letter_date}</span>
                  </div>
                </div>

                <div className="p-2">
                  <span className="text-slate-500 block">ASAL SURAT / INSTANSI PENGIRIM:</span>
                  <span className="font-bold text-slate-900">{letter.sender_institution}</span>
                </div>

                <div className="p-2">
                  <span className="text-slate-500 block">PERIHAL:</span>
                  <span className="font-semibold text-slate-900">{letter.subject}</span>
                </div>

                <div className="p-2">
                  <span className="text-slate-500 block">SIFAT SURAT:</span>
                  <div className="flex space-x-4 mt-1 font-medium">
                    <span className={letter.letter_nature === 'Biasa' ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                      [{letter.letter_nature === 'Biasa' ? 'X' : ' '}] Biasa
                    </span>
                    <span className={letter.letter_nature === 'Penting' ? 'font-bold text-amber-800' : 'text-slate-400'}>
                      [{letter.letter_nature === 'Penting' ? 'X' : ' '}] Penting
                    </span>
                    <span className={letter.letter_nature === 'Segera' ? 'font-bold text-blue-800' : 'text-slate-400'}>
                      [{letter.letter_nature === 'Segera' ? 'X' : ' '}] Segera
                    </span>
                    <span className={letter.letter_nature === 'Rahasia' ? 'font-bold text-rose-800' : 'text-slate-400'}>
                      [{letter.letter_nature === 'Rahasia' ? 'X' : ' '}] Rahasia
                    </span>
                  </div>
                </div>
              </div>

              {/* Disposition Target & Instruction */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 mb-4 text-[11px]">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                    Diteruskan Kepada:
                  </h4>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" checked={letter.unit_code === 'KEU'} readOnly className="rounded text-[#b8941e]" />
                      <span>Bagian Keuangan</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" checked={letter.unit_code === 'PEG'} readOnly className="rounded text-[#b8941e]" />
                      <span>Bagian Kepegawaian</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" checked={letter.unit_code === 'UMH'} readOnly className="rounded text-[#b8941e]" />
                      <span>Bagian Umum dan Humas</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" checked={letter.unit_code === 'REN'} readOnly className="rounded text-[#b8941e]" />
                      <span>Bagian Perencanaan &amp; Anggaran</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" checked={letter.unit_code === 'HAJI'} readOnly className="rounded text-[#b8941e]" />
                      <span>Bidang Pembinaan Haji &amp; Umrah</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                    Petunjuk / Disposisi:
                  </h4>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" defaultChecked className="rounded text-[#b8941e]" />
                      <span>Tindak lanjuti sesuai ketentuan</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" defaultChecked={letter.letter_nature === 'Penting'} className="rounded text-[#b8941e]" />
                      <span>Siapkan bahan / laporan / telaah</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" className="rounded text-[#b8941e]" />
                      <span>Koordinasikan dengan pihak terkait</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" className="rounded text-[#b8941e]" />
                      <span>Hadiri / Wakili</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input type="checkbox" defaultChecked className="rounded text-[#b8941e]" />
                      <span>Arsipkan (E-Arsip)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Leader Notes Box */}
              <div className="border border-slate-300 p-3 mb-4">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block mb-1">
                  Catatan / Instruksi Khusus Pimpinan:
                </span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded min-h-[50px]">
                  {letter.notes || letter.summary || 'Mohon segera ditindaklanjuti dan dikoordinasikan sesuai prosedur kerja kedinasan.'}
                </p>
              </div>
            </div>

            {/* Bottom Signature Line */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
              <div>
                <p className="font-mono">ID Sistem: {letter.agenda_number}</p>
                <p>SI-ARSIP Kementerian Haji dan Umrah Kantor Wilayah Papua</p>
              </div>
              <div className="text-right">
                <p className="mb-8">Jayapura, {letter.received_date}</p>
                <p className="font-bold text-slate-900 border-b border-slate-800 pb-0.5 inline-block">
                  Kepala Kantor Wilayah
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#e8dfc8] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-stone-500">Status Berkas:</span>
            <span className="font-bold text-[#8a6d2b] bg-[#fbf8ee] border border-[#e8dfc8] px-2 py-0.5 rounded">
              {letter.status}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!letter.archive_id ? (
              <button
                onClick={() => onArchiveToEArsip && onArchiveToEArsip(letter.id)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:brightness-105 text-white rounded-xl text-xs font-bold shadow-xs shadow-[#c9a961]/30 transition cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>+ Masukkan ke E-Arsip Sekarang</span>
              </button>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Sudah Masuk E-Arsip
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#e8dfc8] text-stone-700 rounded-xl text-xs font-semibold hover:bg-[#fbf8ee] cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
