'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import {
  BarChart3,
  Printer,
  Download,
  Filter,
  Building2,
  Calendar,
  FileText,
  PieChart,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { Unit } from '@/lib/types';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('unit');
  const [units, setUnits] = useState<Unit[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter params
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedUnit, setSelectedUnit] = useState('');

  useEffect(() => {
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => data.data && setUnits(data.data));

    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Laporan Rekapitulasi Kearsipan</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Laporan akuntabilitas kearsipan digital Kantor Wilayah Kementerian Agama Provinsi Papua
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>
            <button
              onClick={() => alert('Mengunduh rekap kearsipan format Excel (.xlsx)...')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Jenis Laporan:</span>
          </div>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="unit">Rekapitulasi Arsip per Unit Kerja</option>
            <option value="category">Rekapitulasi Arsip per Kategori Klasifikasi</option>
            <option value="growth">Laporan Tren Pertumbuhan Berkas</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="2026">Tahun Anggaran 2026</option>
            <option value="2025">Tahun Anggaran 2025</option>
            <option value="2024">Tahun Anggaran 2024</option>
          </select>
        </div>

        {/* Report Content Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 text-center">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              REKAPITULASI PENGELOLAAN ARSIP ELEKTRONIK
            </h2>
            <h3 className="text-xs font-semibold text-emerald-800 uppercase mt-0.5">
              KANTOR WILAYAH KEMENTERIAN AGAMA PROVINSI PAPUA
            </h3>
            <p className="text-xs text-slate-500 mt-1">Periode Tahun Anggaran: {selectedYear}</p>
          </div>

          <div className="p-6">
            {reportType === 'unit' && stats && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Kode Unit</th>
                      <th className="py-3 px-4">Nama Unit Kerja</th>
                      <th className="py-3 px-4">Volume Berkas</th>
                      <th className="py-3 px-4">Persentase</th>
                      <th className="py-3 px-4">Status Pengelolaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {stats.unitDistribution.map((u: any, idx: number) => {
                      const pct = stats.totalArchives > 0 ? ((u.count / stats.totalArchives) * 100).toFixed(1) : '0';
                      return (
                        <tr key={u.unitId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-800">{u.unitCode}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{u.unitName}</td>
                          <td className="py-3 px-4 font-bold font-mono text-slate-900">{u.count} Dokumen</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="font-mono text-slate-600 font-semibold">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              LENGKAP & AKTIF
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right">TOTAL ARSIP TERSIMPAN:</td>
                      <td className="py-3 px-4 font-mono text-emerald-900 text-sm">{stats.totalArchives} Dokumen</td>
                      <td colSpan={2} className="py-3 px-4 text-slate-500 font-normal">100% Terverifikasi</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {reportType === 'category' && stats && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nama Klasifikasi Kategori</th>
                      <th className="py-3 px-4">Jumlah Dokumen</th>
                      <th className="py-3 px-4">Retensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {stats.categoryDistribution.map((c: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{c.categoryName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.count} Berkas</td>
                        <td className="py-3 px-4 text-slate-500">Aktif (5 Tahun)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'growth' && stats && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Tren Pertumbuhan Bulanan (2026)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {stats.monthlyStats.map((m: any) => (
                    <div key={m.month} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-xs font-bold text-slate-600 block">{m.month}</span>
                      <p className="text-lg font-black text-emerald-800 mt-1">{m.archives}</p>
                      <span className="text-[10px] text-slate-400">Berkas Baru</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
