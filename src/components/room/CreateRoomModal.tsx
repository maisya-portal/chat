import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useChat } from '../../context/ChatContext';
import { MessageSquarePlus, Lock, Image as ImageIcon } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const { createRoom } = useChat();

  const [namaRoom, setNamaRoom] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [membutuhkanKode, setMembutuhkanKode] = useState(false);
  const [kodeRoom, setKodeRoom] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRoom.trim()) return;

    setError('');
    setLoading(true);

    const res = await createRoom({
      namaRoom: namaRoom.trim(),
      deskripsi: deskripsi.trim(),
      membutuhkanKode,
      kodeRoom: membutuhkanKode ? kodeRoom.trim().toUpperCase() : '',
      fotoUrl: fotoUrl.trim() || undefined
    });

    setLoading(false);

    if (res.success) {
      setNamaRoom('');
      setDeskripsi('');
      setMembutuhkanKode(false);
      setKodeRoom('');
      setFotoUrl('');
      onClose();
    } else {
      setError(res.error || 'Gagal membuat room');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Room Percakapan Baru"
      subtitle="Data room akan otomatis tersimpan di Google Spreadsheet (tb_rooms)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Nama Room *
          </label>
          <input
            type="text"
            value={namaRoom}
            onChange={(e) => setNamaRoom(e.target.value)}
            placeholder="Contoh: Room Asatidzah & Pengajaran"
            required
            className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Deskripsi Ruang
          </label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Tujuan, halaqah, atau divisi peruntukan room ini..."
            rows={2}
            className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 custom-scrollbar resize-none"
          />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Proteksi Kode Masuk
                </span>
                <span className="text-[11px] text-slate-400">
                  Hanya pengguna dengan kode yang dapat bergabung
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={membutuhkanKode}
              onChange={(e) => setMembutuhkanKode(e.target.checked)}
              className="w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-emerald-500 bg-slate-900"
            />
          </div>

          {membutuhkanKode && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Kode Passcode Room *
              </label>
              <input
                type="text"
                value={kodeRoom}
                onChange={(e) => setKodeRoom(e.target.value)}
                placeholder="Contoh: ASATIDZAH26"
                required={membutuhkanKode}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>URL Foto / Thumbnail Room (Opsional)</span>
          </label>
          <input
            type="url"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !namaRoom.trim()}
            className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-950 disabled:opacity-50 flex items-center gap-1.5"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{loading ? 'Menyimpan ke Spreadsheet...' : 'Buat Room'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
