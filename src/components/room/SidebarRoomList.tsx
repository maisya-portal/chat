import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Room } from '../../types/room';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { JoinRoomModal } from './JoinRoomModal';
import { CreateRoomModal } from './CreateRoomModal';
import { GasClient } from '../../api/gasClient';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Lock, 
  Shield, 
  LogOut, 
  Users, 
  Database,
  Radio,
  UserCheck,
  Palette,
  Settings,
  Edit3
} from 'lucide-react';
import { PwaInstallButton } from '../common/PwaInstallButton';
import { UserSettingsModal } from '../profile/UserSettingsModal';

interface SidebarRoomListProps {
  onOpenAdminDashboard: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarRoomList: React.FC<SidebarRoomListProps> = ({
  onOpenAdminDashboard,
  isOpen,
  onClose
}) => {
  const { user, logout, can, isAdmin } = useAuth();
  const { rooms, activeRoom, selectRoom, joinRoom, isLoadingRooms } = useChat();

  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningRoom, setJoiningRoom] = useState<Room | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const canCreateRoom = can('create_room');
  const canViewDashboard = can('view_dashboard');
  const isMock = GasClient.isMockMode();

  useEffect(() => {
    if (!canViewDashboard) return;
    const fetchPending = async () => {
      try {
        const res = await GasClient.getPendingUsers();
        if (res.success && res.users) {
          setPendingCount(res.users.length);
        }
      } catch {
        // silent
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, [canViewDashboard]);

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.nama_room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'my') {
      return matchesSearch && r.is_joined;
    }
    return matchesSearch;
  });

  const handleRoomClick = async (room: Room) => {
    if (room.is_joined) {
      selectRoom(room);
      onClose();
    } else {
      if (room.membutuhkan_kode) {
        setJoiningRoom(room);
      } else {
        const res = await joinRoom(room.id_room);
        if (res.success) {
          selectRoom(room);
          onClose();
        }
      }
    }
  };

  return (
    <>
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-300 backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Branding Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-400 p-0.5 shadow-lg shadow-emerald-950">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-emerald-400 font-black text-lg">
                  M
                </div>
              </div>
              <div>
                <h1 className="text-base font-black text-white tracking-wide flex items-center gap-1.5">
                  <span>MAISYA</span>
                  <span className="text-emerald-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    ROOM
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                  PP Imam Syafi'i Brebes
                </p>
              </div>
            </div>

            {/* Live Database Engine Indicator */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                isMock
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
              title={isMock ? 'Database: Google Spreadsheet Simulator' : 'Database: Google Spreadsheet DB_MAISYA_CHAT Live'}
            >
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>{isMock ? 'SPREADSHEET' : 'LIVE GAS'}</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ruang halaqah / divisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80"
            />
          </div>
        </div>

        {/* Tab Switcher & Create Room Button */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'my'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Room Saya
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Room
            </button>
          </div>

          {canCreateRoom && (
            <button
              onClick={() => setIsCreateRoomOpen(true)}
              className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Buat Room Baru"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Buat</span>
            </button>
          )}
        </div>

        {/* Room List Stream */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          {isLoadingRooms ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Memuat daftar room...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              {activeTab === 'my'
                ? 'Belum ada room yang Anda ikuti. Coba klik tab "Semua Room".'
                : 'Tidak ada room yang cocok dengan pencarian.'}
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isSelected = activeRoom?.id_room === room.id_room;
              return (
                <div
                  key={room.id_room}
                  onClick={() => handleRoomClick(room)}
                  className={`group relative p-2.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-800/30 hover:bg-slate-800/70 border-slate-700/30'
                  }`}
                >
                  {/* Room Thumbnail */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        room.foto_url ||
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'
                      }
                      alt={room.nama_room}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700/60"
                    />
                    {room.membutuhkan_kode && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500/90 text-slate-950 shadow">
                        <Lock className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Room Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-emerald-300' : 'text-slate-200'
                        }`}
                      >
                        {room.nama_room}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {room.deskripsi || 'Ruang komunikasi'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {room.member_count || 1}
                      </span>
                      {room.is_joined ? (
                        <span className="text-emerald-400 font-medium">Tergabung</span>
                      ) : (
                        <span className="text-amber-400 font-medium group-hover:underline">
                          + Gabung
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* User Footer Profile & Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center justify-between mb-2.5">
            <div 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85 transition-all group"
              title="Klik untuk mengubah profil, foto, tema, & latar chat"
            >
              <div className="relative shrink-0">
                <Avatar
                  src={user?.foto_url}
                  name={user?.nama || 'Pengguna'}
                  size="md"
                  isOnline={true}
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-600 text-white shadow ring-1 ring-slate-950 group-hover:scale-110 transition-transform">
                  <Edit3 className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                  {user?.nama}
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge roleId={user?.role_id} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                title="Pengaturan Profil, Tema (Gelap/Terang), & Latar Chat"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PWA Install Button */}
          <div className="mb-2">
            <PwaInstallButton variant="sidebar" />
          </div>

          {/* Admin Dashboard Entry Button */}
          {canViewDashboard && (
            <button
              onClick={onOpenAdminDashboard}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-between transition-all shadow-sm group"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Panel Dashboard Admin</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse shadow-sm flex items-center gap-1">
                  <UserCheck className="w-2.5 h-2.5" />
                  <span>{pendingCount}</span>
                </span>
              )}
            </button>
          )}
        </div>
      </aside>

      {/* Join Room Modal */}
      <JoinRoomModal
        room={joiningRoom}
        onClose={() => setJoiningRoom(null)}
      />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />

      {/* User Settings, Theme, & Wallpaper Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
