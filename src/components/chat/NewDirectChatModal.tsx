import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { GasClient } from '../../api/gasClient';
import { User } from '../../types/user';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { 
  X, 
  Search, 
  MessageSquare, 
  UserCheck, 
  Users, 
  Sparkles,
  Loader2,
  ShieldAlert
} from 'lucide-react';

interface NewDirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuccess?: () => void;
}

export const NewDirectChatModal: React.FC<NewDirectChatModalProps> = ({
  isOpen,
  onClose,
  onSelectSuccess
}) => {
  const { user, token } = useAuth();
  const { startDirectChat } = useChat();

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await GasClient.getUsers(token || undefined);
        if (res.success && res.users) {
          // Hanya tampilkan user aktif & approved yang bukan diri sendiri
          const validUsers = res.users.filter((u: User) => 
            u.id_user !== user?.id_user &&
            (u.status_aktif === true || (u as any).status_aktif === 'TRUE' || (u as any).status_aktif === 1) &&
            (u.approval_status === 'approved' || !u.approval_status)
          );
          setUsers(validUsers);
        }
      } catch (err) {
        console.error('Failed to fetch users for DM:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, token, user]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = 
      !q ||
      u.nama.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.role_nama && u.role_nama.toLowerCase().includes(q)) ||
      (u.keterangan && u.keterangan.toLowerCase().includes(q));

    if (!matchQuery) return false;

    if (selectedRoleFilter === 'all') return true;
    if (selectedRoleFilter === 'admin') return u.role_id === 'ROLE_SUPERADMIN' || u.role_id === 'ROLE_ADMIN';
    if (selectedRoleFilter === 'musyrif') return u.role_id === 'ROLE_MUSYRIF';
    if (selectedRoleFilter === 'staff') return u.role_id === 'ROLE_STAFF';
    if (selectedRoleFilter === 'peserta') return u.role_id === 'ROLE_PESERTA';

    return true;
  });

  const handleStartChat = async (targetUserId: string) => {
    setIsStartingChat(targetUserId);
    try {
      const room = await startDirectChat(targetUserId);
      if (room) {
        onClose();
        if (onSelectSuccess) onSelectSuccess();
      }
    } finally {
      setIsStartingChat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Mulai Chat Pribadi</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  1-on-1
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pilih admin, asatidzah, staf, atau sesama santri untuk mengobrol secara privat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, username (@...), atau bagian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              autoFocus
            />
          </div>

          {/* Quick Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
            {[
              { id: 'all', label: 'Semua Anggota' },
              { id: 'admin', label: 'Admin' },
              { id: 'musyrif', label: 'Musyrif / Asatidzah' },
              { id: 'staff', label: 'Staf TU' },
              { id: 'peserta', label: 'Santri / Peserta' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedRoleFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-medium shrink-0 transition-all cursor-pointer ${
                  selectedRoleFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* User List Stream */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span>Memuat daftar anggota pesantren...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {searchQuery
                  ? `Tidak ada anggota yang cocok dengan "${searchQuery}".`
                  : 'Belum ada anggota lain yang terdaftar dan disetujui.'}
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isStarting = isStartingChat === u.id_user;
              return (
                <div
                  key={u.id_user}
                  onClick={() => !isStarting && handleStartChat(u.id_user)}
                  className="group p-3 rounded-2xl bg-slate-800/40 hover:bg-emerald-950/30 border border-slate-700/40 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={u.foto_url}
                      name={u.nama}
                      size="md"
                      isOnline={u.status_aktif}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                          {u.nama}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          @{u.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge roleId={u.role_id} label={u.role_nama} size="sm" />
                        {u.keterangan && (
                          <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            • {u.keterangan}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isStarting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartChat(u.id_user);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white border border-emerald-500/30 group-hover:border-emerald-500 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">Membuka...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Chat</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pesan bersifat pribadi hanya antara Anda dan penerima</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
