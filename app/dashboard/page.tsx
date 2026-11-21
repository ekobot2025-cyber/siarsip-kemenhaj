'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/Layout/AppLayout';
import { SecurityBadge, StatusBadge } from '@/components/UI/Badge';
import { DocumentViewerModal } from '@/components/UI/DocumentViewerModal';
import {
  Archive,
  Calendar,
  Mail,
  Send,
  Building2,
  FileCheck,
  PlusCircle,
  Search,
  BarChart3,
  Eye,
  ArrowRight,
  TrendingUp,
  Clock,
  User,
  Shield,
  FileText,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArchiveForPreview, setSelectedArchiveForPreview] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.monthlyStats)) {
          setStats(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats || !Array.isArray(stats.monthlyStats)) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-28 bg-[#fbf8ee] border border-[#e8dfc8] rounded-2xl w-full"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white border border-[#e8dfc8] rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-white border border-[#e8dfc8] rounded-2xl"></div>
            <div className="h-72 bg-white border border-[#e8dfc8] rounded-2xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const monthlyStats = Array.isArray(stats.monthlyStats) ? stats.monthlyStats : [];
  const unitDistribution = Array.isArray(stats.unitDistribution) ? stats.unitDistribution : [];
  const recentDocuments = Array.isArray(stats.recentDocuments) ? stats.recentDocuments : [];
  const recentActivities = Array.isArray(stats.recentActivities) ? stats.recentActivities : [];

  const maxMonthlyVal = Math.max(
    ...monthlyStats.map((m: any) => Math.max(m.archives || 0, m.suratMasuk || 0, m.suratKeluar || 0)),
    10
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Welcome Banner Kemenhaj Royal Obsidian & Gold */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A1410] via-[#2A2018] to-[#1A1410] text-white p-6 sm:p-8 shadow-md border border-[#c9a961]/30">
          <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAF9F5]/10 border border-[#c9a961]/40 text-[#c9a961] text-xs font-bold mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a961]" />
              <span>Sentralisasi Arsip &amp; Persuratan Digital Resmi Kanwil Papua</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Selamat Datang di SI-ARSIP <span className="text-[#c9a961]">KEMENHAJ</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#c9a961] mt-1">
              Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua
            </p>
            <p className="text-xs text-[#FAF9F5]/80 mt-2 leading-relaxed max-w-2xl">
              Pengelolaan arsip digital terklasifikasi, registrasi agenda persuratan masuk dan keluar, 
              serta penelusuran berkas antar-bagian dalam lingkungan Kanwil Papua secara aman, cepat, dan akuntabel.
            </p>
          </div>

          {/* Sub-Indicators Pill Bar */}
          <div className="mt-6 pt-4 border-t border-[#c9a961]/25 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-[#c9a961]/25 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#c9a961]"></span>
              <span className="text-[#FAF9F5]/90">Dokumen Baru Bulan Ini:</span>
              <span className="font-bold text-[#c9a961] font-mono">{stats.newDocsCount ?? 0}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-[#c9a961]/25 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-[#FAF9F5]/90">Surat Belum Diproses:</span>
              <span className="font-bold text-amber-300 font-mono">{stats.unprocessedLettersCount ?? 0}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-[#c9a961]/25 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
              <span className="text-[#FAF9F5]/90">Aktivitas Hari Ini:</span>
              <span className="font-bold text-white font-mono">{stats.todayActivitiesCount} Catatan</span>
            </div>
          </div>
        </div>

        {/* Akses Cepat (Quick Actions) */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-[#e8dfc8]">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-[#8a6d2b] uppercase tracking-wider">Akses Cepat Layanan</span>
            <span className="text-[11px] text-[#786c5e]">Pintasan Fitur Utama</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              href="/archives/new"
              className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#fbf8ee] hover:bg-[#f3ebd3] text-[#8a6d2b] rounded-xl text-xs font-bold border border-[#e8dfc8] transition-all shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-[#b8941e]" />
              <span>+ Tambah Arsip</span>
            </Link>
            <Link
              href="/persuratan/masuk"
              className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:brightness-105 text-white rounded-xl text-xs font-bold shadow-xs shadow-[#c9a961]/30 transition-all"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>+ Surat Masuk &amp; Scan</span>
            </Link>
            <Link
              href="/persuratan/keluar"
              className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#fbf8ee] hover:bg-[#f3ebd3] text-[#8a6d2b] rounded-xl text-xs font-bold border border-[#e8dfc8] transition-all shadow-2xs"
            >
              <Send className="w-4 h-4 text-[#b8941e]" />
              <span>+ Surat Keluar</span>
            </Link>
            <Link
              href="/archives"
              className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#fbf8ee] hover:bg-[#f3ebd3] text-[#8a6d2b] rounded-xl text-xs font-bold border border-[#e8dfc8] transition-all shadow-2xs"
            >
              <Search className="w-4 h-4 text-[#b8941e]" />
              <span>Cari Arsip</span>
            </Link>
            <Link
              href="/reports"
              className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#fbf8ee] hover:bg-[#f3ebd3] text-[#8a6d2b] rounded-xl text-xs font-bold border border-[#e8dfc8] transition-all shadow-2xs col-span-2 sm:col-span-1"
            >
              <BarChart3 className="w-4 h-4 text-[#b8941e]" />
              <span>Laporan</span>
            </Link>
          </div>
        </div>

        {/* 6 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div className="bg-white p-4 rounded-2xl shadow-2xs border border-[#e8dfc8] hover:border-[#c9a961] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Total Arsip</span>
              <div className="p-1.5 bg-[#fbf8ee] rounded-lg text-[#8a6d2b] border border-[#e8dfc8]">
                <Archive className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#1A1410] mt-2 font-mono">{stats.totalArchives}</p>
            <span className="text-[10px] text-[#8a6d2b] font-medium">Tersimpan Permanen</span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-2xs border border-[#e8dfc8] hover:border-[#c9a961] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Arsip Th. 2026</span>
              <div className="p-1.5 bg-[#fbf8ee] rounded-lg text-[#8a6d2b] border border-[#e8dfc8]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#1A1410] mt-2 font-mono">{stats.archivesThisYear}</p>
            <span className="text-[10px] text-[#8a6d2b] font-medium">Tahun Berjalan</span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-2xs border border-[#e8dfc8] hover:border-[#c9a961] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Surat Masuk</span>
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-700 border border-blue-200">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#1A1410] mt-2 font-mono">{stats.incomingLetters}</p>
            <span className="text-[10px] text-blue-700 font-medium">Tercatat di Agenda</span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-2xs border border-[#e8dfc8] hover:border-[#c9a961] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Surat Keluar</span>
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-700 border border-indigo-200">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#1A1410] mt-2 font-mono">{stats.outgoingLetters}</p>
            <span className="text-[10px] text-indigo-700 font-medium">Diterbitkan Kanwil</span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-2xs border border-[#e8dfc8] hover:border-[#c9a961] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Unit Kerja</span>
              <div className="p-1.5 bg-[#fbf8ee] rounded-lg text-[#8a6d2b] border border-[#e8dfc8]">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#1A1410] mt-2 font-mono">{stats.totalUnits}</p>
            <span className="text-[10px] text-[#8a6d2b] font-medium">Bagian &amp; Bidang</span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-2xs border border-[#e8dfc8] hover:border-[#c9a961] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Bulan Ini</span>
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-200">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#1A1410] mt-2 font-mono">{stats.documentsThisMonth}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Dokumen Diproses</span>
          </div>

        </div>

        {/* Charts Section: Aktivitas Arsip & Distribusi Unit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart: Aktivitas Arsip (Januari - Desember) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-2xs border border-[#e8dfc8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e8dfc8] gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#1A1410]">Aktivitas Kearsipan &amp; Persuratan 2026</h3>
                <p className="text-xs text-[#786c5e]">Rekapitulasi volume berkas Januari &ndash; Desember</p>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#c9a961]"></span>
                  <span className="text-stone-600 font-medium">Arsip</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#059669]"></span>
                  <span className="text-stone-600 font-medium">Surat Masuk</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#b8941e]"></span>
                  <span className="text-stone-600 font-medium">Surat Keluar</span>
                </div>
              </div>
            </div>

            {/* Clean, Scaled CSS Bar Chart */}
            <div className="mt-6 pt-4 h-56 flex items-end justify-between gap-2 border-b border-[#e8dfc8] px-2">
              {stats.monthlyStats.map((item: any) => {
                const archH = Math.min(100, Math.round((item.archives / maxMonthlyVal) * 100));
                const smH = Math.min(100, Math.round((item.suratMasuk / maxMonthlyVal) * 100));
                const skH = Math.min(100, Math.round((item.suratKeluar / maxMonthlyVal) * 100));

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Arsip bar */}
                      <div
                        style={{ height: `${archH}%` }}
                        className="w-1.5 sm:w-2.5 bg-[#c9a961] rounded-t-xs transition-all duration-500 group-hover:bg-[#b8941e]"
                        title={`Arsip: ${item.archives}`}
                      ></div>
                      {/* Surat Masuk bar */}
                      <div
                        style={{ height: `${smH}%` }}
                        className="w-1.5 sm:w-2.5 bg-[#059669] rounded-t-xs transition-all duration-500 group-hover:brightness-110"
                        title={`Surat Masuk: ${item.suratMasuk}`}
                      ></div>
                      {/* Surat Keluar bar */}
                      <div
                        style={{ height: `${skH}%` }}
                        className="w-1.5 sm:w-2.5 bg-[#b8941e] rounded-t-xs transition-all duration-500 group-hover:brightness-110"
                        title={`Surat Keluar: ${item.suratKeluar}`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
              <span>* Data terhimpun otomatis dari database transaksi persuratan &amp; e-arsip.</span>
              <span className="font-semibold text-[#8a6d2b]">Tahun Anggaran 2026</span>
            </div>
          </div>

          {/* Right Chart: Distribusi Arsip per Unit */}
          <div className="bg-white p-6 rounded-2xl shadow-2xs border border-[#e8dfc8] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1A1410]">Distribusi Dokumen per Unit Kerja</h3>
              <p className="text-xs text-[#786c5e] mb-4">Jumlah arsip aktif pada masing-masing bagian/bidang</p>

              <div className="space-y-3.5">
                {stats.unitDistribution.map((u: any) => {
                  const percent = stats.totalArchives > 0 ? Math.round((u.count / stats.totalArchives) * 100) : 0;
                  return (
                    <div key={u.unitId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-700 truncate max-w-[170px]" title={u.unitName}>
                          {u.unitName}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-[#1A1410] font-mono">{u.count}</span>
                          <span className="text-[10px] text-stone-400">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[#FAF9F5] border border-[#e8dfc8] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#c9a961] to-[#b8941e] rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#e8dfc8]">
              <Link
                href="/master/units"
                className="w-full inline-flex items-center justify-center text-xs font-bold text-[#8a6d2b] hover:text-[#1A1410]"
              >
                <span>Kelola Master Unit Kerja</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

        </div>

        {/* Section: Dokumen Terbaru & Aktivitas Terbaru */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dokumen Terbaru (Table) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xs border border-[#e8dfc8] overflow-hidden">
            <div className="p-5 border-b border-[#e8dfc8] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1A1410]">Dokumen Terbaru</h3>
                <p className="text-xs text-[#786c5e]">Arsip yang baru saja ditambahkan ke sistem</p>
              </div>
              <Link
                href="/archives"
                className="text-xs font-bold text-[#8a6d2b] hover:text-[#1A1410] flex items-center"
              >
                <span>Semua Arsip</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbf8ee] text-[#8a6d2b] border-b border-[#e8dfc8] font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Kode Arsip</th>
                    <th className="py-2.5 px-4 font-bold">Judul Dokumen</th>
                    <th className="py-2.5 px-4 font-bold">Unit</th>
                    <th className="py-2.5 px-4 font-bold">Akses</th>
                    <th className="py-2.5 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF9F5] text-stone-700">
                  {stats.recentDocuments.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-[#fbf8ee]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#8a6d2b] whitespace-nowrap">
                        {doc.archive_code}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <Link href={`/archives/${doc.id}`} className="font-semibold text-[#1A1410] hover:text-[#8a6d2b] line-clamp-1">
                          {doc.document_title}
                        </Link>
                        <span className="text-[10px] text-stone-400 block mt-0.5">{doc.document_date}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-[#FAF9F5] border border-[#e8dfc8] rounded text-[11px] text-stone-700 font-medium">
                          {doc.unit_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SecurityBadge level={doc.security_level} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedArchiveForPreview(doc)}
                          className="p-1.5 text-stone-500 hover:text-[#8a6d2b] hover:bg-[#fbf8ee] rounded transition-colors"
                          title="Pratinjau Cepat"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/archives/${doc.id}`}
                          className="p-1.5 text-stone-500 hover:text-[#1A1410] hover:bg-stone-100 rounded inline-block transition-colors"
                          title="Lihat Detail"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aktivitas Terbaru (Audit Feed) */}
          <div className="bg-white rounded-2xl shadow-2xs border border-[#e8dfc8] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#e8dfc8]">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1410]">Aktivitas Terbaru</h3>
                  <p className="text-xs text-[#786c5e]">Audit trail kegiatan pengguna</p>
                </div>
                <Clock className="w-4 h-4 text-[#8a6d2b]" />
              </div>

              <div className="mt-4 space-y-3.5">
                {stats.recentActivities.map((act: any) => (
                  <div key={act.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {act.user_name ? act.user_name.charAt(0) : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1A1410] truncate">{act.user_name}</p>
                      <p className="text-stone-600 text-[11px] line-clamp-2 mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-stone-400 font-mono mt-1 block">{act.created_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#e8dfc8]">
              <Link
                href="/audit-logs"
                className="w-full inline-flex items-center justify-center text-xs font-bold text-[#8a6d2b] hover:text-[#1A1410]"
              >
                <span>Lihat Seluruh Catatan Audit</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!selectedArchiveForPreview}
        onClose={() => setSelectedArchiveForPreview(null)}
        archive={selectedArchiveForPreview}
      />
    </AppLayout>
  );
}
