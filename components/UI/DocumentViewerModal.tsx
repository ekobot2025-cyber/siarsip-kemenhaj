'use client';

import React from 'react';
import { X, Download, FileText, Shield, ExternalLink, Printer, CheckCircle } from 'lucide-react';
import { SecurityBadge, StatusBadge } from './Badge';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  archive: {
    id: number;
    archive_code: string;
    document_title: string;
    document_number?: string;
    document_date: string;
    unit_name?: string;
    category_name?: string;
    security_level: string;
    status: string;
    file_name?: string;
    file_size?: number;
    description?: string;
  } | null;
}

export function DocumentViewerModal({ isOpen, onClose, archive }: DocumentViewerModalProps) {
  if (!isOpen || !archive) return null;

  const downloadUrl = `/api/archives/${archive.id}/file?download=1`;
  const previewUrl = `/api/archives/${archive.id}/file`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1410]/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#e8dfc8]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c9a961]/25 bg-[#1A1410] text-white shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 bg-white/10 text-[#c9a961] rounded-xl border border-[#c9a961]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#c9a961]">{archive.archive_code}</span>
                <SecurityBadge level={archive.security_level} />
              </div>
              <h2 className="text-sm font-semibold text-white truncate mt-0.5">{archive.document_title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:brightness-105 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas</span>
            </a>
            <button
              onClick={() => window.print()}
              className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Cetak"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF9F5] flex flex-col md:flex-row gap-6">
          
          {/* Main Document Viewer Canvas / Paper */}
          <div className="flex-1 bg-white rounded-2xl shadow-md border border-[#e8dfc8] p-8 flex flex-col relative overflow-hidden">
            
            {/* Watermark for internal/restricted documents */}
            {archive.security_level !== 'PUBLIK' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 rotate-[-25deg]">
                <span className="text-6xl font-black tracking-widest text-[#1A1410] uppercase">
                  {archive.security_level} - KEMENHAJ PAPUA
                </span>
              </div>
            )}

            {/* Official Header Kop */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                KEMENTERIAN HAJI DAN UMRAH REPUBLIK INDONESIA
              </p>
              <h1 className="text-base font-black uppercase text-slate-950 tracking-wide mt-0.5">
                KANTOR WILAYAH PROVINSI PAPUA
              </h1>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Jl. Raya Abepura - Kotaraja, Jayapura, Papua • Telp/Fax: (0967) 581234
              </p>
              <div className="h-0.5 bg-slate-900 mt-3"></div>
              <div className="h-0.5 bg-slate-900 mt-0.5"></div>
            </div>

            {/* Document Content Details */}
            <div className="space-y-4 text-xs text-slate-800 flex-1">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider underline block">
                  LEMBAR ARSIP DOKUMEN RESMI
                </span>
                <span className="text-[11px] font-mono text-slate-600 block mt-1">
                  Nomor Surat: {archive.document_number || 'Tidak Dicantumkan'}
                </span>
              </div>

              <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#e8dfc8] space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-stone-500 font-medium">Judul Berkas:</span>
                  <span className="col-span-2 font-bold text-[#1A1410]">{archive.document_title}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-stone-500 font-medium">Unit Pengelola:</span>
                  <span className="col-span-2 font-semibold text-[#8a6d2b]">{archive.unit_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-stone-500 font-medium">Kategori Klasifikasi:</span>
                  <span className="col-span-2 font-medium text-slate-800">{archive.category_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-stone-500 font-medium">Tanggal Dokumen:</span>
                  <span className="col-span-2 font-medium text-slate-800">{archive.document_date}</span>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-bold text-slate-900 mb-1">Uraian / Ringkasan Isi Berkas:</h3>
                <p className="text-slate-700 leading-relaxed text-xs p-3 bg-white border border-slate-200 rounded-xl whitespace-pre-line">
                  {archive.description || 'Tidak ada deskripsi tambahan untuk arsip ini.'}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <div className="flex items-center space-x-1 text-[#8a6d2b]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Tervalidasi Sistem Kearsipan Digital SI-ARSIP Kanwil Papua</span>
                </div>
                <span className="font-mono">{archive.archive_code}</span>
              </div>
            </div>

            {/* Embedded Direct View Button */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 p-3 rounded-lg text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#b8941e]" />
                <span className="font-mono text-slate-700 font-semibold">{archive.file_name || 'berkas_arsip.pdf'}</span>
              </div>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[#8a6d2b] hover:text-[#1A1410] font-bold"
              >
                <span>Buka Berkas PDF Penuh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Right Sidebar: Meta & Security Info */}
          <div className="w-full md:w-72 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8dfc8] space-y-3">
              <h3 className="font-bold text-xs text-[#1A1410] uppercase tracking-wider border-b border-[#e8dfc8] pb-2">
                Informasi Dokumen
              </h3>
              
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">Klasifikasi Keamanan:</span>
                <div className="mt-1">
                  <SecurityBadge level={archive.security_level} />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-medium">Status Arsip:</span>
                <div className="mt-1">
                  <StatusBadge status={archive.status} />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-medium">Ukuran Berkas:</span>
                <p className="text-xs font-mono font-semibold text-slate-800 mt-0.5">
                  {archive.file_size ? `${(archive.file_size / 1024).toFixed(1)} KB` : '150 KB'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-medium">Kode Registrasi:</span>
                <p className="text-xs font-mono font-bold text-[#8a6d2b] mt-0.5">
                  {archive.archive_code}
                </p>
              </div>
            </div>

            <div className="bg-[#fbf8ee] rounded-2xl p-4 border border-[#e8dfc8] text-xs text-[#8a6d2b]">
              <div className="flex items-center space-x-1.5 font-bold mb-1">
                <Shield className="w-4 h-4 text-[#b8941e]" />
                <span>Integritas Arsip</span>
              </div>
              <p className="text-[11px] text-[#786c5e] leading-relaxed">
                Setiap akses terhadap dokumen ini tercatat dalam Audit Trail Kementerian Haji dan Umrah RI.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
