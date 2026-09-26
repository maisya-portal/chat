export type MessageType = 'text' | 'image' | 'system';

export interface Message {
  id_message: string;
  id_room: string;
  id_user: string;
  nama_pengirim?: string;
  foto_pengirim?: string;
  message_type: MessageType;
  content: string;
  file_id?: string;
  file_url?: string;
  file_name?: string;
  reply_to_id?: string;
  reply_message?: {
    id_message: string;
    nama_pengirim: string;
    content: string;
  };
  is_edited?: boolean;
  is_deleted?: boolean;
  status?: 'sending' | 'sent' | 'error';
  created_at: string;
  updated_at?: string;
}

export interface MessageRevision {
  id_revision: string;
  id_message: string;
  old_content: string;
  edited_by_name: string;
  edited_at: string;
}
