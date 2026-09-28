'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Lock,
  Download,
  Eye,
  PlusCircle
} from 'lucide-react';
import { AuditLog } from '@/lib/types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedModule) params.set('module', selectedModule);
    if (selectedAction) params.set('action', selectedAction);
    params.set('page', page.toString());
    params.set('limit', '15');

    fetch(`/api/audit-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setLogs(data.data);
          setTotalCount(data.pagination.total);
          setTotalPages(data.pagination.totalPages || 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModule, selectedAction, page]);

  const handleReset = () => {
    setSelectedModule('');
    setSelectedAction('');
    setPage(1);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('DENIED')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">{action}</span>;
    }
    if (action === 'LOGIN' || action === 'LOGOUT') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">{action}</span>;
    }
    if (action.startsWith('CREATE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{action}</span>;
    }
    if (action.startsWith('UPDATE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{action}</span>;
    }
    if (action.startsWith('DELETE') || action.startsWith('DEACTIVATE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">{action}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{action}</span>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Audit Trail & Rekam Jejak Sistem</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {totalCount} Aktivitas Tercatat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Log aktivitas tidak dapat dimanipulasi dan menjamin transparansi serta akuntabilitas kearsipan
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter Modul:</span>
          </div>

          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setPage(1);
            }}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua Modul</option>
            <option value="AUTH">Autentikasi (AUTH)</option>
            <option value="ARCHIVE">E-Arsip (ARCHIVE)</option>
            <option value="UNIT">Unit Kerja (UNIT)</option>
            <option value="CATEGORY">Kategori (CATEGORY)</option>
            <option value="USER">Pengguna (USER)</option>
            <option value="SECURITY">Keamanan (SECURITY)</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua Jenis Aksi</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="CREATE_ARCHIVE">CREATE_ARCHIVE</option>
            <option value="PREVIEW_ARCHIVE">PREVIEW_ARCHIVE</option>
            <option value="DOWNLOAD_FILE">DOWNLOAD_FILE</option>
            <option value="UPDATE_ARCHIVE">UPDATE_ARCHIVE</option>
            <option value="DELETE_ARCHIVE">DELETE_ARCHIVE</option>
          </select>

          {(selectedModule || selectedAction) && (
            <button
              onClick={handleReset}
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Audit Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">Memuat catatan audit...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Waktu (WIP)</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Modul</th>
                    <th className="py-3 px-4">Aksi</th>
                    <th className="py-3 px-4">Kode Record</th>
                    <th className="py-3 px-4">Deskripsi Aktivitas</th>
                    <th className="py-3 px-4">Alamat IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500">
                        {log.created_at}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-900">
                        {log.user_name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[10px] text-slate-500">{log.module}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-emerald-800 font-medium">
                        {log.record_id || '-'}
                      </td>
                      <td className="py-3 px-4 max-w-md text-slate-800">
                        {log.description}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] text-slate-400">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 text-xs text-slate-500">
              <div>
                Halaman {page} dari {totalPages} ({totalCount} total)
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  Selanjutnya
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
