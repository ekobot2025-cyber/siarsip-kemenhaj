'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { User } from '@/lib/types';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          setLoading(false);
        } else {
          window.location.href = '/login';
        }
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  // Generate breadcrumb items
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0 || segments[0] === 'dashboard') {
      return [{ label: 'Dashboard', path: '/dashboard' }];
    }

    const crumbs = [{ label: 'Dashboard', path: '/dashboard' }];
    let currentPath = '';

    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      let label = seg;

      if (seg === 'archives') label = 'E-Arsip';
      else if (seg === 'new') label = 'Tambah Arsip';
      else if (seg === 'unit') label = 'Unit Kerja';
      else if (seg === 'master') label = 'Master Data';
      else if (seg === 'users') label = 'Manajemen Pengguna';
      else if (seg === 'categories') label = 'Kategori Arsip';
      else if (seg === 'units') label = 'Unit Kerja';
      else if (seg === 'audit-logs') label = 'Audit Trail';
      else if (seg === 'pimpinan') label = 'Dashboard Pimpinan';
      else if (seg === 'persuratan') label = 'Persuratan Digital';
      else if (seg === 'masuk') label = 'Surat Masuk';
      else if (seg === 'keluar') label = 'Surat Keluar';
      else if (seg === 'agenda') label = 'Buku Agenda';
      else if (seg === 'reports') label = 'Laporan';
      else if (!isNaN(Number(seg))) label = `Detail #${seg}`;

      crumbs.push({ label, path: currentPath });
    });

    return crumbs;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#1A1410] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 border border-[#c9a961]/40 flex items-center justify-center shadow-xl animate-pulse">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/branding/logo-kemenhaj.png"
            alt="SI-ARSIP Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-center">
          <p className="text-white font-bold tracking-wide text-sm">
            SI-ARSIP <span className="text-[#c9a961]">KEMENHAJ</span> PAPUA
          </p>
          <p className="text-[#FAF9F5]/70 text-xs mt-1">Memuat data dan sesi terotentikasi...</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen flex bg-[#FAF9F5] text-[#1A1410]">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#1A1410]/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <Sidebar
        user={user}
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          onToggleSidebar={() => {}}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-[#e8dfc8] px-4 md:px-6 py-2.5 flex items-center space-x-2 text-xs text-[#786c5e]">
          <Link href="/dashboard" className="hover:text-[#8a6d2b] flex items-center">
            <Home className="w-3.5 h-3.5 mr-1 text-[#8a6d2b]" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
          {breadcrumbs.slice(1).map((crumb, idx) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              <Link
                href={crumb.path}
                className={`truncate ${
                  idx === breadcrumbs.length - 2
                    ? 'font-bold text-[#8a6d2b]'
                    : 'hover:text-[#8a6d2b]'
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* Page Children */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#e8dfc8] py-3.5 px-6 text-center text-xs text-[#786c5e]">
          <p>
            &copy; 2026 Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua &bull; Hak Cipta Dilindungi Undang-Undang.
          </p>
        </footer>
      </div>
    </div>
  );
}
