import React from 'react';

export function SecurityBadge({ level }: { level: string }) {
  switch (level) {
    case 'PUBLIK':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] mr-1.5"></span>
          Publik
        </span>
      );
    case 'INTERNAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b8941e] mr-1.5"></span>
          Internal
        </span>
      );
    case 'TERBATAS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
          Terbatas
        </span>
      );
    case 'RAHASIA':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>
          Rahasia
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FAF9F5] text-stone-700 border border-[#e8dfc8]">
          {level}
        </span>
      );
  }
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'AKTIF':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
          Aktif
        </span>
      );
    case 'INAKTIF':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF9F5] text-stone-600 border border-[#e8dfc8]">
          Inaktif
        </span>
      );
    case 'PERMANEN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8]">
          Permanen
        </span>
      );
    case 'DIMUSNAHKAN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Dimusnahkan
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF9F5] text-stone-700 border border-[#e8dfc8]">
          {status}
        </span>
      );
  }
}
