'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { SecurityBadge, StatusBadge } from '@/components/UI/Badge';
import { DocumentViewerModal } from '@/components/UI/DocumentViewerModal';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Download,
  FileText,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  RotateCcw,
  Building2,
  Calendar,
  Shield,
  ExternalLink
} from 'lucide-react';
import { Archive, Unit, ArchiveCategory } from '@/lib/types';

function ArchivesContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialUnit = searchParams.get('unit_id') || searchParams.get('unit_code') || '';
  const initialFavorite = searchParams.get('favorite') === '1';

  const [archives, setArchives] = useState<Archive[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<ArchiveCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedUnit, setSelectedUnit] = useState(initialUnit);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSecurity, setSelectedSecurity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Document Preview Modal
  const [previewArchive, setPreviewArchive] = useState<any>(null);

  // Fetch Units & Categories for filter dropdowns
  useEffect(() => {
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => data.data && setUnits(data.data));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => data.data && setCategories(data.data));
  }, []);

  const fetchArchives = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedUnit) {
      if (!isNaN(Number(selectedUnit))) {
        params.set('unit_id', selectedUnit);
      } else {
        params.set('unit_code', selectedUnit);
      }
    }
    if (selectedCategory) params.set('category_id', selectedCategory);
    if (selectedYear) params.set('year', selectedYear);
    if (selectedSecurity) params.set('security_level', selectedSecurity);
    if (selectedStatus) params.set('status', selectedStatus);
    if (initialFavorite) params.set('favorite', '1');
    params.set('page', page.toString());
    params.set('limit', '10');

    fetch(`/api/archives?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setArchives(data.data);
          setTotalCount(data.pagination.total);
          setTotalPages(data.pagination.totalPages || 1);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load archives:', err);
        setLoading(false);
      });
  }, [searchQuery, selectedUnit, selectedCategory, selectedYear, selectedSecurity, selectedStatus, initialFavorite, page]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedUnit('');
    setSelectedCategory('');
    setSelectedYear('');
    setSelectedSecurity('');
    setSelectedStatus('');
    setPage(1);
  };

  const handleToggleFavorite = async (archiveId: number) => {
    try {
      const res = await fetch(`/api/archives/${archiveId}/favorite`, { method: 'POST' });
      if (res.ok) {
        setArchives((prev) =>
          prev.map((a) => (a.id === archiveId ? { ...a, is_favorite: !a.is_favorite } : a))
        );
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {initialFavorite ? 'Dokumen Favorit Saya' : 'Semua Arsip Digital'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {totalCount} Berkas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pusat penyimpanan arsip digital terklasifikasi Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                showFilters || selectedUnit || selectedCategory || selectedYear || selectedSecurity
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Lanjutan</span>
            </button>

            <Link
              href="/archives/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Arsip</span>
            </Link>
          </div>
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari berdasarkan judul, kode arsip, nomor dokumen, perihal, atau tag..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Unit Filter */}
            <div className="sm:w-64">
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Bagian / Bidang</option>
                {units.map((u) => (
                  <option key={u.id} value={u.code}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Collapsible Advanced Filters Drawer */}
          {showFilters && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tahun Dokumen</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Semua Tahun</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tingkat Akses</label>
                <select
                  value={selectedSecurity}
                  onChange={(e) => {
                    setSelectedSecurity(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Semua Tingkat Akses</option>
                  <option value="PUBLIK">Publik</option>
                  <option value="INTERNAL">Internal</option>
                  <option value="TERBATAS">Terbatas</option>
                  <option value="RAHASIA">Rahasia</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Status Arsip</label>
                <div className="flex space-x-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(1);
                    }}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Semua Status</option>
                    <option value="AKTIF">Aktif</option>
                    <option value="INAKTIF">Inaktif</option>
                    <option value="PERMANEN">Permanen</option>
                  </select>
                  <button
                    onClick={handleResetFilters}
                    className="p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                    title="Reset Filter"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium">Memuat data arsip...</p>
            </div>
          ) : archives.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum ada arsip pada kriteria ini</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan sesuaikan kata kunci pencarian atau filter yang dipilih, atau tambahkan dokumen arsip baru.
              </p>
              <div className="pt-2">
                <Link
                  href="/archives/new"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Tambah Arsip Sekarang</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-8 text-center">⭐</th>
                    <th className="py-3 px-4">Kode Arsip</th>
                    <th className="py-3 px-4">Tanggal / Thn</th>
                    <th className="py-3 px-4">Nomor Dokumen</th>
                    <th className="py-3 px-4">Judul Dokumen</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Unit Kerja</th>
                    <th className="py-3 px-4">Akses</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {archives.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Favorite Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleFavorite(item.id)}
                          className={`p-1 rounded transition-colors ${
                            item.is_favorite
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                          title={item.is_favorite ? 'Hapus dari Favorit' : 'Tandai Favorit'}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.is_favorite ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Kode Arsip */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-emerald-800">
                        <Link href={`/archives/${item.id}`} className="hover:underline">
                          {item.archive_code}
                        </Link>
                      </td>

                      {/* Tanggal / Tahun */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <div>{item.document_date}</div>
                        <span className="text-[10px] text-slate-400">{item.year}</span>
                      </td>

                      {/* Nomor Dokumen */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-[150px] truncate" title={item.document_number}>
                        {item.document_number || '-'}
                      </td>

                      {/* Judul Dokumen */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <Link
                          href={`/archives/${item.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-700 line-clamp-2 leading-snug"
                        >
                          {item.document_title}
                        </Link>
                        {item.subject && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                            Perihal: {item.subject}
                          </span>
                        )}
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <span className="truncate max-w-[130px] block" title={item.category_name}>
                          {item.category_name}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700"
                          title={item.unit_name}
                        >
                          {item.unit_code}
                        </span>
                      </td>

                      {/* Tingkat Akses */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SecurityBadge level={item.security_level} />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <div className="flex items-center space-x-1 justify-end">
                            <button
                              onClick={() => setPreviewArchive(item)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              title="Pratinjau Cepat"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={`/api/archives/${item.id}/file?download=1`}
                              download
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Unduh Berkas"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <Link
                              href={`/archives/${item.id}`}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                              title="Detail Lengkap"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {!loading && archives.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-slate-100 text-xs text-slate-500 gap-2">
              <div>
                Menampilkan <span className="font-semibold text-slate-800">{(page - 1) * 10 + 1}</span> -{' '}
                <span className="font-semibold text-slate-800">
                  {Math.min(page * 10, totalCount)}
                </span>{' '}
                dari <span className="font-semibold text-slate-800">{totalCount}</span> dokumen
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Sebelumnya
                </button>
                <span className="px-3 py-1 font-semibold text-slate-800">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
                >
                  Selanjutnya
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Preview Modal */}
      <DocumentViewerModal
        isOpen={!!previewArchive}
        onClose={() => setPreviewArchive(null)}
        archive={previewArchive}
      />
    </AppLayout>
  );
}

export default function ArchivesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">Memuat E-Arsip...</p>
      </div>
    }>
      <ArchivesContent />
    </Suspense>
  );
}

