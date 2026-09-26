import React, { useRef, useEffect } from 'react';
import { ScreenShareSession } from '../../types/api';
import { useScreenShare } from '../../context/ScreenShareContext';
import { X, Maximize, Square, Monitor, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ScreenShareModalProps {
  session: ScreenShareSession | null;
  onClose: () => void;
}

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({ session, onClose }) => {
  const { localStream, isSharing, stopSharing } = useScreenShare();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const isPresenter = user?.id_user === session?.id_user;

  useEffect(() => {
    if (videoRef.current && localStream && isPresenter) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isPresenter]);

  if (!session) return null;

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Berbagi Layar: {session.presenter_name || 'Pemateri'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  LIVE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                WebRTC P2P Display Stream - Maisya Room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Layar Penuh"
            >
              <Maximize className="w-4 h-4" />
            </button>
            {isPresenter && (
              <button
                onClick={async () => {
                  await stopSharing();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Hentikan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Screen Area */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {isPresenter && localStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            // Simulation/Viewer mode with stylized stream feed
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-radial from-slate-900 to-black">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
                <Monitor className="w-10 h-10 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Layar Sedang Dialirkan oleh {session.presenter_name}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mb-4">
                Sesi WebRTC aktif tercatat di Google Spreadsheet (<code>tb_screen_share_sessions</code>). Streaming video peer-to-peer terhubung langsung tanpa perantara database.
              </p>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Koneksi WebRTC P2P Aktif</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
