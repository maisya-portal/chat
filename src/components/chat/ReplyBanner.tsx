import React from 'react';
import { Reply, X } from 'lucide-react';
import { Message } from '../../types/message';

interface ReplyBannerProps {
  message: Message | null;
  onCancel: () => void;
}

export const ReplyBanner: React.FC<ReplyBannerProps> = ({ message, onCancel }) => {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-emerald-950/40 border-l-4 border-emerald-500 rounded-t-xl text-xs text-slate-300">
      <div className="flex items-center gap-2 overflow-hidden">
        <Reply className="w-4 h-4 text-emerald-400 shrink-0" />
        <div className="truncate">
          <span className="font-semibold text-emerald-300 mr-1.5">
            Membalas {message.nama_pengirim || 'Pengguna'}:
          </span>
          <span className="text-slate-400 italic">
            {message.message_type === 'image' ? '[Gambar]' : message.content}
          </span>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2"
        title="Batal balas"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
