import React from 'react';
import { ScreenShareSession } from '../../types/api';
import { Monitor, Eye, Square } from 'lucide-react';
import { useScreenShare } from '../../context/ScreenShareContext';
import { useAuth } from '../../context/AuthContext';

interface ScreenShareBannerProps {
  session: ScreenShareSession | null;
  onWatch: () => void;
}

export const ScreenShareBanner: React.FC<ScreenShareBannerProps> = ({ session, onWatch }) => {
  const { isSharing, stopSharing } = useScreenShare();
  const { user } = useAuth();

  if (!session || session.status !== 'active') return null;

  const isPresenter = user?.id_user === session.id_user;

  return (
    <div className="mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-slate-900/80 border border-emerald-500/40 backdrop-blur-md shadow-lg flex items-center justify-between animate-pulse-subtle">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
          <Monitor className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Sesi Berbagi Layar Aktif</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </h4>
          <p className="text-[11px] text-slate-300">
            {isPresenter
              ? 'Anda sedang membagikan layar ke peserta room.'
              : `${session.presenter_name || 'Pemateri'} sedang membagikan materi / layar.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPresenter ? (
          <button
            onClick={stopSharing}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-rose-950"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Hentikan</span>
          </button>
        ) : (
          <button
            onClick={onWatch}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tonton Layar</span>
          </button>
        )}
      </div>
    </div>
  );
};
