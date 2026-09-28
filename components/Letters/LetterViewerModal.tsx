'use client';

import React from 'react';
import { X, Download, FileText, Printer, CheckCircle, ExternalLink, Shield } from 'lucide-react';

interface LetterViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: any;
  onOpenDisposisi?: (letter: any) => void;
  onArchiveToEArsip?: (letterId: number) => void;
}

export function LetterViewerModal({
  isOpen,
  onClose,
  letter,
  onOpenDisposisi,
  onArchiveToEArsip,
}: LetterViewerModalProps) {
  if (!isOpen || !letter) return null;

  const downloadUrl = `/api/letters/incoming/${letter.id}/file?download=1`;
  const previewUrl = `/api/letters/incoming/${letter.id}/file`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1410]/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] border border-[#e8dfc8]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#1A1410] text-white border-b border-[#c9a961]/25 shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 bg-white/10 text-[#c9a961] rounded-xl border border-[#c9a961]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#c9a961]">{letter.agenda_number}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8]">
                  {letter.letter_nature || 'Biasa'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-white/10 text-[#FAF9F5] border border-white/20">
                  {letter.unit_code}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white truncate mt-0.5">
                {letter.subject} &bull; <span className="text-[#FAF9F5]/70 font-normal">{letter.sender_institution}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenDisposisi && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDisposisi(letter);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#fbf8ee] hover:bg-[#f3ebd3] text-[#8a6d2b] border border-[#e8dfc8] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#b8941e]" />
                <span>Lembar Disposisi</span>
              </button>
            )}

            <a
              href={downloadUrl}
              download
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#FAF9F5] text-xs font-medium rounded-xl transition border border-white/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#c9a961]" />
              <span>Unduh Berkas</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Toolbar */}
        <div className="bg-[#FAF9F5] px-6 py-2.5 border-b border-[#e8dfc8] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-stone-600">
            <div>
              <span className="text-stone-400 font-medium mr-1.5">No. Surat Asli:</span>
              <span className="font-mono font-bold text-[#1A1410]">{letter.letter_number}</span>
            </div>
            <div>
              <span className="text-stone-400 font-medium mr-1.5">Tgl Surat:</span>
              <span className="font-medium text-[#1A1410]">{letter.letter_date}</span>
            </div>
            <div>
              <span className="text-stone-400 font-medium mr-1.5">Diterima:</span>
              <span className="font-medium text-[#1A1410]">{letter.received_date}</span>
            </div>
            <div>
              <span className="text-stone-400 font-medium mr-1.5">Pengirim:</span>
              <span className="font-bold text-[#1A1410]">{letter.sender_institution}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!letter.archive_id ? (
              <button
                onClick={() => onArchiveToEArsip && onArchiveToEArsip(letter.id)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:brightness-105 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>+ Masukkan ke E-Arsip</span>
              </button>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Terdaftar di E-Arsip
              </span>
            )}
          </div>
        </div>

        {/* Document Viewer Frame */}
        <div className="flex-1 bg-stone-900 relative">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={`Preview Surat ${letter.agenda_number}`}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-white border-t border-[#e8dfc8] flex items-center justify-between text-[11px] text-stone-500 shrink-0">
          <span>SI-ARSIP &bull; Kantor Wilayah Kementerian Agama / Kemenhaj Provinsi Papua</span>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-stone-600">{letter.file_name || 'berkas_scan.pdf'}</span>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-[#8a6d2b] hover:text-[#1A1410] font-bold"
            >
              <span>Buka di Tab Baru</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
