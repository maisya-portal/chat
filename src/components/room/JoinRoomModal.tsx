import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Room } from '../../types/room';
import { useChat } from '../../context/ChatContext';
import { KeyRound } from 'lucide-react';

interface JoinRoomModalProps {
  room: Room | null;
  onClose: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ room, onClose }) => {
  const { joinRoom } = useChat();
  const [kode, setKode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await joinRoom(room.id_room, kode);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Gagal bergabung ke room');
    }
  };

  return (
    <Modal
      isOpen={Boolean(room)}
      onClose={onClose}
      title={`Bergabung ke ${room.nama_room}`}
      subtitle="Ruang ini membutuhkan kode otorisasi untuk bergabung"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kode Room (Passcode)</span>
          </label>
          <input
            type="text"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="Contoh: MUSYRIF26"
            required
            autoFocus
            className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-wider uppercase"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !kode.trim()}
            className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-950 disabled:opacity-50"
          >
            {loading ? 'Memvalidasi...' : 'Masuk Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
