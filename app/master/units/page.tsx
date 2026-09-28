'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import {
  Building2,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  FolderOpen
} from 'lucide-react';
import { Unit } from '@/lib/types';

export default function MasterUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderNip, setLeaderNip] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUnits = () => {
    setLoading(true);
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setUnits(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const openAddModal = () => {
    setEditingUnit(null);
    setCode('');
    setName('');
    setLeaderName('');
    setLeaderNip('');
    setDescription('');
    setDisplayOrder((units.length + 1).toString());
    setError('');
    setShowModal(true);
  };

  const openEditModal = (u: Unit) => {
    setEditingUnit(u);
    setCode(u.code);
    setName(u.name);
    setLeaderName(u.leader_name || '');
    setLeaderNip(u.leader_nip || '');
    setDescription(u.description || '');
    setDisplayOrder(u.display_order.toString());
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code.trim() || !name.trim()) {
      setError('Kode Unit dan Nama Unit wajib diisi.');
      return;
    }

    try {
      const url = editingUnit ? `/api/units/${editingUnit.id}` : '/api/units';
      const method = editingUnit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          leader_name: leaderName.trim(),
          leader_nip: leaderNip.trim(),
          description: description.trim(),
          display_order: parseInt(displayOrder, 10) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan unit kerja');
        return;
      }

      setSuccess(data.message || 'Unit kerja berhasil disimpan');
      setShowModal(false);
      fetchUnits();
    } catch {
      setError('Terjadi kendala jaringan saat menghubungi server');
    }
  };

  const handleToggleActive = async (u: Unit) => {
    const newStatus = u.is_active === 1 ? 0 : 1;
    const actionLabel = newStatus === 1 ? 'mengaktifkan' : 'menonaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} unit kerja "${u.name}"?`)) return;

    try {
      const res = await fetch(`/api/units/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.ok) {
        fetchUnits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Unit Kerja</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola struktur bagian dan bidang pada Kantor Wilayah Kementerian Agama Provinsi Papua
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Unit Kerja Baru</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">Memuat daftar unit...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Urutan</th>
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Nama Unit Kerja</th>
                    <th className="py-3 px-4">Pimpinan Unit</th>
                    <th className="py-3 px-4">Jumlah Arsip</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {units.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                        {u.display_order}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        {u.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                        {u.name}
                        {u.description && (
                          <span className="text-[10px] text-slate-400 block line-clamp-1 font-normal">
                            {u.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{u.leader_name || '-'}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {u.leader_nip ? `NIP: ${u.leader_nip}` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px]">
                          {u.archive_count || 0} Arsip
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {u.is_active === 1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                            <XCircle className="w-3 h-3 mr-1" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`p-1.5 rounded transition ${
                            u.is_active === 1
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={u.is_active === 1 ? 'Nonaktifkan Unit' : 'Aktifkan Unit'}
                        >
                          {u.is_active === 1 ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Add / Edit Unit */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn">
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm">
                    {editingUnit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}
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
                    <label className="block text-slate-700 font-bold mb-1">Kode Unit *</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Contoh: KEU"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg uppercase font-mono font-bold focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Nama Unit Kerja *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Bagian Keuangan"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Pimpinan</label>
                    <input
                      type="text"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      placeholder="Nama Lengkap & Gelar"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">NIP Pimpinan</label>
                    <input
                      type="text"
                      value={leaderNip}
                      onChange={(e) => setLeaderNip(e.target.value)}
                      placeholder="18 digit NIP"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deskripsi Tugas & Fungsi</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Uraian tugas pokok dan wewenang pengelolaan dokumen..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Urutan Tampilan</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-24 p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
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
                    Simpan Unit
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
