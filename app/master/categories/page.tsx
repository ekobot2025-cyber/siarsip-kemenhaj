'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import {
  Tag,
  PlusCircle,
  Edit2,
  Trash2,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ArchiveCategory, Unit } from '@/lib/types';

export default function MasterCategoriesPage() {
  const [categories, setCategories] = useState<ArchiveCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<ArchiveCategory | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unitId, setUnitId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setCategories(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => data.data && setUnits(data.data));
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setCode('');
    setName('');
    setUnitId('');
    setDescription('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (cat: ArchiveCategory) => {
    setEditingCat(cat);
    setCode(cat.code);
    setName(cat.name);
    setUnitId(cat.unit_id ? cat.unit_id.toString() : '');
    setDescription(cat.description || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || !name.trim()) {
      setError('Kode dan Nama Kategori wajib diisi.');
      return;
    }

    try {
      const url = editingCat ? `/api/categories/${editingCat.id}` : '/api/categories';
      const method = editingCat ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          unit_id: unitId ? parseInt(unitId, 10) : null,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan kategori');
        return;
      }

      setShowModal(false);
      fetchCategories();
    } catch {
      setError('Terjadi kendala saat menghubungi server');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Kategori Arsip</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Klasifikasi jenis dokumen arsip dinamis dan statis di lingkungan Kementerian Haji dan Umrah Kantor Wilayah Papua
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Kategori Baru</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">Memuat kategori arsip...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Nama Kategori</th>
                    <th className="py-3 px-4">Unit Kerja Terkait</th>
                    <th className="py-3 px-4">Jumlah Arsip</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        {c.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-sm">
                        {c.name}
                        {c.description && (
                          <span className="text-[10px] text-slate-400 block line-clamp-1 font-normal">
                            {c.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {c.unit_name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            [{c.unit_code}] {c.unit_name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                            Universal (Semua Unit)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px]">
                          {c.archive_count || 0} Arsip
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {c.is_active === 1 ? (
                          <span className="text-emerald-700 font-medium">Aktif</span>
                        ) : (
                          <span className="text-slate-400">Nonaktif</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                          title="Edit Kategori"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Add / Edit Category */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn">
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm">
                    {editingCat ? 'Edit Kategori Arsip' : 'Tambah Kategori Arsip Baru'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="m-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Kode Kategori *</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="CAT-XXX-01"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg uppercase font-mono font-bold focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Nama Kategori *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Dokumen Pajak"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Terkait dengan Unit</label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">Universal (Bisa Digunakan Semua Unit)</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        [{u.code}] {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deskripsi & Ruang Lingkup</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Penjelasan jenis berkas yang masuk dalam kategori ini..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                  >
                    Simpan Kategori
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
