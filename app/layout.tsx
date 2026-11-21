import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SI-ARSIP | Kementerian Haji dan Umrah Kantor Wilayah Papua',
  description: 'Sistem Informasi Arsip dan Persuratan Digital - Kementerian Haji dan Umrah Kantor Wilayah Provinsi Papua',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased text-slate-800 bg-slate-50 selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
