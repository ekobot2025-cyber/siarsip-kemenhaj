'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  PlusCircle,
  Menu,
  User as UserIcon,
  LogOut,
  Shield,
  FileText,
  ChevronDown,
  Building2,
  Check,
  ExternalLink,
  Mail
} from 'lucide-react';
import { User } from '@/lib/types';

interface HeaderProps {
  user: User | null;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export function Header({ user, onToggleSidebar, onOpenMobileMenu }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/archives?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const notifications: any[] = [];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white text-stone-800 border-b border-[#e8dfc8] shadow-2xs transition-all">
      {/* Left: Mobile hamburger & Institutional Branding */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-stone-600 rounded-lg hover:bg-[#fbf8ee] lg:hidden"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5 text-[#8a6d2b]" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center space-x-2">
            <span className="font-black text-sm tracking-tight text-[#1A1410]">
              SI-ARSIP <span className="text-[#b8941e]">PAPUA</span>
            </span>
            <span className="text-[10px] bg-[#fbf8ee] text-[#8a6d2b] font-bold px-2 py-0.5 rounded-full border border-[#e8dfc8]">
              Kemenhaj Official
            </span>
          </div>
          <p className="text-[11px] text-stone-500 truncate max-w-xs md:max-w-md">
            Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua
          </p>
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari arsip, nomor surat, agenda, atau instansi pengirim..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#FAF9F5] border border-[#e8dfc8] rounded-xl text-[#1A1410] placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#c9a961] focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-[#8a6d2b] absolute left-3 top-2 pointer-events-none" />
          {searchQuery && (
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-2.5 py-0.5 bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white text-[10px] font-bold rounded-lg transition"
            >
              Cari
            </button>
          )}
        </form>
      </div>

      {/* Right: Quick Action, Notifications, User Profile */}
      <div className="flex items-center space-x-2 md:space-x-3">
        
        {/* Quick Action Button */}
        <Link
          href="/persuratan/masuk"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:brightness-105 text-white text-xs font-bold rounded-xl shadow-xs shadow-[#c9a961]/30 transition-all cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 mr-0.5" />
          <span>Surat Masuk</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-stone-600 hover:text-[#1A1410] hover:bg-[#fbf8ee] rounded-xl relative transition-colors cursor-pointer border border-transparent hover:border-[#e8dfc8]"
            title="Pemberitahuan"
          >
            <Bell className="w-4 h-4 text-stone-600" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#b8941e] rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#e8dfc8] py-2 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#e8dfc8]">
                <span className="font-bold text-xs text-[#1A1410]">Notifikasi Persuratan &amp; Arsip</span>
                {notifications.length > 0 && (
                  <span className="text-[10px] bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] px-2 py-0.5 rounded-full font-bold">
                    {notifications.length} Baru
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#FAF9F5]">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400">
                    Belum ada notifikasi baru
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setShowNotifications(false)}
                      className={`block px-4 py-3 hover:bg-[#fbf8ee] transition-colors ${
                        n.unread ? 'bg-[#fbf8ee]/60' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {n.unread && <span className="w-2 h-2 rounded-full bg-[#b8941e] mt-1.5 shrink-0"></span>}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#1A1410]">{n.title}</p>
                          <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">{n.desc}</p>
                          <span className="text-[10px] text-[#8a6d2b] mt-1 block font-medium">{n.time}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="px-4 py-2 text-center border-t border-[#e8dfc8]">
                <Link
                  href="/audit-logs"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-[#8a6d2b] hover:text-[#1A1410]"
                >
                  Lihat Riwayat Audit Trail Lengkap &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#e8dfc8] bg-white hover:bg-[#fbf8ee] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#fbf8ee] border border-[#e8dfc8] flex items-center justify-center text-[#8a6d2b] font-black text-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-[#1A1410] leading-none truncate max-w-[120px]">
                {user?.full_name || 'Pengguna'}
              </p>
              <p className="text-[10px] text-[#8a6d2b] font-medium leading-tight mt-0.5">
                {user?.role_name || 'Petugas'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e8dfc8] py-2 z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-[#e8dfc8] bg-[#fbf8ee]/50">
                <p className="text-xs font-bold text-[#1A1410]">{user?.full_name}</p>
                <p className="text-[11px] text-stone-500 font-mono mt-0.5 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold bg-[#fbf8ee] text-[#8a6d2b] px-2 py-0.5 rounded border border-[#e8dfc8]">
                    {user?.role_name}
                  </span>
                  {user?.unit_code && (
                    <span className="text-[10px] font-bold bg-white text-stone-700 px-2 py-0.5 rounded border border-[#e8dfc8]">
                      Unit: {user.unit_code}
                    </span>
                  )}
                </div>
              </div>

              <div className="py-1 text-xs">
                <Link
                  href="/master/users"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center space-x-2.5 px-4 py-2 text-stone-700 hover:bg-[#fbf8ee] hover:text-[#1A1410] transition"
                >
                  <UserIcon className="w-4 h-4 text-[#8a6d2b]" />
                  <span>Profil &amp; Akun Saya</span>
                </Link>
                <Link
                  href="/audit-logs"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center space-x-2.5 px-4 py-2 text-stone-700 hover:bg-[#fbf8ee] hover:text-[#1A1410] transition"
                >
                  <Shield className="w-4 h-4 text-[#8a6d2b]" />
                  <span>Log Aktivitas Pribadi</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#e8dfc8]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Aplikasi (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
