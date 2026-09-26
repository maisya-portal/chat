import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, User, ArrowRight, UserPlus, CheckCircle2, BookOpen, Phone, Info, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginView: React.FC = () => {
  const { login, register, isLoading } = useAuth();

  // Tab mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [nama, setNama] = useState('');
  const [kodeLogin, setKodeLogin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regKode, setRegKode] = useState('');
  const [regRole, setRegRole] = useState('ROLE_PESERTA');
  const [regNoWa, setRegNoWa] = useState('');
  const [regKeterangan, setRegKeterangan] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !kodeLogin.trim()) return;

    setLoginError('');
    const res = await login(nama.trim(), kodeLogin.trim());
    if (res.success) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    } else {
      setLoginError(res.error || 'Login gagal. Periksa kembali username/nama dan password Anda.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama.trim() || !regUsername.trim() || !regKode.trim()) return;

    setRegError('');
    setRegSuccessMessage('');

    const res = await register({
      nama: regNama.trim(),
      username: regUsername.trim(),
      kodeLogin: regKode.trim(),
      roleId: regRole,
      noWa: regNoWa.trim(),
      keterangan: regKeterangan.trim()
    });

    if (res.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      setRegSuccessMessage(
        res.message || 'Pendaftaran berhasil dikirim! Silakan menunggu persetujuan (approval) dari Admin (iftahadmin).'
      );
      // Reset form
      setRegNama('');
      setRegUsername('');
      setRegKode('');
      setRegNoWa('');
      setRegKeterangan('');
    } else {
      setRegError(res.error || 'Pendaftaran gagal diajukan. Silakan periksa isian data Anda.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 bg-islamic-pattern relative overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-950/80 mb-2">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-2xl">
              M
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Maisya <span className="text-emerald-400">Chat Room</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Komunikasi & Halaqah Internal Pondok Pesantren Imam Syafi'i Brebes
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-2xl space-y-5">
          
          {/* Tabs Mode Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError('');
                setRegSuccessMessage('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError('');
                setRegSuccessMessage('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* ================= MODE LOGIN ================= */}
          {mode === 'login' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Masuk ke Akun Anda</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Masukkan username / nama dan password Anda
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-shake">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Username atau Nama</span>
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: iftahadmin atau nama Anda"
                    required
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Password / Kode Login</span>
                  </label>
                  <input
                    type="password"
                    value={kodeLogin}
                    onChange={(e) => setKodeLogin(e.target.value)}
                    placeholder="Masukkan password Anda"
                    required
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !nama.trim() || !kodeLogin.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Maisya Room'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  Belum memiliki akun terdaftar?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setLoginError('');
                    }}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Daftar di sini
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ================= MODE DAFTAR (REGISTER) ================= */}
          {mode === 'register' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Formulir Pendaftaran Pengguna</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Isi data lengkap Anda untuk diverifikasi oleh Admin
                </p>
              </div>

              {/* Notice Approval */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-amber-300">Persetujuan Diperlukan</p>
                  <p className="text-amber-200/90 text-[11px] mt-0.5">
                    Setelah mendaftar, akun Anda harus <strong>disetujui (diberi izin)</strong> oleh Admin (<span className="font-mono text-white">iftahadmin</span>) sebelum Anda dapat login ke ruang chat.
                  </p>
                </div>
              </div>

              {regSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pendaftaran Berhasil Diajukan!</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-200/90">
                    {regSuccessMessage}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Menuju Halaman Masuk
                    </button>
                  </div>
                </div>
              )}

              {regError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-shake">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Contoh: Muhammad Ihsan"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Username <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Contoh: ihsan26"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password / Kode Login <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={regKode}
                      onChange={(e) => setRegKode(e.target.value)}
                      placeholder="Buat password unik"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Peran / Status Pengguna
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ROLE_PESERTA">Peserta / Santri</option>
                      <option value="ROLE_MUSYRIF">Musyrif / Asatidzah</option>
                      <option value="ROLE_STAFF">Staff TU & Sarpras</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>No. WhatsApp (Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={regNoWa}
                      onChange={(e) => setRegNoWa(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Keterangan / Keperluan Pendaftaran
                  </label>
                  <input
                    type="text"
                    value={regKeterangan}
                    onChange={(e) => setRegKeterangan(e.target.value)}
                    placeholder="Contoh: Santri Asrama Abu Bakar, Guru Tahfizh, dll."
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !regNama.trim() || !regUsername.trim() || !regKode.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isLoading ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran ke Admin'}</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  Sudah memiliki akun aktif?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRegError('');
                    }}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Masuk ke Akun
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Single Source of Truth: Google Spreadsheet DB_MAISYA_CHAT</span>
        </p>
      </div>
    </div>
  );
};
