/**
 * ============================================================================
 * MAISYA CHAT ROOM - LOCAL SPREADSHEET BACKEND SIMULATOR (MOCK ENGINE)
 * ============================================================================
 * Simulator database Google Spreadsheet DB_MAISYA_CHAT & Google Apps Script
 * dengan persistensi localStorage. Menjamin seluruh fitur dapat langsung diuji
 * dan diverifikasi secara lokal maupun sebelum/sesudah deployment Google Apps Script.
 */

import { User, Role } from '../types/user';
import { Room, RoomMember } from '../types/room';
import { Message, MessageRevision } from '../types/message';
import { Permission, PermissionKey } from '../types/permission';
import { ActivityLog, DashboardStats, ScreenShareSession } from '../types/api';

const STORAGE_PREFIX = 'maisya_db_';

function getStore<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch (e) {
    return defaultData;
  }
}

function setStore<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}

// Data Awal (Seeds)
const INITIAL_ROLES: Role[] = [
  { id_role: 'ROLE_SUPERADMIN', nama_role: 'Super Admin', deskripsi: 'Akses kendali penuh sistem Maisya', status_aktif: true },
  { id_role: 'ROLE_ADMIN', nama_role: 'Admin', deskripsi: 'Pengelola operasional pengguna & room', status_aktif: true },
  { id_role: 'ROLE_STAFF', nama_role: 'Staff TU / Sarpras', deskripsi: 'Staff administrasi & operasional', status_aktif: true },
  { id_role: 'ROLE_MUSYRIF', nama_role: 'Musyrif / Asatidzah', deskripsi: 'Pembimbing santri & pemateri', status_aktif: true },
  { id_role: 'ROLE_PESERTA', nama_role: 'Peserta / Santri', deskripsi: 'Peserta halaqah & santri', status_aktif: true },
];

const INITIAL_PERMISSIONS: Permission[] = [
  { id_permission: 'view_dashboard', nama_permission: 'Lihat Dashboard Admin', deskripsi: 'Membuka panel administrasi' },
  { id_permission: 'manage_users', nama_permission: 'Kelola Pengguna', deskripsi: 'Tambah/edit pengguna dan kode login' },
  { id_permission: 'manage_roles', nama_permission: 'Kelola Role', deskripsi: 'Ubah role pengguna' },
  { id_permission: 'manage_permissions', nama_permission: 'Kelola Permission', deskripsi: 'Ubah override izin user' },
  { id_permission: 'create_room', nama_permission: 'Buat Room Baru', deskripsi: 'Membuat room percakapan' },
  { id_permission: 'edit_room', nama_permission: 'Edit Room', deskripsi: 'Mengubah nama dan kode room' },
  { id_permission: 'delete_room', nama_permission: 'Hapus Room', deskripsi: 'Menghapus/menonaktifkan room' },
  { id_permission: 'join_room', nama_permission: 'Bergabung Room', deskripsi: 'Masuk ke room percakapan' },
  { id_permission: 'send_message', nama_permission: 'Kirim Pesan Teks', deskripsi: 'Mengirim teks ke chat room' },
  { id_permission: 'send_image', nama_permission: 'Kirim Gambar', deskripsi: 'Mengunggah dan membagikan gambar' },
  { id_permission: 'edit_own_message', nama_permission: 'Edit Pesan Sendiri', deskripsi: 'Mengedit teks pesan milik sendiri' },
  { id_permission: 'delete_own_message', nama_permission: 'Hapus Pesan Sendiri', deskripsi: 'Menghapus pesan milik sendiri' },
  { id_permission: 'edit_any_message', nama_permission: 'Edit Semua Pesan', deskripsi: 'Moderator mengedit pesan siapapun' },
  { id_permission: 'delete_any_message', nama_permission: 'Hapus Semua Pesan', deskripsi: 'Moderator menghapus pesan siapapun' },
  { id_permission: 'copy_message', nama_permission: 'Salin Pesan', deskripsi: 'Menyalin teks ke clipboard' },
  { id_permission: 'remove_participant', nama_permission: 'Keluarkan Peserta', deskripsi: 'Kick anggota dari room' },
  { id_permission: 'screen_share', nama_permission: 'Berbagi Layar', deskripsi: 'Memulai sesi WebRTC screen share' },
  { id_permission: 'manage_room_settings', nama_permission: 'Pengaturan Room', deskripsi: 'Atur izin ruang percakapan' }
];

interface RawUser extends User {
  kode_login: string;
}

