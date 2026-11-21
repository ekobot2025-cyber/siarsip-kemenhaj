'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Mail,
  Building2,
  Calendar,
  Shield,
  FileCheck,
  Edit3
} from 'lucide-react';
import { Unit } from '@/lib/types';

interface NewIncomingLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  letterToEdit?: any;
}

export function NewIncomingLetterModal({
  isOpen,
  onClose,
  onSuccess,
  letterToEdit,
}: NewIncomingLetterModalProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [letterNumber, setLetterNumber] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().slice(0, 10));
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [senderInstitution, setSenderInstitution] = useState('');
  const [subject, setSubject] = useState('');
  const [letterNature, setLetterNature] = useState('Biasa');
  const [targetUnitId, setTargetUnitId] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/units')
      .then((res) => res.json())
      .then((d) => {
        if (d.data) {
          setUnits(d.data.filter((u: Unit) => u.is_active === 1));
          if (!letterToEdit && d.data.length > 0) {
            setTargetUnitId(d.data[0].id.toString());
          }
        }
      });
  }, []);

  useEffect(() => {
    if (letterToEdit) {
      setLetterNumber(letterToEdit.letter_number || '');
      setLetterDate(letterToEdit.letter_date || new Date().toISOString().slice(0, 10));
      setReceivedDate(letterToEdit.received_date || new Date().toISOString().slice(0, 10));
      setSenderInstitution(letterToEdit.sender_institution || '');
      setSubject(letterToEdit.subject || '');
      setLetterNature(letterToEdit.letter_nature || 'Biasa');
      setTargetUnitId(letterToEdit.target_unit_id?.toString() || '');
      setSummary(letterToEdit.summary || '');
      setNotes(letterToEdit.notes || '');
      setFile(null);
    } else {
      setLetterNumber('');
      setLetterDate(new Date().toISOString().slice(0, 10));
      setReceivedDate(new Date().toISOString().slice(0, 10));
      setSenderInstitution('');
      setSubject('');
      setLetterNature('Biasa');
      setSummary('');
      setNotes('');
      setFile(null);
      if (units.length > 0) setTargetUnitId(units[0].id.toString());
    }
  }, [letterToEdit, isOpen]);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const isEditing = !!letterToEdit;
  const displayAgendaNumber = isEditing ? letterToEdit.agenda_number : `SM/${currentYear}/##### (Dihasilkan Otomatis)`;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!letterNumber.trim() || !senderInstitution.trim() || !subject.trim() || !targetUnitId) {
      setError('Mohon lengkapi semua field input manual yang bertanda bintang (*)');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('letter_number', letterNumber.trim());
      formData.append('letter_date', letterDate);
      formData.append('received_date', receivedDate);
      formData.append('sender_institution', senderInstitution.trim());
      formData.append('subject', subject.trim());
      formData.append('letter_nature', letterNature);
      formData.append('target_unit_id', targetUnitId);
      formData.append('summary', summary.trim());
      formData.append('notes', notes.trim());

      if (file) {
        formData.append('file', file);
      }

      const endpoint = isEditing ? `/api/letters/incoming/${letterToEdit.id}` : '/api/letters/incoming';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan data surat masuk');
        setLoading(false);
        return;
      }

      setSuccess(
        isEditing
          ? `Perubahan data surat masuk ${letterToEdit.agenda_number} berhasil disimpan!`
          : `Surat masuk berhasil diregistrasi dengan No. Agenda: ${data.agenda_number}`
      );
      setLoading(false);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1100);
    } catch {
      setError('Terjadi kendala saat menghubungi server');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            {isEditing ? (
              <Edit3 className="w-5 h-5 text-amber-400" />
            ) : (
              <Mail className="w-5 h-5 text-blue-400" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                {isEditing ? `Ubah Data Surat Masuk: ${letterToEdit.agenda_number}` : 'Input & Registrasi Surat Masuk Baru'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Pencatatan manual metadata surat masuk dinas & integrasi digitalisasi scan berkas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 text-xs">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Agenda Number Banner */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Nomor Agenda Sistem (Standar Tata Persuratan Kanwil Papua)
              </span>
              <span className="text-sm font-black font-mono text-blue-950">
                {displayAgendaNumber}
              </span>
            </div>
            <span className="text-[11px] bg-blue-200/70 text-blue-900 font-bold px-2.5 py-1 rounded">
              Format: SM/{currentYear}/XXXXX
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input Manual: Nomor Surat Asli, Tanggal Surat, Tanggal Diterima */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  1. Nomor Surat Asli *
                </label>
                <input
                  type="text"
                  required
                  value={letterNumber}
                  onChange={(e) => setLetterNumber(e.target.value)}
                  placeholder="Contoh: B-1088/DJ.I/HM.01/03/2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Ketik nomor yang tertera di surat</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  2. Tanggal Surat *
                </label>
                <input
                  type="date"
                  required
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Tanggal terbit di surat</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  3. Tanggal Diterima Kanwil *
                </label>
                <input
                  type="date"
                  required
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Tanggal berkas fisik tiba</span>
              </div>
            </div>

            {/* Input Manual: Asal Surat / Instansi Pengirim & Quick Presets */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                4. Asal Surat / Instansi Pengirim *
              </label>
              <input
                type="text"
                required
                value={senderInstitution}
                onChange={(e) => setSenderInstitution(e.target.value)}
                placeholder="Ketik manual nama instansi pengirim, misal: Sekretariat Daerah Provinsi Papua"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-medium">Klik pilihan cepat atau ketik manual:</span>
                {[
                  'Pemerintah Provinsi Papua',
                  'Sekretariat Jenderal Kementerian Haji dan Umrah RI',
                  'Ditjen Penyelenggaraan Haji dan Umrah',
                  'Inspektorat Jenderal Kementerian Haji dan Umrah RI',
                  'KPPN Jayapura',
                  'BKN Regional IX Jayapura'
                ].map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => setSenderInstitution(inst)}
                    className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 px-2.5 py-0.5 rounded-full border border-slate-200 transition"
                  >
                    + {inst}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Manual: Perihal Surat */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                5. Perihal Surat *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Undangan Rapat Koordinasi Penyelenggaraan Pelayanan Haji dan Umrah 2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>

            {/* Input Manual: Sifat Surat & Tujuan Disposisi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  6. Sifat Surat *
                </label>
                <select
                  value={letterNature}
                  onChange={(e) => setLetterNature(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition font-medium"
                >
                  <option value="Biasa">Biasa (Standar Rutin / Informasi)</option>
                  <option value="Penting">Penting (Memerlukan Tindak Lanjut Unit)</option>
                  <option value="Segera">Segera (Memerlukan Penanganan Cepat)</option>
                  <option value="Rahasia">Rahasia (Dokumen Tertutup / Pimpinan)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  7. Tujuan Disposisi (Unit Kerja) *
                </label>
                <select
                  value={targetUnitId}
                  onChange={(e) => setTargetUnitId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition font-medium"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.code}] {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Manual: Ringkasan & Petunjuk Disposisi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  8. Ringkasan / Isi Pokok Surat (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ketik ringkasan poin inti dari surat masuk untuk mempermudah pimpinan membaca cepat..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  9. Catatan / Petunjuk Awal (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan dari staf persuratan atau arahan awal sebelum disposisi kakanwil..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Upload File Scan PDF Surat Masuk (Opsional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">
                  10. Berkas Scan PDF Surat Masuk
                </label>
                <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Opsional (Dapat diunggah sekarang atau disusulkan nanti)
                </span>
              </div>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`p-5 border-2 border-dashed rounded-xl text-center transition ${
                  dragActive
                    ? 'border-blue-600 bg-blue-50/60'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
                }`}
              >
                {file ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-300 max-w-md mx-auto shadow-2xs">
                    <div className="flex items-center space-x-3 truncate">
                      <FileText className="w-7 h-7 text-emerald-600 shrink-0" />
                      <div className="text-left truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {(file.size / 1024).toFixed(1)} KB &bull; Berkas Scan Siap Diunggah
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-7 h-7 text-blue-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Tarik & lepaskan file PDF hasil scan surat ke sini, atau{' '}
                      <label className="text-blue-700 font-bold hover:underline cursor-pointer">
                        Pilih Berkas PDF
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files && setFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isEditing && letterToEdit?.file_name
                        ? `File saat ini: ${letterToEdit.file_name} (Unggah baru jika ingin mengganti berkas)`
                        : 'Jika belum discan, surat tetap dapat diregistrasi dan discan nanti.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Menyimpan ke Buku Agenda...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>{isEditing ? 'SIMPAN PERUBAHAN DATA' : 'SIMPAN & REGISTRASI NOMOR AGENDA'}</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
