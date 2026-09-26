import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallButton: React.FC<{ variant?: 'banner' | 'button' | 'sidebar' }> = ({
  variant = 'button'
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Cek apakah sudah berjalan sebagai PWA standalone
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Cek apakah perangkat iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // Tangkap event instalasi PWA
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Jika sudah terpasang atau sedang berjalan dalam mode standalone, sembunyikan atau tampilkan status terpasang
  if (isStandalone || isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback petunjuk jika browser belum memicu event prompt
      alert(
        'Untuk menginstal Maisya Room di perangkat Anda:\n\n' +
        '1. Di Chrome/Edge: Klik ikon instal (komputer dengan panah bawah) di bilah alamat browser.\n' +
        '2. Di ponsel Android: Buka menu titik tiga (⋮) lalu pilih "Tambahkan ke Layar Utama" / "Instal Aplikasi".'
      );
    }
  };

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 hover:from-emerald-900/90 hover:to-teal-900/90 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-all shadow-md group cursor-pointer"
          title="Instal aplikasi Maisya Room ke layar utama perangkat"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src="./icons/icon-192.png"
                alt="Maisya Room"
                className="w-6 h-6 rounded-lg object-cover shadow-sm ring-1 ring-emerald-400/60 group-hover:scale-110 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-none text-emerald-200 group-hover:text-white">Instal Aplikasi</p>
              <p className="text-[10px] text-emerald-400/80 font-normal">Akses Cepat PWA</p>
            </div>
          </div>
          <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
            <Download className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Modal Petunjuk iOS Safari */}
        {showIosGuide && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Instal di iPhone / iPad</h4>
                </div>
                <button
                  onClick={() => setShowIosGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p>Ikuti 2 langkah mudah berikut di browser Safari:</p>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                    <span>Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari (ikon kotak dengan panah ke atas).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                    <span>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIosGuide(false)}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Variant default 'banner' atau 'button' untuk halaman Login
  return (
    <>
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src="./icons/icon-192.png"
              alt="Icon Maisya Room"
              className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-emerald-400/50"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
              PWA
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white truncate">Instal Aplikasi Maisya</h4>
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Pasang di HP / Laptop seperti WhatsApp tanpa repot buka browser
            </p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all hover:scale-[1.03] active:scale-[0.98] shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang</span>
        </button>
      </div>

      {/* Modal Petunjuk iOS Safari */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Instal di iPhone / iPad</h4>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Ikuti 2 langkah mudah berikut di browser Safari:</p>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                  <span>Ketuk tombol <strong>Bagikan (Share)</strong> di bilah navigasi Safari (ikon kotak dengan panah ke atas).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                  <span>Gulir ke bawah lalu pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