const INITIAL_USERS: RawUser[] = [
  {
    id_user: 'USR_ADMIN_IFTAH',
    nama: 'iftahadmin',
    kode_login: 'iftah010387',
    username: 'iftahadmin',
    role_id: 'ROLE_SUPERADMIN',
    status_aktif: true,
    approval_status: 'approved',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id_user: 'USR_PENDING_ZAID',
    nama: 'Zaid bin Haritsah',
    kode_login: 'zaid12345',
    username: 'zaid_santri',
    role_id: 'ROLE_PESERTA',
    status_aktif: false,
    approval_status: 'pending',
    no_wa: '081234567890',
    keterangan: 'Santri Baru Kelas 10 Tahfidz Al-Quran',
    foto_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Zaid%20bin%20Haritsah',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id_user: 'USR_PENDING_SALMAN',
    nama: 'Ustadz Salman Al-Farisi',
    kode_login: 'salman123',
    username: 'salman_musyrif',
    role_id: 'ROLE_MUSYRIF',
    status_aktif: false,
    approval_status: 'pending',
    no_wa: '085712345678',
    keterangan: 'Musyrif Pembina Asrama Putra',
    foto_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Salman%20Al-Farisi',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

export function getUsersStore(): RawUser[] {
  let users = getStore<RawUser[]>('tb_users', INITIAL_USERS);

  // Bersihkan data akun demo lama bawaan
  users = users.filter(u => 
    u.id_user !== 'USR_ADMIN' && 
    u.id_user !== 'USR_FAUZI' && 
    u.id_user !== 'USR_STAFF_TU' && 
    u.id_user !== 'USR_SANTRI_ZAID' &&
    u.kode_login !== 'ADMIN2026' &&
    u.kode_login !== 'ISB2026' &&
    u.kode_login !== 'TU2026' &&
    u.kode_login !== 'SANTRI2026'
  );

  // Pastikan akun utama iftahadmin selalu aktif dan memiliki password iftah010387
  let admin = users.find(u => 
    u.username?.toLowerCase() === 'iftahadmin' || 
    u.nama?.toLowerCase() === 'iftahadmin'
  );

  if (!admin) {
    admin = {
      id_user: 'USR_ADMIN_IFTAH',
      nama: 'iftahadmin',
      kode_login: 'iftah010387',
      username: 'iftahadmin',
      role_id: 'ROLE_SUPERADMIN',
      status_aktif: true,
      approval_status: 'approved',
      foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    };
    users.unshift(admin);
  } else {
    admin.kode_login = 'iftah010387';
    admin.role_id = 'ROLE_SUPERADMIN';
    admin.status_aktif = true;
    admin.approval_status = 'approved';
  }

  // Jika hanya ada admin, tambahkan contoh pendaftar baru agar admin langsung bisa melihat dan menguji sistem approval
  const hasPending = users.some(u => u.approval_status === 'pending');
  if (!hasPending && users.length <= 1) {
    users.push(
      {
        id_user: 'USR_PENDING_ZAID',
        nama: 'Zaid bin Haritsah',
        kode_login: 'zaid12345',
        username: 'zaid_santri',
        role_id: 'ROLE_PESERTA',
        status_aktif: false,
        approval_status: 'pending',
        no_wa: '081234567890',
        keterangan: 'Santri Baru Kelas 10 Tahfidz Al-Quran',
        foto_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Zaid%20bin%20Haritsah',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id_user: 'USR_PENDING_SALMAN',
        nama: 'Ustadz Salman Al-Farisi',
        kode_login: 'salman123',
        username: 'salman_musyrif',
        role_id: 'ROLE_MUSYRIF',
        status_aktif: false,
        approval_status: 'pending',
        no_wa: '085712345678',
        keterangan: 'Musyrif Pembina Asrama Putra',
        foto_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Salman%20Al-Farisi',
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    );
  }

  setStore('tb_users', users);
  return users;
}

const INITIAL_ROOMS: Room[] = [
  {
    id_room: 'ROOM_PENGUMUMAN',
    nama_room: 'Pengumuman Resmi Pesantren',
    deskripsi: 'Kanal resmi maklumat pimpinan pondok, agenda pesantren, dan informasi akademik.',
    foto_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    created_by: 'USR_ADMIN_IFTAH',
    status_aktif: true,
    membutuhkan_kode: false,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id_room: 'ROOM_MUSYRIF',
    nama_room: 'Forum Musyrif & Asatidzah',
    deskripsi: 'Koordinasi harian pembina asrama, evaluasi ibadah santri, dan disiplin kesantrian.',
    kode_room: 'MUSYRIF26',
    foto_url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=150&auto=format&fit=crop&q=80',
    created_by: 'USR_ADMIN_IFTAH',
    status_aktif: true,
    membutuhkan_kode: true,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  }
];

const INITIAL_MEMBERS: RoomMember[] = [
  { id_member: 'MBR_001', id_room: 'ROOM_PENGUMUMAN', id_user: 'USR_ADMIN_IFTAH', nama: 'iftahadmin', username: 'iftahadmin', role_nama: 'Super Admin', joined_at: new Date(Date.now() - 86400000).toISOString(), status: 'active' },
  { id_member: 'MBR_002', id_room: 'ROOM_MUSYRIF', id_user: 'USR_ADMIN_IFTAH', nama: 'iftahadmin', username: 'iftahadmin', role_nama: 'Super Admin', joined_at: new Date(Date.now() - 86400000).toISOString(), status: 'active' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id_message: 'MSG_001',
    id_room: 'ROOM_PENGUMUMAN',
    id_user: 'USR_ADMIN_IFTAH',
    nama_pengirim: 'iftahadmin',
    foto_pengirim: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    message_type: 'text',
    content: "Assalamu'alaikum Warahmatullahi Wabarakatuh. Ahlan wa Sahlan di Maisya Chat Room Pesantren Imam Syafi'i Brebes. Akun Admin resmi: iftahadmin.",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'sent'
  }
];

export class MockSpreadsheetBackend {
  static getEffectivePermissions(userId: string, roleId: string): Record<string, boolean> {
    const allPerms = INITIAL_PERMISSIONS.map(p => p.id_permission);
    const result: Record<string, boolean> = {};

    if (roleId === 'ROLE_SUPERADMIN') {
      allPerms.forEach(p => { result[p] = true; });
      return result;
    }

    if (roleId === 'ROLE_ADMIN') {
      allPerms.forEach(p => {
        result[p] = (p !== 'manage_roles');
      });
      return result;
    }

    if (roleId === 'ROLE_MUSYRIF') {
      const allowed = ['join_room', 'send_message', 'send_image', 'edit_own_message', 'delete_own_message', 'copy_message', 'screen_share'];
      allPerms.forEach(p => { result[p] = allowed.includes(p); });
      return result;
    }

    // Default for Staff and Peserta
    const standard = ['join_room', 'send_message', 'send_image', 'edit_own_message', 'delete_own_message', 'copy_message'];
    allPerms.forEach(p => { result[p] = standard.includes(p); });
    return result;
  }

  static login(nama: string, kodeLogin: string) {
    const users = getUsersStore();
    const cleanNama = nama.trim().toLowerCase();
    const cleanCode = kodeLogin.trim();

    const user = users.find(u => 
      u.nama.toLowerCase() === cleanNama || 
      u.username.toLowerCase() === cleanNama
    );

    if (!user) {
      return { 
        success: false, 
        error: `Pengguna "${nama}" belum terdaftar. Silakan klik "Daftar Akun Baru".` 
      };
    }

    // Cek status persetujuan (approval) oleh admin
    if (user.approval_status === 'pending') {
      return { 
        success: false, 
        error: 'Pendaftaran akun Anda masih MENUNGGU PERSETUJUAN (Approval) dari Admin (iftahadmin). Silakan hubungi admin untuk aktivasi.' 
      };
    }

    if (user.approval_status === 'rejected') {
      return { 
        success: false, 
        error: 'Pendaftaran akun Anda ditolak oleh Admin. Silakan hubungi admin pesantren.' 
      };
    }

    if (!user.status_aktif) {
      return { success: false, error: 'Akun Anda dinonaktifkan oleh administrator.' };
    }

    if (user.kode_login !== cleanCode) {
      return { success: false, error: 'Password / Kode login tidak valid.' };
    }

    const token = `MOCK_SESSION_${user.id_user}_${Date.now()}`;
    const permissions = this.getEffectivePermissions(user.id_user, user.role_id);

    this.logActivity(user.id_user, 'LOGIN', undefined);

    const safeUser: User = {
      id_user: user.id_user,
      nama: user.nama,
      username: user.username,
      role_id: user.role_id,
      status_aktif: user.status_aktif,
      approval_status: user.approval_status || 'approved',
      no_wa: user.no_wa,
      keterangan: user.keterangan,
      foto_url: user.foto_url,
      created_at: user.created_at
    };

    return {
      success: true,
      token,
      user: safeUser,
      permissions
    };
  }

  static validateSession(token: string) {
    if (!token || !token.startsWith('MOCK_SESSION_')) {
      return { success: false, error: 'Sesi tidak valid' };
    }
    const parts = token.split('_');
    const userId = parts[2] + (parts[3] ? '_' + parts[3] : '');
    const users = getUsersStore();
    const user = users.find(u => u.id_user === userId || token.includes(u.id_user));

    if (!user || !user.status_aktif || user.approval_status === 'pending' || user.approval_status === 'rejected') {
      return { success: false, error: 'Akun tidak aktif atau belum disetujui' };
    }

    const permissions = this.getEffectivePermissions(user.id_user, user.role_id);
    const safeUser: User = {
      id_user: user.id_user,
      nama: user.nama,
      username: user.username,
      role_id: user.role_id,
      status_aktif: user.status_aktif,
      foto_url: user.foto_url,
      created_at: user.created_at
    };

    return { success: true, user: safeUser, permissions };
  }

  static getRooms(userId: string) {
    const rooms = getStore<Room[]>('tb_rooms', INITIAL_ROOMS);
    const members = getStore<RoomMember[]>('tb_room_members', INITIAL_MEMBERS);

    const myRoomIds = new Set(
      members.filter(m => m.id_user === userId && m.status === 'active').map(m => m.id_room)
    );

    const result = rooms.filter(r => r.status_aktif).map(r => ({
      ...r,
      is_joined: myRoomIds.has(r.id_room),
      member_count: members.filter(m => m.id_room === r.id_room && m.status === 'active').length
    }));

    return { success: true, rooms: result };
  }

  static joinRoom(roomId: string, userId: string, kodeRoom?: string) {
    const rooms = getStore<Room[]>('tb_rooms', INITIAL_ROOMS);
    const room = rooms.find(r => r.id_room === roomId);
    if (!room) return { success: false, error: 'Room tidak ditemukan' };

    if (room.membutuhkan_kode && room.kode_room) {
      if (!kodeRoom || kodeRoom.trim().toUpperCase() !== room.kode_room.trim().toUpperCase()) {
        return { success: false, error: 'Kode room salah. Silakan periksa kembali kode Anda.' };
      }
    }

    const members = getStore<RoomMember[]>('tb_room_members', INITIAL_MEMBERS);
    const users = getUsersStore();
    const user = users.find(u => u.id_user === userId);

    const existingIdx = members.findIndex(m => m.id_room === roomId && m.id_user === userId);
    if (existingIdx >= 0) {
      if (members[existingIdx].status === 'kicked') {
        return { success: false, error: 'Anda telah dikeluarkan dari room ini oleh moderator.' };
      }
      members[existingIdx].status = 'active';
    } else {
      members.push({
        id_member: 'MBR_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        id_room: roomId,
        id_user: userId,
        nama: user ? user.nama : 'Pengguna',
        username: user ? user.username : '',
        foto_url: user ? user.foto_url : '',
        role_nama: user ? user.role_id : 'Peserta',
        joined_at: new Date().toISOString(),
        status: 'active'
      });
    }

    setStore('tb_room_members', members);
    this.logActivity(userId, 'JOIN_ROOM', roomId);
    return { success: true, message: `Berhasil bergabung ke dalam ${room.nama_room}` };
  }

  static leaveRoom(roomId: string, userId: string) {
    const members = getStore<RoomMember[]>('tb_room_members', INITIAL_MEMBERS);
    const updated = members.map(m => {
      if (m.id_room === roomId && m.id_user === userId) {
        return { ...m, status: 'left' as const };
      }
      return m;
    });
    setStore('tb_room_members', updated);
    this.logActivity(userId, 'LEAVE_ROOM', roomId);
    return { success: true, message: 'Anda telah keluar dari room.' };
  }

  static getRoomMembers(roomId: string) {
    const members = getStore<RoomMember[]>('tb_room_members', INITIAL_MEMBERS);
    const active = members.filter(m => m.id_room === roomId && m.status === 'active');
    return { success: true, members: active };
  }

  static removeRoomMember(roomId: string, targetUserId: string, currentUserId: string) {
    const members = getStore<RoomMember[]>('tb_room_members', INITIAL_MEMBERS);
    const updated = members.map(m => {
      if (m.id_room === roomId && m.id_user === targetUserId) {
        return { ...m, status: 'kicked' as const };
      }
      return m;
    });
    setStore('tb_room_members', updated);
    this.logActivity(currentUserId, `KICK_USER: ${targetUserId}`, roomId);
    return { success: true, message: 'Peserta berhasil dikeluarkan.' };
  }

  static createRoom(namaRoom: string, deskripsi: string, kodeRoom: string, membutuhkanKode: boolean, fotoUrl: string, userId: string) {
    const rooms = getStore<Room[]>('tb_rooms', INITIAL_ROOMS);
    const roomId = 'ROOM_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: Room = {
      id_room: roomId,
      nama_room: namaRoom.trim(),
      deskripsi: deskripsi || '',
      kode_room: kodeRoom ? kodeRoom.trim().toUpperCase() : '',
      membutuhkan_kode: membutuhkanKode,
      foto_url: fotoUrl || 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=150&auto=format&fit=crop&q=80',
      created_by: userId,
      status_aktif: true,
      created_at: new Date().toISOString()
    };

    rooms.push(newRoom);
    setStore('tb_rooms', rooms);

    // Otomatis join
    this.joinRoom(roomId, userId);
    this.logActivity(userId, `CREATE_ROOM: ${namaRoom}`, roomId);

    return { success: true, room: newRoom };
  }

  static deleteRoom(roomId: string, currentUserId: string) {
    let rooms = getStore<Room[]>('tb_rooms', INITIAL_ROOMS);
    const targetRoom = rooms.find(r => r.id_room === roomId);
    if (!targetRoom) {
      return { success: false, error: 'Room tidak ditemukan' };
    }

    // Hapus room dari tb_rooms
    rooms = rooms.filter(r => r.id_room !== roomId);
    setStore('tb_rooms', rooms);

    // Hapus anggota room dari tb_room_members
    let members = getStore<RoomMember[]>('tb_room_members', INITIAL_MEMBERS);
    members = members.filter(m => m.id_room !== roomId);
    setStore('tb_room_members', members);

    // Hapus pesan room dari tb_messages
    let messages = getStore<Message[]>('tb_messages', INITIAL_MESSAGES);
    messages = messages.filter(m => m.id_room !== roomId);
    setStore('tb_messages', messages);

    this.logActivity(currentUserId, `DELETE_ROOM: ${targetRoom.nama_room}`, roomId);
    return { success: true, message: `Room "${targetRoom.nama_room}" berhasil dihapus.` };
  }

  static updateRoom(roomId: string, data: Partial<Room>, currentUserId: string) {
    const rooms = getStore<Room[]>('tb_rooms', INITIAL_ROOMS);
    const idx = rooms.findIndex(r => r.id_room === roomId);
    if (idx === -1) {
      return { success: false, error: 'Room tidak ditemukan' };
    }

    const current = rooms[idx];
    const updated: Room = {
      ...current,
      nama_room: data.nama_room !== undefined ? data.nama_room.trim() : current.nama_room,
      deskripsi: data.deskripsi !== undefined ? data.deskripsi.trim() : current.deskripsi,
      membutuhkan_kode: data.membutuhkan_kode !== undefined ? data.membutuhkan_kode : current.membutuhkan_kode,
      kode_room: data.kode_room !== undefined ? data.kode_room.trim().toUpperCase() : current.kode_room,
      foto_url: data.foto_url !== undefined && data.foto_url.trim() !== '' ? data.foto_url.trim() : current.foto_url,
      updated_at: new Date().toISOString()
    };

    rooms[idx] = updated;
    setStore('tb_rooms', rooms);

    this.logActivity(currentUserId, `UPDATE_ROOM: ${updated.nama_room}`, roomId);
    return { success: true, room: updated, message: `Room "${updated.nama_room}" berhasil diperbarui.` };
  }

  static toggleRoomLock(roomId: string, currentUserId: string, newKode?: string) {
    const rooms = getStore<Room[]>('tb_rooms', INITIAL_ROOMS);
    const idx = rooms.findIndex(r => r.id_room === roomId);
    if (idx === -1) {
      return { success: false, error: 'Room tidak ditemukan' };
    }

    const current = rooms[idx];
    const willLock = !current.membutuhkan_kode;
    let kode = current.kode_room || '';

    if (willLock) {
      kode = newKode && newKode.trim() !== '' ? newKode.trim().toUpperCase() : (current.kode_room || 'MAISYA' + Math.floor(1000 + Math.random() * 9000));
    }

    rooms[idx] = {
      ...current,
      membutuhkan_kode: willLock,
      kode_room: kode,
      updated_at: new Date().toISOString()
    };
    setStore('tb_rooms', rooms);

    const actionText = willLock ? `LOCK_ROOM (Kode: ${kode})` : 'UNLOCK_ROOM (Publik)';
    this.logActivity(currentUserId, `${actionText}: ${current.nama_room}`, roomId);

    return {
      success: true,
      membutuhkan_kode: willLock,
      kode_room: kode,
      message: willLock 
        ? `Room "${current.nama_room}" berhasil dikunci dengan kode PIN: ${kode}`
        : `Kunci room "${current.nama_room}" berhasil dibuka (Room menjadi Publik)!`
    };
  }

  static getMessages(roomId: string) {
    const messages = getStore<Message[]>('tb_messages', INITIAL_MESSAGES);
    const roomMsgs = messages.filter(m => m.id_room === roomId);
    return { success: true, messages: roomMsgs };
  }

  static getLatestMessages(roomId: string, sinceTimestamp?: string) {
    const messages = getStore<Message[]>('tb_messages', INITIAL_MESSAGES);
    let msgs = messages.filter(m => m.id_room === roomId);
    if (sinceTimestamp) {
      msgs = msgs.filter(m => 
        (m.created_at && m.created_at > sinceTimestamp) ||
        (m.updated_at && m.updated_at > sinceTimestamp)
      );
    }
    return { success: true, messages: msgs };
  }

  static sendMessage(roomId: string, userId: string, content: string, replyToId?: string) {
    const messages = getStore<Message[]>('tb_messages', INITIAL_MESSAGES);
    const users = getUsersStore();
    const user = users.find(u => u.id_user === userId);

    let replyInfo: Message['reply_message'] | undefined;
    if (replyToId) {
      const target = messages.find(m => m.id_message === replyToId);
      if (target) {
        replyInfo = {
          id_message: target.id_message,
          nama_pengirim: target.nama_pengirim || 'Pengguna',
          content: target.content
        };
      }
    }

    const newMsg: Message = {
      id_message: 'MSG_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      id_room: roomId,
      id_user: userId,
      nama_pengirim: user ? user.nama : 'Pengguna',
      foto_pengirim: user ? user.foto_url : '',
      message_type: 'text',
      content: content.trim(),
      reply_to_id: replyToId,
      reply_message: replyInfo,
      created_at: new Date().toISOString(),
      status: 'sent'
    };

    messages.push(newMsg);
    setStore('tb_messages', messages);

    return { success: true, message: newMsg };
  }

  static sendImageMessage(roomId: string, userId: string, base64Data: string, fileName: string, caption?: string) {
    const messages = getStore<Message[]>('tb_messages', INITIAL_MESSAGES);
    const users = getUsersStore();
    const user = users.find(u => u.id_user === userId);

    const fileId = 'DRIVE_' + Math.random().toString(36).substring(2, 10);
    // Simpan base64 data URL langsung untuk mockup lokal
    const fileUrl = base64Data;

    const newMsg: Message = {
      id_message: 'MSG_IMG_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      id_room: roomId,
      id_user: userId,
      nama_pengirim: user ? user.nama : 'Pengguna',
      foto_pengirim: user ? user.foto_url : '',
      message_type: 'image',
      content: caption || '',
      file_id: fileId,
      file_url: fileUrl,
      file_name: fileName,
      created_at: new Date().toISOString(),
      status: 'sent'
    };

    messages.push(newMsg);
    setStore('tb_messages', messages);

    return { success: true, message: newMsg };
  }

  static editMessage(messageId: string, userId: string, newContent: string) {
    const messages = getStore<Message[]>('tb_messages', INITIAL_MESSAGES);
    const revisions = getStore<MessageRevision[]>('tb_message_revisions', []);
    const users = getUsersStore();
    const user = users.find(u => u.id_user === userId);

    const targetIdx = messages.findIndex(m => m.id_message === messageId);
    if (targetIdx < 0) return { success: false, error: 'Pesan tidak ditemukan' };

    const oldMsg = messages[targetIdx];
    const now = new Date().toISOString();

    revisions.push({
      id_revision: 'REV_' + Math.random().toString(36).substring(2, 8),
      id_message: messageId,
      old_content: oldMsg.content,
      edited_by_name: user ? user.nama : 'Moderator',
      edited_at: now
    });
    setStore('tb_message_revisions', revisions);

    messages[targetIdx] = {
      ...oldMsg,
      content: newContent.trim(),
      is_edited: true,
      updated_at: now
    };
    setStore('tb_messages', messages);

    return { success: true, message: 'Pesan berhasil diperbarui' };
  }

  static deleteMessage(messageId: string, userId: string) {
    const messages = getStore<Message[]>('tb_messages', INITIAL_MESSAGES);
    const targetIdx = messages.findIndex(m => m.id_message === messageId);
    if (targetIdx < 0) return { success: false, error: 'Pesan tidak ditemukan' };

    const now = new Date().toISOString();
    messages[targetIdx] = {
      ...messages[targetIdx],
      content: 'Pesan ini telah dihapus',
      is_deleted: true,
      updated_at: now
    };
    setStore('tb_messages', messages);

    return { success: true, message: 'Pesan telah dihapus (soft delete).' };
  }

  static getMessageRevisions(messageId: string) {
    const revisions = getStore<MessageRevision[]>('tb_message_revisions', []);
    const filtered = revisions.filter(r => r.id_message === messageId);
    return { success: true, revisions: filtered };
  }

  // Screen Sharing
  static createScreenShareSession(roomId: string, userId: string) {
    const sessions = getStore<ScreenShareSession[]>('tb_screen_share_sessions', []);
    const users = getUsersStore();
    const user = users.find(u => u.id_user === userId);

    // Tutup sesi aktif lain di room ini
    const now = new Date().toISOString();
    sessions.forEach(s => {
      if (s.id_room === roomId && s.status === 'active') {
        s.status = 'ended';
        s.ended_at = now;
      }
    });

    const newSession: ScreenShareSession = {
      id_session: 'SCR_' + Math.random().toString(36).substring(2, 9),
      id_room: roomId,
      id_user: userId,
      presenter_name: user ? user.nama : 'Pemateri',
      presenter_foto: user ? user.foto_url : '',
      started_at: now,
      status: 'active'
    };

    sessions.push(newSession);
    setStore('tb_screen_share_sessions', sessions);
    this.logActivity(userId, 'START_SCREEN_SHARE', roomId);

    return { success: true, session: newSession };
  }

  static endScreenShareSession(sessionId: string) {
    const sessions = getStore<ScreenShareSession[]>('tb_screen_share_sessions', []);
    const target = sessions.find(s => s.id_session === sessionId);
    if (target) {
      target.status = 'ended';
      target.ended_at = new Date().toISOString();
      setStore('tb_screen_share_sessions', sessions);
    }
    return { success: true, message: 'Sesi berakhir' };
  }

  static getActiveScreenShareSession(roomId: string) {
    const sessions = getStore<ScreenShareSession[]>('tb_screen_share_sessions', []);
    const active = sessions.find(s => s.id_room === roomId && s.status === 'active');
    if (!active) {
      return { success: true, is_active: false };
    }
    return { success: true, is_active: true, session: active };
  }

  // Admin Dashboard & User Management
  static getUsers() {
    const users = getUsersStore();
    const safeUsers = users.map(u => ({
      id_user: u.id_user,
      nama: u.nama,
      username: u.username,
      role_id: u.role_id,
      status_aktif: u.status_aktif,
      approval_status: u.approval_status || (u.status_aktif ? 'approved' : 'pending'),
      no_wa: u.no_wa,
      keterangan: u.keterangan,
      foto_url: u.foto_url,
      created_at: u.created_at,
      updated_at: u.updated_at
    }));
    return { success: true, users: safeUsers };
  }

  static getPendingUsers() {
    const res = this.getUsers();
    const pending = res.users.filter(u => u.approval_status === 'pending');
    return { success: true, users: pending };
  }

  static registerUser(payload: {
    nama: string;
    username: string;
    kodeLogin: string;
    roleId?: any;
    noWa?: string;
    keterangan?: string;
  }) {
    const users = getUsersStore();
    const cleanUsername = payload.username.trim().toLowerCase();
    const cleanNama = payload.nama.trim();

    if (!cleanNama || !cleanUsername || !payload.kodeLogin.trim()) {
      return { success: false, error: 'Nama, Username, dan Password wajib diisi.' };
    }

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `Username "${payload.username}" sudah digunakan. Silakan pilih username lain.` };
    }

    if (users.some(u => u.nama.toLowerCase() === cleanNama.toLowerCase())) {
      return { success: false, error: `Nama "${payload.nama}" sudah terdaftar.` };
    }

    const newUser: RawUser = {
      id_user: 'USR_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      nama: cleanNama,
      kode_login: payload.kodeLogin.trim(),
      username: cleanUsername,
      role_id: payload.roleId || 'ROLE_PESERTA',
      status_aktif: false, // Menunggu persetujuan admin
      approval_status: 'pending',
      no_wa: payload.noWa?.trim() || '',
      keterangan: payload.keterangan?.trim() || '',
      foto_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanNama)}`,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setStore('tb_users', users);
    this.logActivity('SYSTEM', 'USER_REGISTER', `Pendaftaran user baru: ${cleanNama} (@${cleanUsername})`);

    return {
      success: true,
      message: 'Pendaftaran berhasil dikirim! Akun Anda sedang menunggu persetujuan (approval) dari Admin (iftahadmin).'
    };
  }

  static approveUser(userId: string, roleId?: any) {
    const users = getUsersStore();
    const target = users.find(u => u.id_user === userId);
    if (!target) return { success: false, error: 'User tidak ditemukan' };

    target.approval_status = 'approved';
    target.status_aktif = true;
    if (roleId) target.role_id = roleId;
    target.updated_at = new Date().toISOString();

    setStore('tb_users', users);
    this.logActivity('USR_ADMIN_IFTAH', 'USER_APPROVE', `Menyetujui akun ${target.nama} (@${target.username})`);
    return { success: true, message: `Akun ${target.nama} berhasil disetujui & diaktifkan.` };
  }

  static rejectUser(userId: string, reason?: string) {
    const users = getUsersStore();
    const target = users.find(u => u.id_user === userId);
    if (!target) return { success: false, error: 'User tidak ditemukan' };

    target.approval_status = 'rejected';
    target.status_aktif = false;
    target.updated_at = new Date().toISOString();

    setStore('tb_users', users);
    this.logActivity('USR_ADMIN_IFTAH', 'USER_REJECT', `Menolak pendaftaran ${target.nama} (@${target.username})`);
    return { success: true, message: `Pendaftaran ${target.nama} telah ditolak.` };
  }

  static checkUserStatus(identifier: string) {
    const users = getUsersStore();
    const clean = identifier.trim().toLowerCase();
    const target = users.find(u => u.username.toLowerCase() === clean || u.nama.toLowerCase() === clean);
    if (!target) {
      return { success: false, error: `Pengguna "${identifier}" belum terdaftar. Silakan lakukan pendaftaran akun baru.` };
    }
    return {
      success: true,
      user: {
        id_user: target.id_user,
        nama: target.nama,
        username: target.username,
        role_id: target.role_id,
        approval_status: target.approval_status || (target.status_aktif ? 'approved' : 'pending'),
        status_aktif: target.status_aktif,
        no_wa: target.no_wa,
        created_at: target.created_at
      }
    };
  }

  static createUser(nama: string, kodeLogin: string, username: string, roleId: any, fotoUrl: string) {
    const users = getUsersStore();
    const newUser: RawUser = {
      id_user: 'USR_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      nama: nama.trim(),
      kode_login: kodeLogin.trim(),
      username: username.trim().toLowerCase(),
      role_id: roleId,
      status_aktif: true,
      approval_status: 'approved',
      foto_url: fotoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nama)}`,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    setStore('tb_users', users);
    return { success: true, message: 'Pengguna baru berhasil ditambahkan' };
  }

  static updateUser(userId: string, data: {
    nama?: string;
    username?: string;
    kodeLogin?: string;
    roleId?: any;
    statusAktif?: boolean;
    noWa?: string;
    keterangan?: string;
    fotoUrl?: string;
  }) {
    const users = getUsersStore();
    const target = users.find(u => u.id_user === userId);
    if (!target) return { success: false, error: 'User tidak ditemukan' };

    if (data.username && data.username.trim().toLowerCase() !== target.username.toLowerCase()) {
      const cleanUsername = data.username.trim().toLowerCase();
      if (users.some(u => u.id_user !== userId && u.username.toLowerCase() === cleanUsername)) {
        return { success: false, error: `Username "${data.username}" sudah digunakan pengguna lain.` };
      }
      target.username = cleanUsername;
    }

    if (data.nama && data.nama.trim()) {
      target.nama = data.nama.trim();
    }
    if (data.kodeLogin && data.kodeLogin.trim()) {
      target.kode_login = data.kodeLogin.trim();
    }
    if (data.roleId) {
      target.role_id = data.roleId;
    }
    if (typeof data.statusAktif === 'boolean') {
      target.status_aktif = data.statusAktif;
      if (data.statusAktif && target.approval_status !== 'approved') {
        target.approval_status = 'approved';
      }
    }
    if (typeof data.noWa === 'string') {
      target.no_wa = data.noWa.trim();
    }
    if (typeof data.keterangan === 'string') {
      target.keterangan = data.keterangan.trim();
    }
    if (data.fotoUrl !== undefined) {
      target.foto_url = data.fotoUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(target.nama)}`;
    }
    target.updated_at = new Date().toISOString();

    setStore('tb_users', users);
    this.logActivity('USR_ADMIN_IFTAH', 'USER_UPDATE', `Memperbarui data akun pengguna: ${target.nama} (@${target.username})`);
    return { success: true, message: `Data pengguna "${target.nama}" berhasil diperbarui!` };
  }

  static deleteUser(userId: string) {
    if (userId === 'USR_ADMIN_IFTAH' || userId.toLowerCase() === 'iftahadmin') {
      return { success: false, error: 'Akun Super Admin Utama (iftahadmin) tidak dapat dihapus demi keamanan sistem.' };
    }

    let users = getUsersStore();
    const target = users.find(u => u.id_user === userId);
    if (!target) return { success: false, error: 'User tidak ditemukan' };

    users = users.filter(u => u.id_user !== userId);
    setStore('tb_users', users);

    // Hapus juga keanggotaan room pengguna ini
    const members = getStore<RoomMember[]>('tb_members', []);
    const remainingMembers = members.filter(m => m.id_user !== userId);
    setStore('tb_members', remainingMembers);

    this.logActivity('USR_ADMIN_IFTAH', 'USER_DELETE', `Menghapus akun pengguna: ${target.nama} (@${target.username})`);
    return { success: true, message: `Pengguna "${target.nama}" berhasil dihapus secara permanen.` };
  }

  static toggleUserStatus(userId: string) {
    const users = getUsersStore();
    const target = users.find(u => u.id_user === userId);
    if (!target) return { success: false, error: 'User tidak ditemukan' };
    target.status_aktif = !target.status_aktif;
    if (target.status_aktif && target.approval_status !== 'approved') {
      target.approval_status = 'approved';
    }
    setStore('tb_users', users);
    return { success: true, status_aktif: target.status_aktif };
  }

  static getRoles() {
    return { success: true, roles: INITIAL_ROLES };
  }

  static getPermissions() {
    return { success: true, permissions: INITIAL_PERMISSIONS };
  }

  static getDashboardStats(): { success: boolean; stats: DashboardStats } {
    const users = getUsersStore();
    const rooms = getStore<Room[]>('tb_rooms', INITIAL_ROOMS);
    const messages = getStore<Message[]>('tb_messages', INITIAL_MESSAGES);

    return {
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status_aktif && u.approval_status === 'approved').length,
        totalRooms: rooms.length,
        totalMessages: messages.length,
        totalImages: messages.filter(m => m.message_type === 'image').length
      }
    };
  }

  static logActivity(userId: string, activity: string, roomId?: string) {
    const logs = getStore<ActivityLog[]>('tb_user_activity_logs', []);
    const users = getUsersStore();
    const user = users.find(u => u.id_user === userId);

    logs.unshift({
      id_log: 'LOG_' + Math.random().toString(36).substring(2, 8),
      id_user: userId,
      user_name: user ? user.nama : userId,
      activity: activity,
      id_room: roomId,
      created_at: new Date().toISOString()
    });

    // Batasi log maksimal 100
    if (logs.length > 100) logs.pop();
    setStore('tb_user_activity_logs', logs);
  }

  static getActivityLogs(limit = 30) {
    const logs = getStore<ActivityLog[]>('tb_user_activity_logs', []);
    return { success: true, logs: logs.slice(0, limit) };
  }
}
