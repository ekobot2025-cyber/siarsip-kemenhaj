'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal. Periksa username dan password Anda.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Terjadi kendala jaringan saat menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF9F5] text-[#1A1410]">
      
      {/* Sisi Kiri: Visual Identity Kemenhaj / haji.go.id Royal Gold & Obsidian */}
      <div className="lg:w-6/12 relative flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-b from-[#1A1410] via-[#2A2018] to-[#1A1410] text-white overflow-hidden border-b lg:border-b-0 lg:border-r border-[#c9a961]/20">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />

        {/* Ambient glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#c9a961]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#b8941e]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Identity */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#FAF9F5]/10 border border-[#c9a961]/40 text-[#c9a961] text-xs font-bold mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#c9a961] animate-pulse"></span>
            <span>PORTAL RESMI KEARSIPAN &amp; PERSURATAN ELEKTRONIK</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 border border-[#c9a961]/40 shadow-xl backdrop-blur-xs shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/branding/logo-kemenhaj.png"
                alt="Logo SI-ARSIP Kemenhaj"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                SI-ARSIP <span className="text-[#c9a961]">PAPUA</span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#c9a961] tracking-wide uppercase">
                Sistem Informasi Arsip &amp; Persuratan Digital
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <p className="font-bold text-white">Kementerian Haji dan Umrah</p>
            <p className="font-medium text-[#c9a961]">Kantor Wilayah Provinsi Papua</p>
          </div>
        </div>

        {/* Center Showcase Highlights */}
        <div className="relative z-10 my-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            Sentralisasi Berkas Kedinasan &amp; Buku Agenda Digital Terintegrasi
          </h2>
          <p className="text-xs text-[#FAF9F5]/75 leading-relaxed max-w-lg">
            Platform modern untuk tata kelola arsip digital dan persuratan dinas.
            Mendukung pencatatan agenda surat masuk/keluar, integrasi scan PDF, lembar disposisi kakanwil,
            serta penyimpanan berkas permanen aman dengan hak akses berjenjang.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/5 border border-[#c9a961]/25 backdrop-blur-xs">
              <span className="text-sm font-bold text-[#c9a961] block">5 Unit Kerja</span>
              <p className="text-[11px] text-[#FAF9F5]/70 mt-0.5">Keuangan, Kepegawaian, Umum &amp; Humas, Perencanaan, Haji</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-[#c9a961]/25 backdrop-blur-xs">
              <span className="text-sm font-bold text-[#c9a961] block">Agenda &amp; Disposisi</span>
              <p className="text-[11px] text-[#FAF9F5]/70 mt-0.5">Penomoran otomatis SM/2026/XXXXX &amp; Lembar Cetak Kakanwil</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Copyright */}
        <div className="relative z-10 pt-4 border-t border-[#c9a961]/20 text-xs text-[#FAF9F5]/70">
          <p>&copy; Copyright 2026 Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua</p>
        </div>

      </div>

      {/* Sisi Kanan: Form Login Elegan Kemenhaj */}
      <div className="lg:w-6/12 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#FAF9F5]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e8dfc8] p-8">
          
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#1A1410] tracking-tight">Masuk ke Sistem</h2>
            <p className="text-xs text-[#786c5e] mt-1">
              Gunakan akun resmi Kanwil untuk mengakses arsip dan persuratan dinas.
            </p>
          </div>

          {/* Feedback error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Username / NIP Pengguna
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: superadmin atau NIP"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FAF9F5] border border-[#e8dfc8] rounded-xl text-[#1A1410] focus:ring-2 focus:ring-[#c9a961] focus:bg-white transition"
                />
                <User className="w-4 h-4 text-[#8a6d2b] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">
                  Kata Sandi (Password)
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FAF9F5] border border-[#e8dfc8] rounded-xl text-[#1A1410] focus:ring-2 focus:ring-[#c9a961] focus:bg-white transition"
                />
                <Lock className="w-4 h-4 text-[#8a6d2b] absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600 text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#b8941e] focus:ring-[#c9a961]"
                />
                <span>Ingat sesi saya di perangkat ini</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:brightness-105 text-white font-bold rounded-xl shadow-md shadow-[#c9a961]/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer text-xs"
            >
              {loading ? (
                <span>Memvalidasi Akses...</span>
              ) : (
                <>
                  <span>MASUK KE SI-ARSIP PAPUA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Catatan Bantuan & Keamanan */}
          <div className="mt-8 pt-5 border-t border-[#e8dfc8] text-center">
            <p className="text-[11px] text-[#786c5e]">
              Aplikasi Kearsipan &amp; Persuratan Digital &bull; Kanwil Kemenhaj Papua
            </p>
            <p className="text-[10px] text-stone-400 mt-1">
              Hubungi Administrator jika Anda mengalami kendala akses atau lupa kata sandi.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
