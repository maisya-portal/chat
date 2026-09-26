export type RoleId = 
  | 'ROLE_SUPERADMIN' 
  | 'ROLE_ADMIN' 
  | 'ROLE_STAFF' 
  | 'ROLE_MUSYRIF' 
  | 'ROLE_PESERTA';

export interface User {
  id_user: string;
  nama: string;
  username: string;
  role_id: RoleId;
  role_nama?: string;
  status_aktif: boolean;
  foto_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Role {
  id_role: RoleId;
  nama_role: string;
  deskripsi: string;
  status_aktif: boolean;
}

export interface UserPermissionOverride {
  id_user: string;
  id_permission: string;
  is_allowed: boolean;
}
