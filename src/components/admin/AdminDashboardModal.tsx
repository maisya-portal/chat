import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { GasClient } from '../../api/gasClient';
import { User, Role } from '../../types/user';
import { Room } from '../../types/room';
import { Permission } from '../../types/permission';
import { ActivityLog, DashboardStats } from '../../types/api';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { formatRelativeDate } from '../../utils/dateUtils';
import { 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Activity, 
  Database, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Settings,
  RefreshCw,
  Image,
  Layers,
  Key,
  Radio,
  UserCheck,
  Clock,
  Phone,
  Check,
  X,
  AlertCircle,
  Trash2,
  Lock,
  Unlock,
  Edit3,
  Plus,
  KeyRound,
  Copy
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { deleteRoom, updateRoom, toggleRoomLock, createRoom, refreshRooms } = useChat();

  const [activeTab, setActiveTab] = useState<'stats' | 'approvals' | 'users' | 'rooms' | 'roles' | 'logs' | 'conn'>('stats');

  // State data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [permissionList, setPermissionList] = useState<Permission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Filter pending users for approval
  const pendingUsers = userList.filter(u => u.approval_status === 'pending');

  // User Management State (Create & Edit)
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userNama, setUserNama] = useState('');
  const [userKode, setUserKode] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userRole, setUserRole] = useState('ROLE_PESERTA');
  const [userStatusAktif, setUserStatusAktif] = useState(true);
  const [userNoWa, setUserNoWa] = useState('');
  const [userKeterangan, setUserKeterangan] = useState('');
  const [userFoto, setUserFoto] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Room Management State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomNama, setRoomNama] = useState('');
  const [roomDeskripsi, setRoomDeskripsi] = useState('');
  const [roomMembutuhkanKode, setRoomMembutuhkanKode] = useState(false);
  const [roomKode, setRoomKode] = useState('');
  const [roomFoto, setRoomFoto] = useState('');
  const [roomActionLoading, setRoomActionLoading] = useState(false);
  const [roomFeedback, setRoomFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Connection config state
  const [customGasUrl, setCustomGasUrl] = useState(GasClient.getBaseUrl());
  const [connStatus, setConnStatus] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [st, us, rm, ro, pm, lg] = await Promise.all([
        GasClient.getDashboardStats(),
        GasClient.getUsers(),
        GasClient.getRooms(user?.id_user || 'USR_ADMIN_IFTAH'),
        GasClient.getRoles(),
        GasClient.getPermissions(),
        GasClient.getActivityLogs(40)
      ]);

      if (st.success && st.stats) setStats(st.stats);
      if (us.success && us.users) setUserList(us.users);
      if (rm.success && rm.rooms) setRoomList(rm.rooms);
      if (ro.success && ro.roles) setRoleList(ro.roles);
      if (pm.success && pm.permissions) setPermissionList(pm.permissions);
      if (lg.success && lg.logs) setActivityLogs(lg.logs);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleApprove = async (userId: string, roleId?: string) => {
    const res = await GasClient.approveUser(userId, roleId);
    if (res.success) {
      loadData();
    }
  };

  const handleReject = async (userId: string) => {
    const res = await GasClient.rejectUser(userId);
    if (res.success) {
      loadData();
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const res = await GasClient.toggleUserStatus(userId);
    if (res.success) {
      setUserList(prev =>
        prev.map(u => (u.id_user === userId ? { ...u, status_aktif: res.status_aktif } : u))
      );
    }
  };

  const handleAddSimulatedApplicant = async () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const names = [
      'Ahmad Syarifuddin',
      'Fatimah Azzahra',
      'Ustadz Abdullah Al-Atsari',
      'Bilal bin Rabah',
      'Thariq bin Ziyad'
    ];
    const pickedName = names[Math.floor(Math.random() * names.length)];
    const username = pickedName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + randomNum;
    
    await GasClient.registerUser({
      nama: `${pickedName} (${randomNum})`,
      username: username,
      kodeLogin: 'santri' + randomNum,
      roleId: pickedName.startsWith('Ustadz') ? 'ROLE_MUSYRIF' : 'ROLE_PESERTA',
      noWa: '0812' + randomNum + '789',
      keterangan: 'Pendaftaran mandiri santri/asatidzah baru'
    });
    await loadData();
  };

  const startCreateUser = () => {
    setEditingUser(null);
    setUserNama('');
    setUserKode('');
    setUserUsername('');
    setUserRole('ROLE_PESERTA');
    setUserStatusAktif(true);
    setUserNoWa('');
    setUserKeterangan('');
    setUserFoto('');
    setUserFeedback(null);
    setIsUserFormOpen(true);
  };

  const startEditUser = (u: User) => {
    setEditingUser(u);
    setUserNama(u.nama);
    setUserKode(''); // opsional: jika dikosongkan tidak mengubah password lama
    setUserUsername(u.username);
    setUserRole(u.role_id);
    setUserStatusAktif(u.status_aktif);
    setUserNoWa(u.no_wa || '');
    setUserKeterangan(u.keterangan || '');
    setUserFoto(u.foto_url || '');
    setUserFeedback(null);
    setIsUserFormOpen(true);
  };

  const cancelUserForm = () => {
    setEditingUser(null);
    setIsUserFormOpen(false);
    setUserNama('');
    setUserKode('');
    setUserUsername('');
    setUserFoto('');
    setUserFeedback(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNama.trim() || !userUsername.trim()) return;

    setUserActionLoading(true);
    setUserFeedback(null);

    if (editingUser) {
      const res = await GasClient.updateUser(editingUser.id_user, {
        nama: userNama.trim(),
        username: userUsername.trim(),
        kodeLogin: userKode.trim() || undefined,
        roleId: userRole,
        statusAktif: userStatusAktif,
        noWa: userNoWa.trim() || undefined,
        keterangan: userKeterangan.trim() || undefined,
        fotoUrl: userFoto.trim() || undefined
      });
      setUserActionLoading(false);
      if (res.success) {
        setUserFeedback({ type: 'success', message: res.message || 'Data pengguna berhasil diperbarui!' });
        cancelUserForm();
        await loadData();
      } else {
        setUserFeedback({ type: 'error', message: res.error || 'Gagal memperbarui pengguna' });
      }
    } else {
      if (!userKode.trim()) {
        setUserActionLoading(false);
        setUserFeedback({ type: 'error', message: 'Password / Kode Login wajib diisi untuk pengguna baru' });
        return;
      }
      const res = await GasClient.createUser({
        nama: userNama.trim(),
        kodeLogin: userKode.trim(),
        username: userUsername.trim(),
        roleId: userRole,
        fotoUrl: userFoto.trim() || undefined
      });
      setUserActionLoading(false);
      if (res.success) {
        setUserFeedback({ type: 'success', message: res.message || 'Pengguna baru berhasil ditambahkan!' });
        cancelUserForm();
        await loadData();
      } else {
        setUserFeedback({ type: 'error', message: res.error || 'Gagal menambahkan pengguna' });
      }
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (u.id_user === 'USR_ADMIN_IFTAH' || u.username.toLowerCase() === 'iftahadmin') {
      alert('Akun Super Admin Utama (iftahadmin) dilindungi dan tidak dapat dihapus demi keamanan sistem.');
      return;
    }

    if (!window.confirm(`Hapus permanen akun pengguna "${u.nama}" (@${u.username})?\n\nPengguna ini tidak akan dapat login lagi dan semua akses keanggotaan room akan dicabut.`)) {
      return;
    }

    setUserActionLoading(true);
    setUserFeedback(null);
    const res = await GasClient.deleteUser(u.id_user);
    setUserActionLoading(false);

    if (res.success) {
      setUserFeedback({ type: 'success', message: res.message || `Pengguna "${u.nama}" berhasil dihapus!` });
      await loadData();
    } else {
      setUserFeedback({ type: 'error', message: res.error || 'Gagal menghapus pengguna' });
    }
  };

  const handleDeleteRoom = async (roomId: string, namaRoom: string) => {
    if (!window.confirm(`Hapus permanen room "${namaRoom}"?\n\nSemua riwayat chat dan anggota di dalam room ini akan ikut terhapus dari database.`)) {
      return;
    }
    setRoomActionLoading(true);
    setRoomFeedback(null);
    const res = await deleteRoom(roomId);
    setRoomActionLoading(false);
    if (res.success) {
      setRoomFeedback({ type: 'success', message: `Room "${namaRoom}" berhasil dihapus!` });
      await loadData();
      await refreshRooms();
    } else {
      setRoomFeedback({ type: 'error', message: res.error || 'Gagal menghapus room' });
    }
  };

  const handleToggleLock = async (room: Room) => {
    let newKode: string | undefined = undefined;
    if (!room.membutuhkan_kode) {
      const input = window.prompt(`Masukkan kode PIN baru untuk mengunci room "${room.nama_room}":`, room.kode_room || 'MAISYA26');
      if (input === null) return;
      newKode = input.trim();
    }
    setRoomActionLoading(true);
    setRoomFeedback(null);
    const res = await toggleRoomLock(room.id_room, newKode);
    setRoomActionLoading(false);
    if (res.success) {
      setRoomFeedback({ type: 'success', message: res.message || 'Status kunci room berhasil diperbarui' });
      await loadData();
      await refreshRooms();
    } else {
      setRoomFeedback({ type: 'error', message: res.error || 'Gagal mengubah status kunci room' });
    }
  };

  const startEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomNama(room.nama_room);
    setRoomDeskripsi(room.deskripsi || '');
    setRoomMembutuhkanKode(room.membutuhkan_kode);
    setRoomKode(room.kode_room || '');
    setRoomFoto(room.foto_url || '');
    setIsAddRoomOpen(true);
    setRoomFeedback(null);
  };

  const cancelRoomForm = () => {
    setEditingRoom(null);
    setIsAddRoomOpen(false);
    setRoomNama('');
    setRoomDeskripsi('');
    setRoomMembutuhkanKode(false);
    setRoomKode('');
    setRoomFoto('');
    setRoomFeedback(null);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNama.trim()) return;

    setRoomActionLoading(true);
    setRoomFeedback(null);

    if (editingRoom) {
      const res = await updateRoom(editingRoom.id_room, {
        nama_room: roomNama.trim(),
        deskripsi: roomDeskripsi.trim(),
        membutuhkan_kode: roomMembutuhkanKode,
        kode_room: roomMembutuhkanKode ? roomKode.trim().toUpperCase() : '',
        foto_url: roomFoto.trim() || undefined
      });
      setRoomActionLoading(false);
      if (res.success) {
        setRoomFeedback({ type: 'success', message: res.message || 'Room berhasil diperbarui' });
        cancelRoomForm();
        await loadData();
        await refreshRooms();
      } else {
        setRoomFeedback({ type: 'error', message: res.error || 'Gagal memperbarui room' });
      }
    } else {
      const res = await createRoom({
        namaRoom: roomNama.trim(),
        deskripsi: roomDeskripsi.trim(),
        membutuhkanKode: roomMembutuhkanKode,
        kodeRoom: roomMembutuhkanKode ? roomKode.trim().toUpperCase() : '',
        fotoUrl: roomFoto.trim() || undefined
      });
      setRoomActionLoading(false);
      if (res.success) {
        setRoomFeedback({ type: 'success', message: 'Room baru berhasil dibuat!' });
        cancelRoomForm();
        await loadData();
        await refreshRooms();
      } else {
        setRoomFeedback({ type: 'error', message: res.error || 'Gagal membuat room' });
      }
    }
  };

  const handleSaveGasUrl = () => {
    GasClient.setBaseUrl(customGasUrl);
    setConnStatus('Konfigurasi URL Web App disimpan. Menyegarkan data...');
    setTimeout(() => {
      setConnStatus('');
      loadData();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dashboard & Pengaturan Sistem Maisya"
      subtitle="Pengendalian Database Google Spreadsheet DB_MAISYA_CHAT & Google Apps Script"
      maxWidth="4xl"
    >
      {/* Top Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-5 border-b border-slate-700/60 custom-scrollbar text-xs font-semibold">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'stats'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Ikhtisar</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'approvals'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-300" />
          <span>Persetujuan User</span>
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Semua Pengguna</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'rooms'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Manajemen Room</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'roles'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role & Hak Akses</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Log Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('conn')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'conn'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Koneksi GAS API</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span>Menghubungi Google Apps Script / Spreadsheet...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: IKHTISAR & STATISTIK */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div 
                  onClick={() => setActiveTab('approvals')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
                    pendingUsers.length > 0
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40'
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                  title="Klik untuk membuka tab persetujuan user"
                >
                  <div className="flex items-center justify-between text-amber-400 mb-2">
                    <span className="text-xs font-semibold">Menunggu Izin</span>
                    <UserCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-black text-amber-400">{pendingUsers.length}</p>
                    {pendingUsers.length > 0 && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full animate-pulse">
                        Perlu Izin
                      </span>
                    )}
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Total User</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats?.totalUsers || 0}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">User Aktif</span>
                    <CheckCircle className="w-4 h-4 text-teal-400" />
                  </div>
                  <p className="text-2xl font-black text-emerald-400">{stats?.activeUsers || 0}</p>
                </div>

                <div 
                  onClick={() => setActiveTab('rooms')}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Total Room</span>
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats?.totalRooms || 0}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Total Pesan</span>
                    <Activity className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats?.totalMessages || 0}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Gambar / Media</span>
                    <Image className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats?.totalImages || 0}</p>
                </div>
              </div>

              {/* QUICK ACTION: PENDING APPROVALS LIST DIRECTLY IN TAB IKHTISAR */}
              {pendingUsers.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{pendingUsers.length} Pendaftar Baru Menunggu Izin Anda</span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                            PENTING
                          </span>
                        </h4>
                        <p className="text-xs text-amber-200/80">
                          Akun baru tidak dapat login sebelum Anda menekan tombol "Setujui".
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 self-start sm:self-center transition-colors cursor-pointer"
                    >
                      <span>Buka Halaman Lengkap</span>
                      <span>→</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingUsers.slice(0, 4).map((u) => (
                      <div
                        key={u.id_user}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={u.foto_url} name={u.nama} size="sm" isOnline={false} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 truncate">
                              <p className="text-xs font-bold text-white truncate">{u.nama}</p>
                              <Badge roleId={u.role_id} size="sm" />
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              @{u.username} {u.no_wa ? `• WA: ${u.no_wa}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleReject(u.id_user)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs transition-colors cursor-pointer"
                            title="Tolak pendaftaran"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleApprove(u.id_user, u.role_id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-950 transition-all hover:scale-[1.02] cursor-pointer"
                            title="Setujui dan aktifkan akun ini"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Google Spreadsheet DB_MAISYA_CHAT
                    </h4>
                    <p className="text-xs text-slate-400">
                      Single Source of Truth dengan 13 Sheet aktif, LockService Concurrency Guard, dan Google Drive Media Storage.
                    </p>
                  </div>
                </div>
                <button
                  onClick={loadData}
                  className="px-4 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan Data</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: PERSETUJUAN PENDAFTARAN (APPROVALS) */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Persetujuan Pendaftaran Akun ({pendingUsers.length})</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    User yang mendaftar online harus disetujui oleh Admin (<span className="text-emerald-400 font-mono">iftahadmin</span>) sebelum dapat login ke ruang chat.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddSimulatedApplicant}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Buat pendaftar acak untuk menguji alur persetujuan"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Pendaftar Uji Coba</span>
                  </button>
                  <button
                    onClick={loadData}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Segarkan</span>
                  </button>
                </div>
              </div>

              {/* INFO BOX TENTANG SISTEM PENDAFTARAN */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Petunjuk Pendaftar Baru:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  • <strong>Penyimpanan Browser (Offline/Simulasi):</strong> Jika aplikasi belum dihubungkan ke URL Google Apps Script yang sama di tab <em>Koneksi GAS API</em>, pendaftaran yang dilakukan di tab incognito atau HP lain akan tersimpan di browser masing-masing.
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  • <strong>Koneksi Multi-Perangkat (Online Nyata):</strong> Sambungkan URL Google Apps Script Anda agar pendaftaran dari perangkat manapun otomatis masuk ke Google Spreadsheet dan langsung tampil di panel admin ini secara realtime.
                </p>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-slate-800/20 border border-slate-700/40 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-white">Semua Pendaftaran Telah Diproses</h5>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Tidak ada antrian pendaftaran pengguna baru yang menunggu persetujuan saat ini.
                  </p>
                  <button
                    onClick={handleAddSimulatedApplicant}
                    className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 transition-all hover:scale-[1.02] shadow-md cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Buat 1 Pendaftar Uji Coba Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((u) => (
                    <div
                      key={u.id_user}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/30 hover:border-amber-500/50 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.foto_url} name={u.nama} size="md" isOnline={false} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white">{u.nama}</p>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Menunggu Izin</span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span>@{u.username}</span>
                              <span>•</span>
                              <span>Peran diajukan:</span>
                              <Badge roleId={u.role_id} size="sm" />
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleReject(u.id_user)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>

                          <button
                            onClick={() => handleApprove(u.id_user, u.role_id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui & Beri Izin</span>
                          </button>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {(u.no_wa || u.keterangan) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-700/50 text-xs text-slate-300">
                          {u.no_wa && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WhatsApp: <strong className="text-slate-200">{u.no_wa}</strong></span>
                            </div>
                          )}
                          {u.keterangan && (
                            <div className="text-slate-400">
                              <span>Keterangan: <strong className="text-slate-200">{u.keterangan}</strong></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAJEMEN PENGGUNA */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700/50">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Daftar Pengguna ({userList.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kelola data pengguna, perbarui akun, ubah role, atur status aktif, atau hapus akun pengguna.
                  </p>
                </div>
                {!isUserFormOpen && (
                  <button
                    onClick={startCreateUser}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950 cursor-pointer self-start sm:self-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Tambah Pengguna</span>
                  </button>
                )}
              </div>

              {/* Feedback Alert Box */}
              {userFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
                    userFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {userFeedback.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{userFeedback.message}</span>
                  </div>
                  <button
                    onClick={() => setUserFeedback(null)}
                    className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Form Tambah / Edit Pengguna */}
              {isUserFormOpen && (
                <form
                  onSubmit={handleSaveUser}
                  className="p-5 rounded-2xl bg-slate-800/90 border border-emerald-500/50 shadow-xl space-y-4 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      {editingUser ? (
                        <>
                          <Edit3 className="w-4 h-4 text-emerald-400" />
                          <span>Edit Pengguna: <strong className="text-emerald-300">{editingUser.nama}</strong></span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-emerald-400" />
                          <span>Tambah Pengguna Baru</span>
                        </>
                      )}
                    </h5>
                    <button
                      type="button"
                      onClick={cancelUserForm}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/60 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nama Lengkap <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Zaid bin Haritsah"
                        value={userNama}
                        onChange={(e) => setUserNama(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Username <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: zaid_santri"
                        value={userUsername}
                        onChange={(e) => setUserUsername(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {editingUser ? 'Password / Kode Login Baru' : 'Password / Kode Login *'}
                      </label>
                      <input
                        type="text"
                        placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah password' : 'Masukkan password login pengguna'}
                        value={userKode}
                        onChange={(e) => setUserKode(e.target.value)}
                        required={!editingUser}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      />
                      {editingUser && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Biarkan kosong jika tetap menggunakan password lama.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Peran (Role) Akses <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ROLE_SUPERADMIN">Super Admin (Akses Penuh)</option>
                        <option value="ROLE_ADMIN">Admin (Pengelola)</option>
                        <option value="ROLE_MUSYRIF">Musyrif / Asatidzah</option>
                        <option value="ROLE_STAFF">Staff TU / Sarpras</option>
                        <option value="ROLE_PESERTA">Peserta / Santri</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Status Akun
                      </label>
                      <select
                        value={userStatusAktif ? 'aktif' : 'nonaktif'}
                        onChange={(e) => setUserStatusAktif(e.target.value === 'aktif')}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="aktif">Aktif (Dapat Login)</option>
                        <option value="nonaktif">Nonaktif (Diblokir)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nomor WhatsApp (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 081234567890"
                        value={userNoWa}
                        onChange={(e) => setUserNoWa(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Keterangan / Catatan Tambahan (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Santri Tahfidz Angkatan 2026 / Pembina Kamar A"
                        value={userKeterangan}
                        onChange={(e) => setUserKeterangan(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/60">
                    <button
                      type="button"
                      onClick={cancelUserForm}
                      className="px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/60 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={userActionLoading}
                      className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {userActionLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{editingUser ? 'Perbarui Pengguna' : 'Simpan Pengguna Baru'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Daftar Pengguna Stream */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                {userList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-800/20 border border-slate-700/40">
                    Belum ada pengguna terdaftar.
                  </div>
                ) : (
                  userList.map((u) => {
                    const isMainAdmin = u.id_user === 'USR_ADMIN_IFTAH' || u.username.toLowerCase() === 'iftahadmin';
                    return (
                      <div
                        key={u.id_user}
                        className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/60 transition-all space-y-2 group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Info User */}
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar src={u.foto_url} name={u.nama} size="md" isOnline={u.status_aktif} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-bold text-white truncate">{u.nama}</p>
                                <Badge roleId={u.role_id} size="sm" />
                                {u.approval_status === 'pending' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>Menunggu Izin</span>
                                  </span>
                                )}
                                {u.approval_status === 'rejected' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                                    Ditolak
                                  </span>
                                )}
                                {isMainAdmin && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                                    Akun Utama
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-emerald-400/90">@{u.username}</span>
                                <span>•</span>
                                <span className="text-slate-500 text-[10px]">ID: {u.id_user}</span>
                                {u.no_wa && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-300 flex items-center gap-1">
                                      <Phone className="w-2.5 h-2.5 text-emerald-400" />
                                      {u.no_wa}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Tombol Aksi: Setujui, Toggle Status, Edit, Hapus */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {u.approval_status === 'pending' && (
                              <button
                                onClick={() => handleApprove(u.id_user, u.role_id)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
                                title="Setujui pendaftaran akun ini"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                            )}

                            {/* Tombol Toggle Status Aktif */}
                            <button
                              onClick={() => handleToggleStatus(u.id_user)}
                              disabled={isMainAdmin}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                                isMainAdmin
                                  ? 'bg-emerald-500/10 text-emerald-400/60 cursor-not-allowed'
                                  : u.status_aktif
                                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-400 cursor-pointer'
                                  : 'bg-rose-500/10 text-rose-400 hover:bg-emerald-500/20 hover:text-emerald-400 cursor-pointer'
                              }`}
                              title={isMainAdmin ? 'Akun Super Admin Utama selalu aktif' : 'Klik untuk mengubah status aktif/nonaktif'}
                            >
                              {u.status_aktif ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{u.status_aktif ? 'Aktif' : 'Nonaktif'}</span>
                            </button>

                            {/* Tombol Edit Pengguna */}
                            <button
                              onClick={() => startEditUser(u)}
                              className="p-1.5 rounded-xl bg-slate-700/60 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-600/50 hover:border-emerald-500/40 text-xs transition-all cursor-pointer"
                              title="Edit Data Pengguna"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Hapus Pengguna */}
                            {!isMainAdmin ? (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-xs transition-all cursor-pointer"
                                title="Hapus Akun Pengguna Secara Permanen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span
                                className="p-1.5 rounded-xl text-slate-600 cursor-not-allowed"
                                title="Akun Super Admin Utama terlindungi dari penghapusan"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500/50" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Catatan / Keterangan tambahan jika ada */}
                        {u.keterangan && (
                          <div className="pt-1.5 border-t border-slate-700/40 text-[11px] text-slate-400">
                            <span>Catatan: </span>
                            <span className="text-slate-300">{u.keterangan}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MANAJEMEN ROOM */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700/50">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Daftar Room Percakapan ({roomList.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kelola status proteksi kode PIN, ubah informasi room, atau hapus room permanen.
                  </p>
                </div>
                {!isAddRoomOpen && (
                  <button
                    onClick={() => {
                      cancelRoomForm();
                      setIsAddRoomOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Buat Room Baru</span>
                  </button>
                )}
              </div>

              {/* Feedback Alert */}
              {roomFeedback && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
                    roomFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {roomFeedback.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{roomFeedback.message}</span>
                  </div>
                  <button
                    onClick={() => setRoomFeedback(null)}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Form Tambah / Edit Room */}
              {isAddRoomOpen && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-3.5 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h5 className="text-xs font-bold text-white flex items-center gap-2">
                      {editingRoom ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                      <span>{editingRoom ? `Edit Room: ${editingRoom.nama_room}` : 'Buat Room Percakapan Baru'}</span>
                    </h5>
                    <button
                      onClick={cancelRoomForm}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveRoom} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Nama Room *
                        </label>
                        <input
                          type="text"
                          value={roomNama}
                          onChange={(e) => setRoomNama(e.target.value)}
                          placeholder="Contoh: Halaqah Tahfidz & Quran"
                          required
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          URL Foto / Thumbnail (Opsional)
                        </label>
                        <input
                          type="url"
                          value={roomFoto}
                          onChange={(e) => setRoomFoto(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Deskripsi Room
                      </label>
                      <textarea
                        value={roomDeskripsi}
                        onChange={(e) => setRoomDeskripsi(e.target.value)}
                        placeholder="Uraian peruntukan ruang percakapan..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 custom-scrollbar resize-none"
                      />
                    </div>

                    {/* Pengaturan Kunci / Kode Room */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-400" />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Proteksi Kunci Kode PIN (LOCK)
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Jika aktif, santri atau peserta wajib memasukkan PIN untuk masuk ke room ini.
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          id="admin_room_membutuhkan_kode"
                          checked={roomMembutuhkanKode}
                          onChange={(e) => setRoomMembutuhkanKode(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 border-slate-700 bg-slate-800 cursor-pointer"
                        />
                      </div>

                      {roomMembutuhkanKode && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                            Kode PIN / Passcode Room *
                          </label>
                          <input
                            type="text"
                            value={roomKode}
                            onChange={(e) => setRoomKode(e.target.value.toUpperCase())}
                            placeholder="Contoh: TAHFIDZ26 atau KODE123"
                            required={roomMembutuhkanKode}
                            className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-xl text-amber-300 font-mono tracking-wider text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={cancelRoomForm}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={roomActionLoading}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors disabled:opacity-50"
                      >
                        {roomActionLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{editingRoom ? 'Simpan Perubahan' : 'Buat Room'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Grid Daftar Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                {roomList.map((r) => (
                  <div
                    key={r.id_room}
                    className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600/80 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <img
                          src={r.foto_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'}
                          alt={r.nama_room}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <h5 className="text-xs font-bold text-white truncate" title={r.nama_room}>
                              {r.nama_room}
                            </h5>
                            {r.membutuhkan_kode ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>LOCK</span>
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium flex items-center gap-1">
                                <Unlock className="w-2.5 h-2.5" />
                                <span>PUBLIK</span>
                              </span>
                            )}
                          </div>

                          {r.membutuhkan_kode && r.kode_room && (
                            <div className="mb-1">
                              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                                PIN: <strong>{r.kode_room}</strong>
                              </span>
                            </div>
                          )}

                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {r.deskripsi || 'Tidak ada deskripsi'}
                          </p>

                          <div className="mt-1.5 text-[10px] text-slate-500 font-mono">
                            ID: {r.id_room}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Baris Tombol Aksi Admin */}
                    <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {/* Toggle Lock / Unlock */}
                        <button
                          onClick={() => handleToggleLock(r)}
                          disabled={roomActionLoading}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                            r.membutuhkan_kode
                              ? 'bg-amber-500/10 text-amber-300 hover:bg-emerald-500/20 hover:text-emerald-300 border border-amber-500/30'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-600/40'
                          }`}
                          title={r.membutuhkan_kode ? 'Klik untuk membuka kunci (menjadikan publik)' : 'Klik untuk mengunci room dengan kode PIN'}
                        >
                          {r.membutuhkan_kode ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{r.membutuhkan_kode ? 'Buka Kunci' : 'Kunci PIN'}</span>
                        </button>

                        {/* Edit Room */}
                        <button
                          onClick={() => startEditRoom(r)}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-700/50 text-slate-300 hover:bg-sky-500/20 hover:text-sky-300 border border-slate-600/40 flex items-center gap-1 transition-colors"
                          title="Ubah nama, deskripsi, atau foto room"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>

                      {/* Hapus Room Permanen */}
                      <button
                        onClick={() => handleDeleteRoom(r.id_room, r.nama_room)}
                        disabled={roomActionLoading}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-colors"
                        title="Hapus room ini secara permanen dari sistem"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}

                {roomList.length === 0 && (
                  <div className="col-span-full p-8 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Belum ada room percakapan yang terdaftar.</p>
                    <button
                      onClick={() => setIsAddRoomOpen(true)}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Room Pertama</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ROLE & HAK AKSES */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <h4 className="text-xs font-bold text-emerald-400 mb-2">Hierarki Role Sistem</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {roleList.map((ro) => (
                    <div key={ro.id_role} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <p className="font-bold text-white mb-0.5">{ro.nama_role}</p>
                      <p className="text-[11px] text-slate-400">{ro.deskripsi}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Daftar Hak Akses Sistem ({permissionList.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {permissionList.map((pm) => (
                    <div key={pm.id_permission} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{pm.nama_permission}</span>
                        <code className="text-[10px] text-emerald-400 font-mono">{pm.id_permission}</code>
                      </div>
                      <p className="text-[11px] text-slate-400">{pm.deskripsi}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LOG AUDIT */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Catatan Aktivitas Pengguna (tb_user_activity_logs)
              </h4>
              <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar">
                {activityLogs.map((log) => (
                  <div
                    key={log.id_log}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">{log.user_name}</span>
                      <span className="text-slate-300 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        {log.activity}
                      </span>
                      {log.id_room && (
                        <span className="text-slate-400 text-[11px]">di room {log.id_room}</span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[10px]">
                      {formatRelativeDate(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PENGATURAN KONEKSI GAS */}
          {activeTab === 'conn' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Settings className="w-4 h-4" />
                  <span>Konfigurasi Google Apps Script Web App URL</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Masukkan Web App URL hasil deployment Google Apps Script Anda (format: <code>https://script.google.com/macros/s/.../exec</code>). Jika dikosongkan, aplikasi akan secara otomatis beralih ke <strong>Spreadsheet Simulator</strong> internal.
                </p>

                <div>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    value={customGasUrl}
                    onChange={(e) => setCustomGasUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {connStatus && (
                  <div className="text-xs text-emerald-400 font-medium">
                    {connStatus}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomGasUrl('');
                      GasClient.setBaseUrl('');
                      setConnStatus('Mode beralih ke Spreadsheet Simulator.');
                    }}
                    className="px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/10"
                  >
                    Gunakan Simulator Lokal
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveGasUrl}
                    className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500 shadow"
                  >
                    Simpan & Hubungkan
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};
