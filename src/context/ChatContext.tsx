import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Room, RoomMember } from '../types/room';
import { Message } from '../types/message';
import { GasClient } from '../api/gasClient';
import { useAuth } from './AuthContext';
import { compressImage } from '../utils/imageCompressor';
import { sounds } from '../utils/soundEffects';

interface ChatContextType {
  activeRoom: Room | null;
  rooms: Room[];
  messages: Message[];
  members: RoomMember[];
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
  selectRoom: (room: Room) => void;
  refreshRooms: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<boolean>;
  sendImageMessage: (file: File, caption?: string) => Promise<boolean>;
  editMessage: (messageId: string, newContent: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  joinRoom: (roomId: string, kodeRoom?: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: (roomId: string) => Promise<void>;
  removeMember: (roomId: string, targetUserId: string) => Promise<boolean>;
  createRoom: (data: { namaRoom: string; deskripsi?: string; kodeRoom?: string; membutuhkanKode?: boolean; fotoUrl?: string }) => Promise<{ success: boolean; room?: Room; error?: string }>;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const toastTimerRef = useRef<any>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Fetch Rooms
  const refreshRooms = useCallback(async () => {
    if (!user) return;
    setIsLoadingRooms(true);
    try {
      const res = await GasClient.getRooms(user.id_user, token || undefined);
      if (res.success && res.rooms) {
        setRooms(res.rooms);
      }
    } catch (e) {
      console.error('Failed to load rooms:', e);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [user, token]);

  // Initial rooms load when user is authenticated
  useEffect(() => {
    if (user) {
      refreshRooms();
    } else {
      setRooms([]);
      setActiveRoom(null);
      setMessages([]);
      setMembers([]);
    }
  }, [user, refreshRooms]);

  // Select Room & fetch full message history & members
  const selectRoom = useCallback(async (room: Room) => {
    setActiveRoom(room);
    setReplyingTo(null);
    setIsLoadingMessages(true);

    try {
      const [msgRes, memberRes] = await Promise.all([
        GasClient.getMessages(room.id_room, 60, undefined, token || undefined),
        GasClient.getRoomMembers(room.id_room, token || undefined)
      ]);

      if (msgRes.success && msgRes.messages) {
        setMessages(msgRes.messages);
      }
      if (memberRes.success && memberRes.members) {
        setMembers(memberRes.members);
      }
    } catch (e) {
      console.error('Failed to load room details:', e);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [token]);

  const refreshMessages = useCallback(async () => {
    if (!activeRoom) return;
    try {
      const res = await GasClient.getMessages(activeRoom.id_room, 60, undefined, token || undefined);
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.error('Failed to refresh messages:', e);
    }
  }, [activeRoom, token]);

  // --- SMART ADAPTIVE DELTA POLLING ---
  const lastPollRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    if (!activeRoom || !user) return;

    let isSubscribed = true;
    let pollIntervalMs = 2500; // 2.5 detik saat tab aktif
    let timer: any = null;

    const runPoll = async () => {
      // Jika tab tidak aktif (background), perlambat polling ke 8 detik
      if (document.hidden) {
        pollIntervalMs = 8000;
      } else {
        pollIntervalMs = 2500;
      }

      try {
        const since = lastPollRef.current;
        const res = await GasClient.getLatestMessages(activeRoom.id_room, since, token || undefined);
        
        if (isSubscribed && res.success && res.messages && res.messages.length > 0) {
          lastPollRef.current = new Date().toISOString();

          setMessages(prev => {
            const map = new Map<string, Message>();
            prev.forEach(m => map.set(m.id_message, m));

            let hasNewIncoming = false;
            res.messages.forEach((newMsg: Message) => {
              if (!map.has(newMsg.id_message) && newMsg.id_user !== user.id_user) {
                hasNewIncoming = true;
              }
              map.set(newMsg.id_message, newMsg);
            });

            if (hasNewIncoming) {
              sounds.playMessageReceived();
            }

            return Array.from(map.values()).sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      } catch (err) {
        // Silent error on polling to avoid user disruption
      }

      if (isSubscribed) {
        timer = setTimeout(runPoll, pollIntervalMs);
      }
    };

    lastPollRef.current = new Date().toISOString();
    timer = setTimeout(runPoll, pollIntervalMs);

    return () => {
      isSubscribed = false;
      if (timer) clearTimeout(timer);
    };
  }, [activeRoom, user, token]);

  // Send Text Message (Optimistic UI)
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!activeRoom || !user || !content.trim()) return false;

    const tempId = 'TEMP_' + Date.now();
    const optimisticMsg: Message = {
      id_message: tempId,
      id_room: activeRoom.id_room,
      id_user: user.id_user,
      nama_pengirim: user.nama,
      foto_pengirim: user.foto_url,
      message_type: 'text',
      content: content.trim(),
      reply_to_id: replyingTo?.id_message,
      reply_message: replyingTo ? {
        id_message: replyingTo.id_message,
        nama_pengirim: replyingTo.nama_pengirim || 'Pengguna',
        content: replyingTo.content
      } : undefined,
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setReplyingTo(null);
    sounds.playMessageSent();
    setIsSending(true);

    try {
      const res = await GasClient.sendMessage(
        activeRoom.id_room,
        user.id_user,
        content.trim(),
        optimisticMsg.reply_to_id,
        token || undefined
      );

      if (res.success && (res as any).message) {
        setMessages(prev =>
          prev.map(m => (m.id_message === tempId ? { ...((res as any).message as Message), status: 'sent' } : m))
        );
        return true;
      } else {
        setMessages(prev =>
          prev.map(m => (m.id_message === tempId ? { ...m, status: 'error' } : m))
        );
        showToast(res.error || 'Gagal mengirim pesan', 'error');
        return false;
      }
    } catch (e: any) {
      setMessages(prev =>
        prev.map(m => (m.id_message === tempId ? { ...m, status: 'error' } : m))
      );
      showToast('Terjadi gangguan koneksi', 'error');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  // Send Image Message (with client-side compression)
  const sendImageMessage = async (file: File, caption?: string): Promise<boolean> => {
    if (!activeRoom || !user) return false;

    setIsSending(true);
    showToast('Mengompres dan mengunggah gambar...', 'info');

    try {
      const compressed = await compressImage(file, 1280, 1280, 0.8);
      const res = await GasClient.sendImageMessage(
        activeRoom.id_room,
        user.id_user,
        compressed.base64,
        file.name,
        'image/jpeg',
        caption || '',
        token || undefined
      );

      if (res.success && (res as any).message) {
        setMessages(prev => [...prev, { ...((res as any).message as Message), status: 'sent' }]);
        sounds.playMessageSent();
        showToast('Gambar berhasil dikirim!', 'success');
        return true;
      } else {
        showToast(res.error || 'Gagal mengunggah gambar', 'error');
        return false;
      }
    } catch (err: any) {
      console.error('Image send error:', err);
      showToast(err.message || 'Gagal memproses gambar', 'error');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  // Edit Message
  const editMessage = async (messageId: string, newContent: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await GasClient.editMessage(messageId, user.id_user, newContent, token || undefined);
      if (res.success) {
        setMessages(prev =>
          prev.map(m =>
            m.id_message === messageId
              ? { ...m, content: newContent, is_edited: true, updated_at: new Date().toISOString() }
              : m
          )
        );
        showToast('Pesan berhasil diedit', 'success');
        return true;
      } else {
        showToast(res.error || 'Gagal mengedit pesan', 'error');
        return false;
      }
    } catch (e: any) {
      showToast('Gagal mengedit pesan', 'error');
      return false;
    }
  };

  // Delete Message (Soft Delete)
  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await GasClient.deleteMessage(messageId, user.id_user, token || undefined);
      if (res.success) {
        setMessages(prev =>
          prev.map(m =>
            m.id_message === messageId
              ? { ...m, content: 'Pesan ini telah dihapus', is_deleted: true }
              : m
          )
        );
        showToast('Pesan berhasil dihapus', 'success');
        return true;
      } else {
        showToast(res.error || 'Gagal menghapus pesan', 'error');
        return false;
      }
    } catch (e: any) {
      showToast('Gagal menghapus pesan', 'error');
      return false;
    }
  };

  // Join Room
  const joinRoom = async (roomId: string, kodeRoom?: string) => {
    if (!user) return { success: false, error: 'User belum login' };
    try {
      const res = await GasClient.joinRoom(roomId, user.id_user, kodeRoom, token || undefined);
      if (res.success) {
        await refreshRooms();
        const target = rooms.find(r => r.id_room === roomId);
        if (target) selectRoom(target);
        showToast(res.message || 'Berhasil bergabung!', 'success');
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Gagal bergabung room' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Gangguan koneksi' };
    }
  };

  // Leave Room
  const leaveRoom = async (roomId: string) => {
    if (!user) return;
    try {
      await GasClient.leaveRoom(roomId, user.id_user, token || undefined);
      await refreshRooms();
      if (activeRoom?.id_room === roomId) {
        setActiveRoom(null);
        setMessages([]);
      }
      showToast('Anda telah keluar dari room', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Kick Member
  const removeMember = async (roomId: string, targetUserId: string): Promise<boolean> => {
    try {
      const res = await GasClient.removeRoomMember(roomId, targetUserId, token || undefined);
      if (res.success) {
        setMembers(prev => prev.filter(m => m.id_user !== targetUserId));
        showToast('Peserta berhasil dikeluarkan', 'success');
        return true;
      } else {
        showToast(res.error || 'Gagal mengeluarkan peserta', 'error');
        return false;
      }
    } catch (e) {
      showToast('Gagal mengeluarkan peserta', 'error');
      return false;
    }
  };

  // Create Room
  const createRoom = async (data: {
    namaRoom: string;
    deskripsi?: string;
    kodeRoom?: string;
    membutuhkanKode?: boolean;
    fotoUrl?: string;
  }) => {
    if (!user) return { success: false, error: 'Belum login' };
    try {
      const res = await GasClient.createRoom({
        ...data,
        userId: user.id_user,
        token: token || undefined
      });
      if (res.success && res.room) {
        await refreshRooms();
        selectRoom(res.room);
        showToast('Room baru berhasil dibuat!', 'success');
        return { success: true, room: res.room };
      } else {
        return { success: false, error: res.error || 'Gagal membuat room' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Gangguan server' };
    }
  };

  return (
    <ChatContext.Provider
      value={{
        activeRoom,
        rooms,
        messages,
        members,
        isLoadingRooms,
        isLoadingMessages,
        isSending,
        replyingTo,
        setReplyingTo,
        selectRoom,
        refreshRooms,
        refreshMessages,
        sendMessage,
        sendImageMessage,
        editMessage,
        deleteMessage,
        joinRoom,
        leaveRoom,
        removeMember,
        createRoom,
        toast,
        showToast
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
