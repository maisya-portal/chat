import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useTheme, ThemeMode, WallpaperType } from '../../context/ThemeContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { 
  User, 
  Sun, 
  Moon, 
  Image as ImageIcon, 
  KeyRound, 
  Phone, 
  Check, 
  Upload, 
  Sparkles, 
  Palette,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/initials/svg?seed=Santri%20Maisya',
  'https://api.dicebear.com/7.x/initials/svg?seed=Ustadz%20Brebes',
  'https://api.dicebear.com/7.x/bottts/svg?seed=MaisyaBot'
];

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme, wallpaper, setWallpaper, customWallpaperUrl } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'wallpaper'>('profile');

  // Form Profile State
  const [nama, setNama] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [noWa, setNoWa] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Custom wallpaper state
  const [customUrlInput, setCustomUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setNama(user.nama || '');
      setFotoUrl(user.foto_url || '');
      setNoWa(user.no_wa || '');
      setKeterangan(user.keterangan || '');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback(null);
      setCustomUrlInput(customWallpaperUrl || '');
    }
  }, [user, isOpen, customWallpaperUrl]);

  // Handle upload foto lokal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran foto maksimal 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFotoUrl(event.target.result);
        setFeedback({ type: 'success', message: 'Foto berhasil dimuat dari perangkat. Klik "Simpan Perubahan" untuk menerapkan.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setFeedback({ type: 'error', message: 'Nama lengkap tidak boleh kosong' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Konfirmasi password baru tidak cocok' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const res = await updateProfile({
      nama: nama.trim(),
      fotoUrl: fotoUrl.trim(),
      noWa: noWa.trim(),
      keterangan: keterangan.trim(),
      kodeLogin: newPassword.trim() || undefined
    });

    setIsLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Profil berhasil diperbarui!' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFeedback({ type: 'error', message: res.error || 'Gagal memperbarui profil' });
    }
  };

  const handleSaveCustomWallpaper = () => {
    if (!customUrlInput.trim()) return;
    setWallpaper('custom', customUrlInput.trim());
    setFeedback({ type: 'success', message: 'Latar chat kustom berhasil diterapkan!' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan Profil & Personalisasi" maxWidth="lg">
      <div className="space-y-5">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-700/60 gap-1 pb-1">
          <button
            onClick={() => { setActiveTab('profile'); setFeedback(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Saya</span>
          </button>

          <button
            onClick={() => { setActiveTab('theme'); setFeedback(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>Tema (Gelap / Terang)</span>
          </button>

          <button
            onClick={() => { setActiveTab('wallpaper'); setFeedback(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'wallpaper'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Palette className="w-4 h-4 text-teal-400" />
            <span>Latar Chat</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ================= TAB 1: PROFIL PENGGUNA ================= */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            
            {/* Avatar Section & Live Preview */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <Avatar src={fotoUrl} name={nama || 'Pengguna'} size="xl" isOnline={true} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
                  title="Ganti Foto"
                >
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span>Ubah</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h4 className="text-sm font-bold text-white truncate">{nama || 'Nama Pengguna'}</h4>
                  <Badge roleId={user?.role_id} size="sm" />
                </div>
                <p className="text-xs text-slate-400 font-mono">@{user?.username} • ID: {user?.id_user}</p>
                <p className="text-[11px] text-emerald-400">
                  Foto profil dan nama ini akan tampil di ruang chat dan bilah anggota.
                </p>

                {/* Tombol Cepat Pilih Avatar */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">Pilih Avatar Instan:</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        alt="preset"
                        onClick={() => setFotoUrl(preset)}
                        className={`w-7 h-7 rounded-full object-cover cursor-pointer border-2 transition-all hover:scale-110 ${
                          fotoUrl === preset ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title="Gunakan avatar ini"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL Foto Profil Kustom (Opsional)
                </label>
                <input
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="https://contoh.com/foto.jpg"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nomor WhatsApp (Opsional)</span>
                </label>
                <input
                  type="tel"
                  value={noWa}
                  onChange={(e) => setNoWa(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Bio / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Santri Tahfidz / Musyrif Kamar 3"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Ganti Password Section */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ganti Password / Kode Login (Opsional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Lihat'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Biarkan kosong jika Anda tidak ingin mengubah password akun Anda saat ini.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 2: TEMA (GELAP & TERANG) ================= */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white">Pilih Tema Tampilan</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Sesuaikan kenyamanan mata Anda saat menggunakan Maisya Room. Pilihan tema otomatis tersimpan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card Mode Gelap */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/20'
                    : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 border border-slate-700">
                    <Moon className="w-5 h-5" />
                  </div>
                  {theme === 'dark' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                      Aktif
                    </span>
                  )}
                </div>

                <div>
                  <h5 className="text-sm font-bold text-white">Mode Gelap (Dark Mode)</h5>
                  <p className="text-xs text-slate-400 mt-1">
                    Nuansa malam hijau zamrud & hitam pekat yang elegan, nyaman untuk penggunaan malam hari.
                  </p>
                </div>

                {/* Mock Visual */}
                <div className="h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center px-3 gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div className="h-2 w-16 bg-slate-800 rounded"></div>
                  <div className="h-2 w-8 bg-emerald-900 rounded ml-auto"></div>
                </div>
              </div>

              {/* Card Mode Terang */}
              <div
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 ${
                  theme === 'light'
                    ? 'bg-slate-100 border-emerald-500 shadow-xl shadow-emerald-950/20 ring-2 ring-emerald-500/20 text-slate-900'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-500 text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/30">
                    <Sun className="w-5 h-5" />
                  </div>
                  {theme === 'light' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                      Aktif
                    </span>
                  )}
                </div>

                <div>
                  <h5 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Mode Terang (Light Mode)
                  </h5>
                  <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Tampilan bersih, cerah, dan kontras tinggi, ideal untuk digunakan di bawah cahaya terang atau siang hari.
                  </p>
                </div>

                {/* Mock Visual */}
                <div className="h-10 rounded-xl bg-white border border-slate-300 flex items-center px-3 gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                  <div className="h-2 w-16 bg-slate-200 rounded"></div>
                  <div className="h-2 w-8 bg-emerald-100 rounded ml-auto"></div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tema saat ini: <strong>{theme === 'dark' ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}</strong>. Klik kartu di atas untuk berganti secara instan.</span>
            </div>
          </div>
        )}

        {/* ================= TAB 3: LATAR CHAT (WALLPAPER) ================= */}
        {activeTab === 'wallpaper' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white">Ganti Latar Belakang Chat (Wallpaper)</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih pola latar belakang ruang percakapan yang Anda sukai, mirip seperti kustomisasi chat di WhatsApp.
              </p>
            </div>

            {/* Grid Wallpaper Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'islamic' as WallpaperType, name: 'Pola Geometris Islami', desc: 'Bintang & ornamen khas', class: 'wallpaper-islamic' },
                { id: 'emerald' as WallpaperType, name: 'Zamrud Bercahaya', desc: 'Gradien hijau mewah', class: 'wallpaper-emerald' },
                { id: 'night' as WallpaperType, name: 'Malam Berbintang', desc: 'Nuansa langit malam khusyuk', class: 'wallpaper-night' },
                { id: 'doodle' as WallpaperType, name: 'Doodle WhatsApp', desc: 'Ikon pesan halus', class: 'wallpaper-doodle' },
                { id: 'minimal' as WallpaperType, name: 'Minimalis Polos', desc: 'Warna solid bersih', class: 'wallpaper-minimal' },
              ].map((wp) => {
                const isSelected = wallpaper === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-2.5 ${
                      isSelected
                        ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-800/80 shadow-lg'
                        : 'border-slate-700/60 bg-slate-800/30 hover:border-slate-500'
                    }`}
                  >
                    {/* Wallpaper Preview Area */}
                    <div className={`h-20 rounded-xl border border-slate-700/50 flex flex-col justify-center px-2 py-1.5 gap-1.5 relative overflow-hidden ${wp.class}`}>
                      {/* Mini Mock Chat Bubbles */}
                      <div className="self-start max-w-[80%] bg-slate-800/90 text-[9px] px-2 py-1 rounded-lg border border-slate-700 text-slate-200">
                        Assalamu'alaikum
                      </div>
                      <div className="self-end max-w-[80%] bg-emerald-600 text-[9px] px-2 py-1 rounded-lg text-white font-medium">
                        Wa'alaikumsalam
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                          ✓
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-white truncate">{wp.name}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{wp.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom URL Wallpaper */}
            <div className="p-3.5 rounded-2xl bg-slate-800/30 border border-slate-700/60 space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>Atau Gunakan Gambar Wallpaper Kustom (URL)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-...?w=800"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomWallpaper}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
