import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { 
  X, 
  Users, 
  Lock, 
  UserMinus, 
  LogOut, 
  Calendar,
  KeyRound,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { formatRelativeDate } from '../../utils/dateUtils';

interface RoomInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoomInfoPanel: React.FC<RoomInfoPanelProps> = ({ isOpen, onClose }) => {
  const { activeRoom, members, removeMember, leaveRoom, deleteRoom, startDirectChat } = useChat();
  const { user, can, isAdmin } = useAuth();

  if (!isOpen || !activeRoom) return null;

  const isDirect = Boolean(activeRoom.is_direct);
  const canRemove = !isDirect && can('remove_participant');
  const canDeleteRoom = !isDirect && (isAdmin || can('delete_room'));

  const handleKick = async (targetUserId: string, targetName: string) => {
    if (confirm(`Keluarkan ${targetName} dari room ini?`)) {
      await removeMember(activeRoom.id_room, targetUserId);
    }
  };

  const handleLeave = async () => {
    if (confirm(`Apakah Anda yakin ingin keluar dari ${activeRoom.nama_room}?`)) {
      await leaveRoom(activeRoom.id_room);
      onClose();
    }
  };

  const handleDeleteRoom = async () => {
    if (!activeRoom) return;
    if (confirm(`Hapus permanen room "${activeRoom.nama_room}"?\n\nSemua riwayat chat dan anggota di dalam room ini akan ikut terhapus dari sistem.`)) {
      await deleteRoom(activeRoom.id_room);
      onClose();
    }
  };

  const handleDirectChat = async (targetUserId: string) => {
    onClose();
    await startDirectChat(targetUserId);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          {isDirect ? (
            <>
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Info Lawan Bicara</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Informasi & Peserta Room</span>
            </>
          )}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        
        {/* Room Header Info Card */}
        <div className="text-center p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
          <div className="flex justify-center mb-3">
            <Avatar
              src={activeRoom.foto_url}
              name={activeRoom.nama_room}
              size="lg"
              isOnline={isDirect ? activeRoom.direct_partner?.status_aktif : undefined}
            />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            {activeRoom.nama_room}
          </h4>
          {isDirect ? (
            <div className="flex flex-col items-center gap-1.5 mt-2">
              <Badge 
                roleId={activeRoom.direct_partner?.role_id as any} 
                label={activeRoom.direct_partner?.role_nama || 'Anggota'} 
                size="sm" 
              />
              {activeRoom.direct_partner?.username && (
                <p className="text-xs text-slate-400">
                  @{activeRoom.direct_partner.username}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mt-1">
                <Lock className="w-3 h-3" />
                Obrolan 1-on-1 Privat
              </span>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                {activeRoom.deskripsi || 'Ruang komunikasi internal pesantren'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dibuat: {formatRelativeDate(activeRoom.created_at)}</span>
                </span>
                {activeRoom.membutuhkan_kode && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Memerlukan Kode</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Member List Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>{isDirect ? 'Anggota Obrolan' : 'Daftar Anggota'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                {members.length}
              </span>
            </h5>
          </div>

          <div className="space-y-2">
            {members.map((member) => {
              const isMe = member.id_user === user?.id_user;
              return (
                <div
                  key={member.id_member || member.id_user}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={member.foto_url}
                      name={member.nama}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {member.nama}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            (Anda)
                          </span>
                        )}
                      </div>
                      <Badge label={member.role_nama} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Chat Pribadi Button (available when not viewing self and not in direct chat) */}
                    {!isMe && !isDirect && (
                      <button
                        onClick={() => handleDirectChat(member.id_user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                        title={`Chat Pribadi dengan ${member.nama}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Kick Button for Moderator / Admin */}
                    {canRemove && !isMe && (
                      <button
                        onClick={() => handleKick(member.id_user, member.nama)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Keluarkan Peserta"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Actions for Group Rooms */}
        {!isDirect && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            {canDeleteRoom && (
              <button
                onClick={handleDeleteRoom}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                title="Hapus room ini dan seluruh pesannya secara permanen"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Room Ini (Admin)</span>
              </button>
            )}

            <button
              onClick={handleLeave}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-700/80 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Keluar dari Room Ini</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
