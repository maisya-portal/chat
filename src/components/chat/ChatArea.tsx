import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useScreenShare } from '../../context/ScreenShareContext';
import { useTheme } from '../../context/ThemeContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ReplyBanner } from './ReplyBanner';
import { ImageLightbox } from './ImageLightbox';
import { MessageRevisionsModal } from './MessageRevisionsModal';
import { ScreenShareBanner } from '../screenshare/ScreenShareBanner';
import { ScreenShareModal } from '../screenshare/ScreenShareModal';
import { 
  Users, 
  Info, 
  Menu, 
  MessageSquare, 
  Lock, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { GasClient } from '../../api/gasClient';
import { ScreenShareSession } from '../../types/api';

interface ChatAreaProps {
  onToggleSidebar: () => void;
  onToggleInfoPanel: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  onToggleSidebar,
  onToggleInfoPanel
}) => {
  const { 
    activeRoom, 
    messages, 
    isLoadingMessages, 
    replyingTo, 
    setReplyingTo,
    members
  } = useChat();

  const { activeSession, isSharing } = useScreenShare();

  const [lightboxImg, setLightboxImg] = useState<{ src: string; fileName?: string } | null>(null);
  const [revisionMsgId, setRevisionMsgId] = useState<string | null>(null);
  const [isWatchingScreen, setIsWatchingScreen] = useState(false);
  const [roomScreenSession, setRoomScreenSession] = useState<ScreenShareSession | null>(null);

  const { wallpaper, customWallpaperUrl } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getWallpaperClass = () => {
    switch (wallpaper) {
      case 'emerald': return 'wallpaper-emerald';
      case 'night': return 'wallpaper-night';
      case 'minimal': return 'wallpaper-minimal';
      case 'doodle': return 'wallpaper-doodle';
      case 'islamic':
      default:
        return 'wallpaper-islamic';
    }
  };

  const getWallpaperStyle = (): React.CSSProperties => {
    if (wallpaper === 'custom' && customWallpaperUrl) {
      return {
        backgroundImage: `url(${customWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {};
  };

  // Poll screen share session for active room
  useEffect(() => {
    if (!activeRoom) return;

    const checkScreen = async () => {
      try {
        const res = await GasClient.getActiveScreenShareSession(activeRoom.id_room);
        if (res.success && res.is_active && res.session) {
          setRoomScreenSession(res.session);
        } else {
          setRoomScreenSession(null);
        }
      } catch (e) {}
    };

    checkScreen();
    const interval = setInterval(checkScreen, 5000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/60 bg-islamic-pattern">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Selamat Datang di Maisya Chat Room
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Pondok Pesantren Imam Syafi'i Brebes. Silakan pilih ruang percakapan di bilah samping atau bergabung ke halaqah baru.
        </p>
        <button
          onClick={onToggleSidebar}
          className="md:hidden px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
        >
          <Menu className="w-4 h-4" />
          <span>Buka Daftar Room</span>
        </button>
      </div>
    );
  }

  const effectiveSession = (isSharing && activeSession) ? activeSession : roomScreenSession;

  return (
    <div 
      className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 ${getWallpaperClass()}`}
      style={getWallpaperStyle()}
    >
      
      {/* Chat Area Top Bar */}
      <div className="h-16 px-4 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Room Image / Icon */}
          <img
            src={activeRoom.foto_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'}
            alt={activeRoom.nama_room}
            className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30 shrink-0"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {activeRoom.nama_room}
              </h2>
              {activeRoom.membutuhkan_kode && (
                <span title="Membutuhkan Kode Passcode">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md hidden sm:block">
              {activeRoom.deskripsi || 'Ruang komunikasi internal pesantren'}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Members & Info Panel */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleInfoPanel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700/50"
            title="Daftar Peserta & Info Room"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{members.length || activeRoom.member_count || 1} Anggota</span>
          </button>

          <button
            onClick={onToggleInfoPanel}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Informasi Detail Room"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Screen Share Active Notice */}
      {effectiveSession && (
        <ScreenShareBanner
          session={effectiveSession}
          onWatch={() => setIsWatchingScreen(true)}
        />
      )}

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
        {isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Mengambil riwayat percakapan dari Google Spreadsheet...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 text-xs py-12">
            <MessageSquare className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
            <p className="font-semibold text-slate-400">Belum ada pesan di room ini.</p>
            <p className="mt-1">Jadilah yang pertama mengirim pesan atau menyapa anggota lainnya!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id_message}
              message={msg}
              onOpenLightbox={(src, name) => setLightboxImg({ src, fileName: name })}
              onOpenRevisions={(id) => setRevisionMsgId(id)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner */}
      <ReplyBanner
        message={replyingTo}
        onCancel={() => setReplyingTo(null)}
      />

      {/* Message Input Bar */}
      <MessageInput />

      {/* Image Lightbox Modal */}
      <ImageLightbox
        src={lightboxImg?.src || null}
        fileName={lightboxImg?.fileName}
        onClose={() => setLightboxImg(null)}
      />

      {/* Message Revisions Modal */}
      <MessageRevisionsModal
        isOpen={Boolean(revisionMsgId)}
        onClose={() => setRevisionMsgId(null)}
        messageId={revisionMsgId}
      />

      {/* Screen Share Watcher Modal */}
      {isWatchingScreen && effectiveSession && (
        <ScreenShareModal
          session={effectiveSession}
          onClose={() => setIsWatchingScreen(false)}
        />
      )}
    </div>
  );
};
