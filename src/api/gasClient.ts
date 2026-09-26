/**
 * ============================================================================
 * MAISYA CHAT ROOM - GOOGLE APPS SCRIPT API CLIENT (DUAL-MODE)
 * ============================================================================
 * Menghubungkan antarmuka ke Google Apps Script Web App asli jika URL terkonfigurasi,
 * atau beralih secara cerdas ke Mock Spreadsheet Backend jika berjalan dalam mode pengujian lokal.
 */

import { MockSpreadsheetBackend } from './mockBackend';
import { ApiResponse } from '../types/api';
import { Room } from '../types/room';

const CUSTOM_GAS_URL_KEY = 'maisya_custom_gas_url';

export class GasClient {
  static getBaseUrl(): string {
    const custom = localStorage.getItem(CUSTOM_GAS_URL_KEY);
    if (custom && custom.trim() !== '') return custom.trim();
    return (import.meta.env.VITE_GAS_API_URL || '').trim();
  }

  static setBaseUrl(url: string): void {
    if (!url || url.trim() === '') {
      localStorage.removeItem(CUSTOM_GAS_URL_KEY);
    } else {
      localStorage.setItem(CUSTOM_GAS_URL_KEY, url.trim());
    }
  }

  static isMockMode(): boolean {
    const url = this.getBaseUrl();
    return !url || !url.startsWith('http');
  }

  private static async request<T = any>(action: string, payload: any = {}, method: 'GET' | 'POST' = 'POST'): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl();

    if (this.isMockMode()) {
      return this.dispatchMock(action, payload);
    }

