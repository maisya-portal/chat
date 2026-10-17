export interface DirectChatPartner {
  id_user: string;
  nama: string;
  username: string;
  foto_url?: string;
  role_id: string;
  role_nama?: string;
  status_aktif?: boolean;
}

export interface DirectConversation {
  id_room: string;
  partner: DirectChatPartner;
  last_message?: {
    content: string;
    message_type: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
  updated_at?: string;
}

export interface Room {
  id_room: string;
  nama_room: string;
  deskripsi: string;
  kode_room?: string;
  foto_url?: string;
  created_by: string;
  status_aktif: boolean;
  membutuhkan_kode: boolean;
  is_joined?: boolean;
  member_count?: number;
  is_direct?: boolean;
  direct_partner?: DirectChatPartner;
  created_at: string;
  updated_at?: string;
}

export interface RoomMember {
  id_member: string;
  id_room: string;
  id_user: string;
  nama: string;
  username: string;
  foto_url?: string;
  role_nama: string;
  joined_at: string;
  status: 'active' | 'kicked' | 'left';
}

export interface RoomPermission {
  id_room: string;
  permission_name: string;
  is_allowed: boolean;
}

