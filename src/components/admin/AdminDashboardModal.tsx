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
  AlertCircle
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

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

  // Create User State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newKode, setNewKode] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('ROLE_PESERTA');
  const [newFoto, setNewFoto] = useState('');

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newKode || !newUsername) return;

    const res = await GasClient.createUser({
      nama: newNama,
      kodeLogin: newKode,
      username: newUsername,
      roleId: newRole,
      fotoUrl: newFoto || undefined
    });

    if (res.success) {
      setIsAddUserOpen(false);
      setNewNama('');
      setNewKode('');
      setNewUsername('');
      setNewFoto('');
      loadData();
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
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

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
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
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Persetujuan Pendaftaran Akun ({pendingUsers.length})</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    User yang mendaftar online harus disetujui oleh Admin (<span className="text-emerald-400 font-mono">iftahadmin</span>) sebelum dapat login ke ruang chat.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Segarkan</span>
                </button>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-slate-800/20 border border-slate-700/40 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-white">Semua Pendaftaran Telah Diproses</h5>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Tidak ada antrian pendaftaran pengguna baru yang menunggu persetujuan saat ini.
                  </p>
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
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Daftar Pengguna ({userList.length})
                </h4>
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Pengguna</span>
                </button>
              </div>

              {isAddUserOpen && (
                <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-500/40 space-y-3 animate-fade-in">
                  <h5 className="text-xs font-bold text-emerald-400">Tambah Akun Baru</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nama Lengkap *"
                      value={newNama}
                      onChange={(e) => setNewNama(e.target.value)}
                      required
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Kode Login *"
                      value={newKode}
                      onChange={(e) => setNewKode(e.target.value)}
                      required
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase"
                    />
                    <input
                      type="text"
                      placeholder="Username *"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="ROLE_SUPERADMIN">Super Admin</option>
                      <option value="ROLE_ADMIN">Admin</option>
                      <option value="ROLE_MUSYRIF">Musyrif / Asatidzah</option>
                      <option value="ROLE_STAFF">Staff TU / Sarpras</option>
                      <option value="ROLE_PESERTA">Peserta / Santri</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500"
                    >
                      Simpan ke Spreadsheet
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {userList.map((u) => (
                  <div
                    key={u.id_user}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={u.foto_url} name={u.nama} size="sm" isOnline={u.status_aktif} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{u.nama}</p>
                          <Badge roleId={u.role_id} size="sm" />
                          {u.approval_status === 'pending' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Menunggu Izin
                            </span>
                          )}
                          {u.approval_status === 'rejected' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Ditolak
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">@{u.username} • ID: {u.id_user}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {u.approval_status === 'pending' && (
                        <button
                          onClick={() => handleApprove(u.id_user, u.role_id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer"
                          title="Beri Izin / Setujui"
                        >
                          <Check className="w-3 h-3" />
                          <span>Setujui</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleStatus(u.id_user)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          u.status_aktif
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-400'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {u.status_aktif ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{u.status_aktif ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MANAJEMEN ROOM */}
          {activeTab === 'rooms' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Daftar Room Percakapan ({roomList.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                {roomList.map((r) => (
                  <div
                    key={r.id_room}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3"
                  >
                    <img
                      src={r.foto_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'}
                      alt={r.nama_room}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h5 className="text-xs font-bold text-white truncate">{r.nama_room}</h5>
                        {r.membutuhkan_kode && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                            LOCK
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {r.deskripsi}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-500">
                        <span>ID: {r.id_room}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