    try {
      if (method === 'GET') {
        const query = new URLSearchParams({ action, ...payload }).toString();
        const res = await fetch(`${baseUrl}?${query}`);
        return await res.json();
      } else {
        const res = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8' // Hindari masalah preflight CORS yang ketat di GAS
          },
          body: JSON.stringify({ action, ...payload })
        });
        return await res.json();
      }
    } catch (err: any) {
      console.warn(`[GAS Client Error: ${action}] Mengalihkan ke Simulator Spreadsheet Lokal:`, err);
      // Fallback ke simulator lokal jika request jaringan Google Apps Script gagal
      return this.dispatchMock(action, payload);
    }
  }

  private static dispatchMock(action: string, p: any): any {
    switch (action) {
      case 'login':
        return MockSpreadsheetBackend.login(p.nama, p.kode_login);
      case 'validateSession':
        return MockSpreadsheetBackend.validateSession(p.token);
      case 'getRooms':
        return MockSpreadsheetBackend.getRooms(p.userId);
      case 'createRoom':
        return MockSpreadsheetBackend.createRoom(p.namaRoom, p.deskripsi, p.kodeRoom, p.membutuhkanKode, p.fotoUrl, p.userId);
      case 'deleteRoom':
        return MockSpreadsheetBackend.deleteRoom(p.roomId, p.userId);
      case 'updateRoom':
        return MockSpreadsheetBackend.updateRoom(p.roomId, p.data, p.userId);
      case 'toggleRoomLock':
        return MockSpreadsheetBackend.toggleRoomLock(p.roomId, p.userId, p.newKode);
      case 'joinRoom':
        return MockSpreadsheetBackend.joinRoom(p.roomId, p.userId, p.kodeRoom);
      case 'leaveRoom':
        return MockSpreadsheetBackend.leaveRoom(p.roomId, p.userId);
      case 'getRoomMembers':
        return MockSpreadsheetBackend.getRoomMembers(p.roomId);
      case 'removeRoomMember':
        return MockSpreadsheetBackend.removeRoomMember(p.roomId, p.targetUserId, p.currentUserId || 'USR_ADMIN');
      case 'getMessages':
        return MockSpreadsheetBackend.getMessages(p.roomId);
      case 'getLatestMessages':
        return MockSpreadsheetBackend.getLatestMessages(p.roomId, p.sinceTimestamp);
      case 'sendMessage':
        return MockSpreadsheetBackend.sendMessage(p.roomId, p.userId, p.content, p.replyToId);
      case 'sendImageMessage':
        return MockSpreadsheetBackend.sendImageMessage(p.roomId, p.userId, p.base64Data, p.fileName, p.caption);
      case 'editMessage':
        return MockSpreadsheetBackend.editMessage(p.messageId, p.userId, p.newContent);
      case 'deleteMessage':
        return MockSpreadsheetBackend.deleteMessage(p.messageId, p.userId);
      case 'getMessageRevisions':
        return MockSpreadsheetBackend.getMessageRevisions(p.messageId);
      case 'createScreenShareSession':
        return MockSpreadsheetBackend.createScreenShareSession(p.roomId, p.userId);
      case 'endScreenShareSession':
        return MockSpreadsheetBackend.endScreenShareSession(p.sessionId);
      case 'getActiveScreenShareSession':
        return MockSpreadsheetBackend.getActiveScreenShareSession(p.roomId);
      case 'getUsers':
        return MockSpreadsheetBackend.getUsers();
      case 'getPendingUsers':
        return MockSpreadsheetBackend.getPendingUsers();
      case 'checkUserStatus':
        return MockSpreadsheetBackend.checkUserStatus(p.identifier);
      case 'registerUser':
        return MockSpreadsheetBackend.registerUser(p);
      case 'approveUser':
        return MockSpreadsheetBackend.approveUser(p.userId, p.roleId);
      case 'rejectUser':
        return MockSpreadsheetBackend.rejectUser(p.userId, p.reason);
      case 'createUser':
        return MockSpreadsheetBackend.createUser(p.nama, p.kodeLogin, p.username, p.roleId, p.fotoUrl);
      case 'updateUser':
        return MockSpreadsheetBackend.updateUser(p.userId, p.data || p);
      case 'updateProfile':
        return MockSpreadsheetBackend.updateProfile(p.userId, p.data || p);
      case 'deleteUser':
        return MockSpreadsheetBackend.deleteUser(p.userId);
      case 'toggleUserStatus':
        return MockSpreadsheetBackend.toggleUserStatus(p.userId);
      case 'getRoles':
        return MockSpreadsheetBackend.getRoles();
      case 'getPermissions':
        return MockSpreadsheetBackend.getPermissions();
      case 'getDashboardStats':
        return MockSpreadsheetBackend.getDashboardStats();
      case 'getActivityLogs':
        return MockSpreadsheetBackend.getActivityLogs(p.limit);
      default:
        return { success: false, error: `Action '${action}' tidak dikenali di mock dispatcher.` };
    }
  }

  // --- Public API Methods ---

  static async login(nama: string, kodeLogin: string) {
    return this.request('login', { nama, kode_login: kodeLogin });
  }

  static async logout(token?: string) {
    return this.request('logout', { token });
  }

  static async validateSession(token: string) {
    return this.request('validateSession', { token }, 'GET');
  }

  static async getRooms(userId: string, token?: string) {
    return this.request('getRooms', { userId, token }, 'GET');
  }

  static async createRoom(data: { namaRoom: string; deskripsi?: string; kodeRoom?: string; membutuhkanKode?: boolean; fotoUrl?: string; userId: string; token?: string }) {
    return this.request('createRoom', data);
  }

  static async deleteRoom(roomId: string, userId: string, token?: string) {
    return this.request('deleteRoom', { roomId, userId, token });
  }

  static async updateRoom(roomId: string, data: Partial<Room>, userId: string, token?: string) {
    return this.request('updateRoom', { roomId, data, userId, token });
  }

  static async toggleRoomLock(roomId: string, userId: string, newKode?: string, token?: string) {
    return this.request('toggleRoomLock', { roomId, userId, newKode, token });
  }

  static async joinRoom(roomId: string, userId: string, kodeRoom?: string, token?: string) {
    return this.request('joinRoom', { roomId, userId, kodeRoom, token });
  }

  static async leaveRoom(roomId: string, userId: string, token?: string) {
    return this.request('leaveRoom', { roomId, userId, token });
  }

  static async getRoomMembers(roomId: string, token?: string) {
    return this.request('getRoomMembers', { roomId, token }, 'GET');
  }

  static async removeRoomMember(roomId: string, targetUserId: string, token?: string) {
    return this.request('removeRoomMember', { roomId, targetUserId, token });
  }

  static async getMessages(roomId: string, limit?: number, beforeTimestamp?: string, token?: string) {
    return this.request('getMessages', { roomId, limit, beforeTimestamp, token }, 'GET');
  }

  static async getLatestMessages(roomId: string, sinceTimestamp?: string, token?: string) {
    return this.request('getLatestMessages', { roomId, sinceTimestamp, token }, 'GET');
  }

  static async sendMessage(roomId: string, userId: string, content: string, replyToId?: string, token?: string) {
    return this.request('sendMessage', { roomId, userId, content, replyToId, token });
  }

  static async sendImageMessage(roomId: string, userId: string, base64Data: string, fileName: string, mimeType: string, caption?: string, token?: string) {
    return this.request('sendImageMessage', { roomId, userId, base64Data, fileName, mimeType, caption, token });
  }

  static async editMessage(messageId: string, userId: string, newContent: string, token?: string) {
    return this.request('editMessage', { messageId, userId, newContent, token });
  }

  static async deleteMessage(messageId: string, userId: string, token?: string) {
    return this.request('deleteMessage', { messageId, userId, token });
  }

  static async getMessageRevisions(messageId: string, token?: string) {
    return this.request('getMessageRevisions', { messageId, token }, 'POST');
  }

  static async createScreenShareSession(roomId: string, userId: string, token?: string) {
    return this.request('createScreenShareSession', { roomId, userId, token });
  }

  static async endScreenShareSession(sessionId: string, token?: string) {
    return this.request('endScreenShareSession', { sessionId, token });
  }

  static async getActiveScreenShareSession(roomId: string) {
    return this.request('getActiveScreenShareSession', { roomId }, 'GET');
  }

  static async getUsers(token?: string) {
    return this.request('getUsers', { token }, 'GET');
  }

  static async getPendingUsers(token?: string) {
    return this.request('getPendingUsers', { token }, 'GET');
  }

  static async registerUser(data: { nama: string; username: string; kodeLogin: string; roleId?: string; noWa?: string; keterangan?: string }) {
    return this.request('registerUser', data);
  }

  static async checkUserStatus(identifier: string) {
    return this.request('checkUserStatus', { identifier }, 'GET');
  }

  static async approveUser(userId: string, roleId?: string, token?: string) {
    return this.request('approveUser', { userId, roleId, token });
  }

  static async rejectUser(userId: string, reason?: string, token?: string) {
    return this.request('rejectUser', { userId, reason, token });
  }

  static async createUser(data: { nama: string; kodeLogin: string; username: string; roleId: string; fotoUrl?: string; token?: string }) {
    return this.request('createUser', data);
  }

  static async updateUser(userId: string, data: {
    nama?: string;
    username?: string;
    kodeLogin?: string;
    roleId?: string;
    statusAktif?: boolean;
    noWa?: string;
    keterangan?: string;
    fotoUrl?: string;
    token?: string;
  }) {
    return this.request('updateUser', { userId, data });
  }

  static async deleteUser(userId: string, token?: string) {
    return this.request('deleteUser', { userId, token });
  }

  static async updateProfile(userId: string, data: {
    nama?: string;
    fotoUrl?: string;
    noWa?: string;
    keterangan?: string;
    kodeLogin?: string;
    token?: string;
  }) {
    return this.request('updateProfile', { userId, data });
  }

  static async toggleUserStatus(userId: string, token?: string) {
    return this.request('toggleUserStatus', { userId, token });
  }

  static async getRoles(token?: string) {
    return this.request('getRoles', { token }, 'GET');
  }

  static async getPermissions(token?: string) {
    return this.request('getPermissions', { token }, 'GET');
  }

  static async getDashboardStats(token?: string) {
    return this.request('getDashboardStats', { token }, 'GET');
  }

  static async getActivityLogs(limit?: number, token?: string) {
    return this.request('getActivityLogs', { limit, token }, 'GET');
  }
}
