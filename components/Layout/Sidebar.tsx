'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Archive,
  FolderOpen,
  Mail,
  MailQuestion,
  Send,
  BookOpen,
  Star,
  Clock,
  BarChart3,
  Database,
  Building2,
  Tag,
  Users,
  ShieldCheck,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Globe,
  ArrowUpRight,
  FileCheck
} from 'lucide-react';
import { User, Unit } from '@/lib/types';

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ user, isOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [units, setUnits] = useState<Unit[]>([]);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    earsip: true,
    persuratan: true,
    dokumensaya: false,
    master: false,
    pengguna: false,
  });

  // Fetch dynamic units from DB
  useEffect(() => {
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setUnits(data.data.filter((u: Unit) => u.is_active === 1));
        }
      })
      .catch((err) => console.error('Failed to load units for sidebar:', err));
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true;
    return pathname.startsWith(path);
  };

  const isSuperAdmin = user?.role_code === 'SUPER_ADMIN';
  const isAdminArsip = user?.role_code === 'ADMIN_ARSIP';
  const isPimpinan = user?.role_code === 'PIMPINAN';

  return (
    <aside
      className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white text-stone-800 flex flex-col transition-all duration-300 ease-in-out border-r border-[#e8dfc8] ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 bg-white border-b border-[#e8dfc8]">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-[#e8dfc8] shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/branding/logo-kemenhaj.png"
              alt="Logo SI-ARSIP Kemenhaj"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base tracking-tight text-[#1A1410]">
                SI-ARSIP <span className="text-[#b8941e]">PAPUA</span>
              </span>
              <span className="text-[9px] bg-[#fbf8ee] text-[#8a6d2b] font-bold px-1.5 py-0.5 rounded border border-[#e8dfc8]">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-medium truncate max-w-[150px]">
              Kementerian Haji &amp; Umrah
            </p>
          </div>
        </Link>
      </div>

      {/* Scope / User Role Info Card */}
      <div className="p-3 mx-3 my-2.5 rounded-xl bg-[#fbf8ee] border border-[#e8dfc8] text-xs">
        <span className="text-[10px] uppercase font-bold text-[#8a6d2b] block mb-0.5">
          Otorisasi & Lingkup Akses
        </span>
        <div className="font-bold text-[#1A1410] truncate">
          {user?.full_name || 'Administrator'}
        </div>
        <div className="text-[11px] text-stone-500 mt-0.5 flex items-center justify-between">
          <span>{user?.role_name || 'Super Admin'}</span>
          {user?.unit_code && (
            <span className="font-bold text-[#8a6d2b] font-mono bg-white px-1.5 py-0.2 rounded border border-[#e8dfc8]">
              {user.unit_code}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 text-xs font-medium">
        
        {/* DASHBOARD */}
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
            isActive('/dashboard')
              ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-bold shadow-xs shadow-[#c9a961]/25'
              : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${isActive('/dashboard') ? 'text-white' : 'text-[#8a6d2b]'}`} />
          <span>Dashboard Utama</span>
        </Link>

        {/* PIMPINAN DASHBOARD IF APPLICABLE */}
        {(isPimpinan || isSuperAdmin) && (
          <Link
            href="/pimpinan"
            onClick={onCloseMobile}
            className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all ${
              pathname === '/pimpinan'
                ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-bold shadow-xs shadow-[#c9a961]/25'
                : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${pathname === '/pimpinan' ? 'text-white' : 'text-[#8a6d2b]'}`} />
            <span>Dashboard Pimpinan</span>
          </Link>
        )}

        {/* PERSURATAN (ACCORDION) */}
        <div>
          <button
            onClick={() => toggleSection('persuratan')}
            className="w-full flex items-center justify-between px-3 py-2 text-[#8a6d2b] hover:bg-[#fbf8ee] rounded-xl transition-colors text-[10px] font-bold uppercase tracking-wider mt-2"
          >
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-[#b8941e]" />
              <span>Persuratan Digital</span>
            </div>
            {openSections.persuratan ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {openSections.persuratan && (
            <div className="pl-3 mt-1 space-y-0.5 border-l border-[#e8dfc8] ml-4">
              <Link
                href="/persuratan/masuk"
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/persuratan/masuk'
                    ? 'bg-[#fbf8ee] text-[#8a6d2b] font-bold border-l-2 border-[#b8941e]'
                    : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MailQuestion className="w-3.5 h-3.5 text-[#b8941e]" />
                  <span>Surat Masuk</span>
                </div>
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                  Scan & Agenda
                </span>
              </Link>
              <Link
                href="/persuratan/keluar"
                onClick={onCloseMobile}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/persuratan/keluar'
                    ? 'bg-[#fbf8ee] text-[#8a6d2b] font-bold border-l-2 border-[#b8941e]'
                    : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-stone-400" />
                <span>Surat Keluar</span>
              </Link>
              <Link
                href="/persuratan/agenda"
                onClick={onCloseMobile}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/persuratan/agenda'
                    ? 'bg-[#fbf8ee] text-[#8a6d2b] font-bold border-l-2 border-[#b8941e]'
                    : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                <span>Buku Agenda Digital</span>
              </Link>
            </div>
          )}
        </div>

        {/* E-ARSIP (ACCORDION) */}
        <div>
          <button
            onClick={() => toggleSection('earsip')}
            className="w-full flex items-center justify-between px-3 py-2 text-[#8a6d2b] hover:bg-[#fbf8ee] rounded-xl transition-colors text-[10px] font-bold uppercase tracking-wider mt-2"
          >
            <div className="flex items-center space-x-2">
              <Archive className="w-3.5 h-3.5 text-[#b8941e]" />
              <span>E-Arsip Dokumen</span>
            </div>
            {openSections.earsip ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {openSections.earsip && (
            <div className="pl-3 mt-1 space-y-0.5 border-l border-[#e8dfc8] ml-4">
              <Link
                href="/archives"
                onClick={onCloseMobile}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/archives'
                    ? 'bg-[#fbf8ee] text-[#8a6d2b] font-bold border-l-2 border-[#b8941e]'
                    : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-stone-400" />
                <span>Semua Arsip</span>
              </Link>

              {/* Dynamic Unit Submenu from DB */}
              {units.map((unit) => {
                const unitPath = `/archives/unit/${unit.code.toLowerCase()}`;
                const isSelected = pathname === unitPath;
                return (
                  <Link
                    key={unit.id}
                    href={unitPath}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-[#fbf8ee] text-[#8a6d2b] font-bold border-l-2 border-[#b8941e]'
                        : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
                    }`}
                  >
                    <span className="truncate" title={unit.name}>
                      {unit.name.replace('Bagian ', '').replace('Bidang ', '')}
                    </span>
                    {unit.archive_count !== undefined && unit.archive_count > 0 && (
                      <span className="text-[10px] bg-white border border-[#e8dfc8] text-[#8a6d2b] font-bold px-1.5 py-0.2 rounded-full">
                        {unit.archive_count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* LAPORAN & STATISTIK */}
        <Link
          href="/reports"
          onClick={onCloseMobile}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all ${
            pathname === '/reports'
              ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-bold shadow-xs shadow-[#c9a961]/25'
              : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${pathname === '/reports' ? 'text-white' : 'text-stone-400'}`} />
          <span>Laporan &amp; Statistik</span>
        </Link>

        {/* MASTER DATA (ADMIN ONLY) */}
        {(isSuperAdmin || isAdminArsip) && (
          <div>
            <button
              onClick={() => toggleSection('master')}
              className="w-full flex items-center justify-between px-3 py-2 text-[#8a6d2b] hover:bg-[#fbf8ee] rounded-xl transition-colors text-[10px] font-bold uppercase tracking-wider mt-3"
            >
              <div className="flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-[#b8941e]" />
                <span>Master Data</span>
              </div>
              {openSections.master ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            {openSections.master && (
              <div className="pl-3 mt-1 space-y-0.5 border-l border-[#e8dfc8] ml-4">
                <Link
                  href="/master/units"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === '/master/units'
                      ? 'bg-[#fbf8ee] text-[#8a6d2b] font-bold border-l-2 border-[#b8941e]'
                      : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>Unit Kerja (5 Bidang)</span>
                </Link>
                <Link
                  href="/master/categories"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === '/master/categories'
                      ? 'bg-[#fbf8ee] text-[#8a6d2b] font-bold border-l-2 border-[#b8941e]'
                      : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kategori Dinamis</span>
                </Link>
                <Link
                  href="/master/users"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === '/master/users'
                      ? 'bg-[#fbf8ee] text-[#8a6d2b] font-bold border-l-2 border-[#b8941e]'
                      : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>Manajemen Pengguna</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS */}
        <Link
          href="/audit-logs"
          onClick={onCloseMobile}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all ${
            pathname === '/audit-logs'
              ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-bold shadow-xs shadow-[#c9a961]/25'
              : 'text-stone-600 hover:bg-[#fbf8ee] hover:text-[#1A1410]'
          }`}
        >
          <History className={`w-4 h-4 ${pathname === '/audit-logs' ? 'text-white' : 'text-stone-400'}`} />
          <span>Audit Trail &amp; Log</span>
        </Link>

      </div>

      {/* Official External Portals */}
      <div className="px-3 py-2 border-t border-[#e8dfc8] space-y-1">
        <a
          href="https://haji.go.id"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#8a6d2b] hover:text-[#1A1410] hover:bg-[#fbf8ee] transition-colors"
        >
          <span className="flex items-center gap-2 truncate">
            <Globe className="w-3.5 h-3.5 text-[#b8941e] shrink-0" />
            <span>Kemenhaj (haji.go.id)</span>
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#b8941e] shrink-0" />
        </a>
      </div>

      {/* Footer Branding Notice */}
      <div className="p-3 border-t border-[#e8dfc8] text-[10px] text-stone-400 text-center font-mono">
        SI-ARSIP KEMENHAJ PAPUA &bull; 2026
      </div>
    </aside>
  );
}
