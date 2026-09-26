import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GasClient } from '../api/gasClient';
import { 
  Shield, 
  KeyRound, 
  User, 
  ArrowRight, 
  UserPlus, 
  CheckCircle2, 
  BookOpen, 
  Phone, 
  Info, 
  Lock,
  Eye,
  EyeOff,
  Search,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginView: React.FC = () => {
  const { login, register, isLoading } = useAuth();

  // Tab mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [nama, setNama] = useState('');
  const [kodeLogin, setKodeLogin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rememberPassword, setRememberPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status check state
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);
  const [checkQuery, setCheckQuery] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Register form state
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regKode, setRegKode] = useState('');
  const [regRole, setRegRole] = useState('ROLE_PESERTA');
  const [regNoWa, setRegNoWa] = useState('');
  const [regKeterangan, setRegKeterangan] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Muat akun tersimpan (Fitur Ingat Password)
  useEffect(() => {
    const isRemembered = localStorage.getItem('maisya_remember_pass') !== 'false';
    setRememberPassword(isRemembered);

    const savedUser = localStorage.getItem('maisya_saved_user');
    const savedPass = localStorage.getItem('maisya_saved_pass');

    if (savedUser) {
      setNama(savedUser);
    } else {
      // Saran default untuk kemudahan testing admin
      setNama('iftahadmin');
    }

    if (isRemembered && savedPass) {
      setKodeLogin(savedPass);
    } else if (isRemembered && !savedPass && (!savedUser || savedUser === 'iftahadmin')) {
      setKodeLogin('iftah010387');
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !kodeLogin.trim()) return;

    setLoginError('');
    const res = await login(nama.trim(), kodeLogin.trim());
    if (res.success) {
      // Simpan atau hapus kredensial sesuai pilihan "Ingat Password Saya"
      if (rememberPassword) {
        localStorage.setItem('maisya_remember_pass', 'true');
        localStorage.setItem('maisya_saved_user', nama.trim());
        localStorage.setItem('maisya_saved_pass', kodeLogin.trim());
      } else {
        localStorage.setItem('maisya_remember_pass', 'false');
        localStorage.removeItem('maisya_saved_user');
        localStorage.removeItem('maisya_saved_pass');
      }

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

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkQuery.trim()) return;

    setIsChecking(true);
    setCheckResult(null);

    try {
      const res = await GasClient.checkUserStatus(checkQuery.trim());
      setCheckResult(res);
    } catch (err: any) {
      setCheckResult({ success: false, error: 'Gagal mengecek status pendaftaran akun.' });
    } finally {
      setIsChecking(false);
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Password / Kode Login</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-emerald-400 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Sembunyikan' : 'Lihat'}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={kodeLogin}
                    onChange={(e) => setKodeLogin(e.target.value)}
                    placeholder="Masukkan password Anda"
                    required
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500 font-mono"
                  />
                </div>

                {/* Fitur Ingat Password Saya & Isi Cepat Akun Admin */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      id="remember_password_checkbox"
                      checked={rememberPassword}
                      onChange={(e) => setRememberPassword(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 border-slate-700 bg-slate-900 cursor-pointer"
                    />
                    <span className="font-medium text-slate-200">Ingat password saya</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setNama('iftahadmin');
                      setKodeLogin('iftah010387');
                      setRememberPassword(true);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-mono font-semibold self-start sm:self-auto cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Isi Akun Admin</span>
                  </button>
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
                    className="text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Daftar di sini
                  </button>
                </p>
              </div>

              {/* Fitur Cek Status Pendaftaran */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckStatusOpen(!isCheckStatusOpen);
                    setCheckResult(null);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isCheckStatusOpen ? 'Tutup Pengecekan Status' : 'Cek Status Pendaftaran Akun Anda'}</span>
                </button>

                {isCheckStatusOpen && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3 animate-in fade-in duration-200">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Masukkan <strong>Username</strong> atau <strong>Nama Lengkap</strong> yang Anda daftarkan untuk melihat status verifikasi Admin:
                    </p>

                    <form onSubmit={handleCheckStatus} className="flex gap-2">
                      <input
                        type="text"
                        value={checkQuery}
                        onChange={(e) => setCheckQuery(e.target.value)}
                        placeholder="Contoh: zaid_santri atau nama Anda"
                        required
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={isChecking || !checkQuery.trim()}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Search className="w-3 h-3" />
                        <span>{isChecking ? '...' : 'Cek'}</span>
                      </button>
                    </form>

                    {checkResult && (
                      <div className="pt-1">
                        {checkResult.success && checkResult.user ? (
                          <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            checkResult.user.approval_status === 'approved'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : checkResult.user.approval_status === 'rejected'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span>{checkResult.user.nama} (@{checkResult.user.username})</span>
                              {checkResult.user.approval_status === 'approved' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                                  ✅ Disetujui (Aktif)
                                </span>
                              ) : checkResult.user.approval_status === 'rejected' ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
                                  ❌ Ditolak
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] animate-pulse">
                                  ⏳ Menunggu Izin Admin
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {checkResult.user.approval_status === 'approved'
                                ? 'Selamat! Akun Anda telah disetujui oleh Admin (iftahadmin). Anda sekarang sudah dapat login.'
                                : checkResult.user.approval_status === 'rejected'
                                ? 'Pendaftaran akun Anda ditolak oleh admin. Silakan hubungi pengurus pesantren.'
                                : 'Pendaftaran Anda telah tersimpan di database dan sedang menunggu persetujuan (approval) dari Admin (iftahadmin).'}
                            </p>

                            {checkResult.user.approval_status === 'approved' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setNama(checkResult.user.username);
                                  setIsCheckStatusOpen(false);
                                }}
                                className="text-[11px] text-emerald-400 font-bold hover:underline block mt-1 cursor-pointer"
                              >
                                Masukkan username ini ke form login ➔
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                            {checkResult.error || 'Pengguna belum terdaftar.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
