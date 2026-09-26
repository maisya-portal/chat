export type PermissionKey =
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_permissions'
  | 'create_room'
  | 'edit_room'
  | 'delete_room'
  | 'join_room'
  | 'send_message'
  | 'send_image'
  | 'edit_own_message'
  | 'delete_own_message'
  | 'edit_any_message'
  | 'delete_any_message'
  | 'copy_message'
  | 'remove_participant'
  | 'screen_share'
  | 'manage_room_settings';

export interface Permission {
  id_permission: PermissionKey;
  nama_permission: string;
  deskripsi: string;
}

export type PermissionMap = Record<PermissionKey | string, boolean>;
