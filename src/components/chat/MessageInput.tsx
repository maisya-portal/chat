import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useScreenShare } from '../../context/ScreenShareContext';
import { 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Monitor, 
  Paperclip,
  X,
  Sparkles
} from 'lucide-react';

export const MessageInput: React.FC = () => {
  const { can } = useAuth();
  const { activeRoom, sendMessage, sendImageMessage, isSending, showToast } = useChat();
  const { startSharing, isSharing } = useScreenShare();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSendText = can('send_message');
  const canSendImage = can('send_image');
  const canScreenShare = can('screen_share');

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    if (selectedFile) {
      const ok = await sendImageMessage(selectedFile, caption);
      if (ok) {
        clearFile();
      }
      return;
    }

    if (!text.trim() || isSending) return;
    const ok = await sendMessage(text);
    if (ok) {
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal adalah 5MB', 'error');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFilePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setCaption('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScreenShareClick = async () => {
    if (!activeRoom) return;
    if (isSharing) {
      showToast('Anda sedang membagikan layar', 'info');
      return;
    }
    const res = await startSharing(activeRoom.id_room);
    if (!res.success) {
      showToast(res.error || 'Gagal memulai berbagi layar', 'error');
    }
  };

  const quickEmojis = ['👍', '🤲', '🕌', '📚', '✍️', '🌟', '🤍', '😊', '👏', '🤝'];

  if (!canSendText) {
    return (
      <div className="p-4 bg-slate-900/60 border-t border-slate-800 text-center text-xs text-slate-400">
        Anda tidak memiliki izin untuk mengirim pesan di room ini.
      </div>
    );
  }

  return (
    <div className="relative border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md p-3">
      {/* File Preview Modal Bar if an image is selected */}
      {filePreview && (
        <div className="mb-3 p-3 rounded-xl bg-slate-800/90 border border-emerald-500/30 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-black/40">
            <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={clearFile}
              className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-emerald-300 truncate mb-1">
              {selectedFile?.name}
            </p>
            <input
              type="text"
              placeholder="Tambahkan keterangan gambar (opsional)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-xs bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Quick Emoji Bar Toggle */}
      {showEmojiPicker && (
        <div className="flex items-center gap-2 p-2 mb-2 bg-slate-800/90 border border-slate-700 rounded-xl overflow-x-auto custom-scrollbar animate-fade-in">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg p-1.5 hover:bg-slate-700 rounded-lg transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div className="flex items-end gap-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
        
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />

        {/* Action Buttons: Image, Screen Share, Emoji */}
        <div className="flex items-center gap-1 pl-1 pb-1">
          {canSendImage && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 rounded-xl transition-colors"
              title="Kirim Gambar (Google Drive)"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          )}

          {canScreenShare && (
            <button
              type="button"
              onClick={handleScreenShareClick}
              className={`p-2 rounded-xl transition-colors ${
                isSharing
                  ? 'text-emerald-400 bg-emerald-500/20'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60'
              }`}
              title="Berbagi Layar (WebRTC)"
            >
              <Monitor className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700/60 rounded-xl transition-colors"
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedFile
              ? 'Klik tombol kirim untuk mengunggah gambar...'
              : `Tulis pesan di #${activeRoom?.nama_room || 'chat'}...`
          }
          rows={1}
          disabled={Boolean(selectedFile)}
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm py-2 px-2 focus:outline-none custom-scrollbar resize-none max-h-32"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && !selectedFile) || isSending}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
            (text.trim() || selectedFile) && !isSending
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/30 hover:scale-105 active:scale-95'
              : 'text-slate-500 bg-slate-700/40 cursor-not-allowed'
          }`}
          title="Kirim Pesan (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
