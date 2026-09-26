import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, User, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();

  const [nama, setNama] = useState('');
  const [kodeLogin, setKodeLogin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !kodeLogin.trim()) return;

    setError('');
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
      setError(res.error || 'Login gagal. Periksa kembali nama dan kode login Anda.');
    }
  };

  const fillPreset = (nameVal: string, codeVal: string) => {
    setNama(nameVal);
    setKodeLogin(codeVal);
    setError('');
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

        {/* Login Card */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-2xl space-y-5">
          
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Masuk Aplikasi</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan nama terdaftar dan kode login dari pengurus pesantren
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nama Pengguna</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ustadz Ahmad Fauzi"
                required
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kode Login</span>
              </label>
              <input
                type="password"
                value={kodeLogin}
                onChange={(e) => setKodeLogin(e.target.value)}
                placeholder="Masukkan kode unik login"
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

          {/* Quick Preset Buttons for Easy Demo / Testing */}
          <div className="pt-3 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Pilih Akun Demo Cepat (1-Klik):</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillPreset('Admin Maisya', 'ADMIN2026')}
                className="p-2 text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
              >
                <div className="font-bold text-[11px] text-amber-400">Super Admin</div>
                <div className="text-[10px] text-slate-400 truncate">Admin Maisya</div>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('Ustadz Ahmad Fauzi', 'ISB2026')}
                className="p-2 text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
              >
                <div className="font-bold text-[11px] text-emerald-400">Musyrif / Asatidzah</div>
                <div className="text-[10px] text-slate-400 truncate">Ust. Ahmad Fauzi</div>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('Staff TU Maisya', 'TU2026')}
                className="p-2 text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
              >
                <div className="font-bold text-[11px] text-blue-400">Staff TU & Sarpras</div>
                <div className="text-[10px] text-slate-400 truncate">Staff TU Maisya</div>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('Zaid bin Tsabit', 'SANTRI2026')}
                className="p-2 text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
              >
                <div className="font-bold text-[11px] text-slate-300">Peserta / Santri</div>
                <div className="text-[10px] text-slate-400 truncate">Zaid bin Tsabit</div>
              </button>
            </div>
          </div>
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
