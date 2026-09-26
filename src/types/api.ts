import { User, Role } from './user';
import { Room, RoomMember } from './room';
import { Message, MessageRevision } from './message';
import { Permission, PermissionMap } from './permission';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  [key: string]: any;
}

export interface LoginResponseData {
  token: string;
  user: User;
  permissions: PermissionMap;
}

export interface ScreenShareSession {
  id_session: string;
  id_room: string;
  id_user: string;
  presenter_name?: string;
  presenter_foto?: string;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'ended';
}

export interface ActivityLog {
  id_log: string;
  id_user: string;
  user_name: string;
  activity: string;
  id_room?: string;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRooms: number;
  totalMessages: number;
  totalImages: number;
}
