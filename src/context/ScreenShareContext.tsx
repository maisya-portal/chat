import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScreenShareSession } from '../types/api';
import { GasClient } from '../api/gasClient';
import { useAuth } from './AuthContext';

interface ScreenShareContextType {
  isSharing: boolean;
  localStream: MediaStream | null;
  activeSession: ScreenShareSession | null;
  startSharing: (roomId: string) => Promise<{ success: boolean; error?: string }>;
  stopSharing: () => Promise<void>;
  viewingSession: ScreenShareSession | null;
  setViewingSession: (session: ScreenShareSession | null) => void;
}

const ScreenShareContext = createContext<ScreenShareContextType | undefined>(undefined);

export const ScreenShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, can } = useAuth();
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [activeSession, setActiveSession] = useState<ScreenShareSession | null>(null);
  const [viewingSession, setViewingSession] = useState<ScreenShareSession | null>(null);

  // Broadcast channel for local multi-window / multi-tab live screen share preview
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      const bc = new BroadcastChannel('maisya_screenshare_channel');
      setChannel(bc);

      bc.onmessage = (event) => {
        const { type, session } = event.data;
        if (type === 'SESSION_STARTED') {
          setActiveSession(session);
        } else if (type === 'SESSION_ENDED') {
          setActiveSession(null);
          setViewingSession(null);
        }
      };

      return () => {
        bc.close();
      };
    }
  }, []);

  const startSharing = async (roomId: string) => {
    if (!user) return { success: false, error: 'User belum login' };
    if (!can('screen_share')) {
      return { success: false, error: 'Anda tidak memiliki izin untuk berbagi layar.' };
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        return { success: false, error: 'Fitur getDisplayMedia tidak didukung di browser ini.' };
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        } as any,
        audio: true
      });

      // Dengarkan event ketika pengguna menekan "Stop sharing" pada browser bar bawaan
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopSharing();
        };
      }

      setLocalStream(stream);
      setIsSharing(true);

      // Simpan session di backend tb_screen_share_sessions
      const res = await GasClient.createScreenShareSession(roomId, user.id_user, token || undefined);
      if (res.success && res.session) {
        const sess: ScreenShareSession = {
          ...res.session,
          presenter_name: user.nama,
          presenter_foto: user.foto_url
        };
        setActiveSession(sess);
        channel?.postMessage({ type: 'SESSION_STARTED', session: sess });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error starting screen share:', err);
      return { success: false, error: err.message || 'Gagal memulai berbagi layar.' };
    }
  };

  const stopSharing = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsSharing(false);

    if (activeSession) {
      await GasClient.endScreenShareSession(activeSession.id_session, token || undefined);
      channel?.postMessage({ type: 'SESSION_ENDED', sessionId: activeSession.id_session });
      setActiveSession(null);
    }
  };

  return (
    <ScreenShareContext.Provider
      value={{
        isSharing,
        localStream,
        activeSession,
        startSharing,
        stopSharing,
        viewingSession,
        setViewingSession
      }}
    >
      {children}
    </ScreenShareContext.Provider>
  );
};

export const useScreenShare = (): ScreenShareContextType => {
  const context = useContext(ScreenShareContext);
  if (!context) {
    throw new Error('useScreenShare must be used within a ScreenShareProvider');
  }
  return context;
};
