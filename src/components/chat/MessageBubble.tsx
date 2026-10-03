import React, { useState } from 'react';
import { Message } from '../../types/message';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { LinkifiedText } from '../common/LinkifiedText';
import { formatMessageTime } from '../../utils/dateUtils';
import { 
  Copy, 
  Reply, 
  Edit3, 
  Trash2, 
  History, 
  MoreVertical, 
  Check, 
  Clock, 
  AlertCircle,
  CornerDownRight
} from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onOpenLightbox: (src: string, fileName?: string) => void;
  onOpenRevisions: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onOpenLightbox,
  onOpenRevisions
}) => {
  const { user, can } = useAuth();
  const { deleteMessage, editMessage, setReplyingTo, showToast } = useChat();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwn = user?.id_user === message.id_user;
  const isDeleted = Boolean(message.is_deleted);
  const isEdited = Boolean(message.is_edited);

  // Permissions check
  const canCopy = can('copy_message');
  const canEdit = !isDeleted && (
    (isOwn && can('edit_own_message')) || (!isOwn && can('edit_any_message'))
  );
  const canDelete = !isDeleted && (
    (isOwn && can('delete_own_message')) || (!isOwn && can('delete_any_message'))
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    showToast('Pesan berhasil disalin.', 'success');
    setIsMenuOpen(false);
  };

  const handleReply = () => {
    setReplyingTo(message);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    const ok = await editMessage(message.id_message, editContent);
    if (ok) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      await deleteMessage(message.id_message);
      setIsMenuOpen(false);
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-3 my-2.5 transition-all ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      {!isOwn && (
        <Avatar
          src={message.foto_pengirim}
          name={message.nama_pengirim || 'Pengguna'}
          size="sm"
          className="mt-1"
        />
      )}

      {/* Bubble Container */}
      <div className={`relative max-w-[82%] sm:max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        
        {/* Sender Name (for other people's messages) */}
        {!isOwn && (
          <span className="text-[11px] font-semibold text-emerald-400 mb-1 ml-1 tracking-wide">
            {message.nama_pengirim || 'Pengguna'}
          </span>
        )}

        {/* Quoted Message (if replied) */}
        {message.reply_message && !isDeleted && (
          <div
            className={`mb-1 px-3 py-1.5 rounded-lg border-l-2 text-xs flex items-center gap-1.5 max-w-full ${
              isOwn
                ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200'
                : 'bg-slate-800/80 border-slate-500 text-slate-300'
            }`}
          >
            <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-semibold text-[11px] truncate">
              {message.reply_message.nama_pengirim}:
            </span>
            <span className="truncate text-slate-300 text-[11px] italic">
              {message.reply_message.content}
            </span>
          </div>
        )}

        {/* Main Content Bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm transition-all ${
            isDeleted
              ? 'bg-slate-800/40 text-slate-400 italic border border-slate-700/50'
              : isOwn
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-emerald-900/20'
              : 'bg-slate-800/95 text-slate-100 rounded-tl-none border border-slate-700/70 shadow-black/20'
          }`}
        >
          {/* Image Message */}
          {message.message_type === 'image' && message.file_url && !isDeleted && (
            <div className="mb-2 overflow-hidden rounded-xl bg-black/20">
              <img
                src={message.file_url}
                alt={message.file_name || 'Gambar'}
                className="max-h-72 max-w-full object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => onOpenLightbox(message.file_url!, message.file_name)}
              />
            </div>
          )}

          {/* Text Message Content or Edit Input */}
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[220px]">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 bg-slate-900 text-white text-xs rounded-lg border border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-400 custom-scrollbar resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs text-slate-300 hover:text-white rounded bg-slate-700/60"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-2.5 py-1 text-xs text-white font-medium rounded bg-emerald-500 hover:bg-emerald-400"
                >
                  Simpan
                </button>
              </div>
            </div>
          ) : isDeleted ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed select-text">
              {message.content}
            </p>
          ) : (
            <LinkifiedText text={message.content} isOwn={isOwn} />
          )}

          {/* Metadata Footer: Time, Edited Badge, Status */}
          <div
            className={`flex items-center gap-1.5 text-[10px] mt-1 pt-0.5 justify-end select-none ${
              isOwn ? 'text-emerald-100/80' : 'text-slate-400'
            }`}
          >
            {isEdited && !isDeleted && (
              <button
                onClick={() => onOpenRevisions(message.id_message)}
                className="hover:underline flex items-center gap-0.5 text-amber-300/90 font-medium"
                title="Klik untuk melihat riwayat revisi"
              >
                <span>(Diedit)</span>
              </button>
            )}

            <span>{formatMessageTime(message.created_at)}</span>

            {/* Status indicator for own messages */}
            {isOwn && (
              <span>
                {message.status === 'sending' ? (
                  <Clock className="w-3 h-3 text-emerald-200 animate-spin" />
                ) : message.status === 'error' ? (
                  <AlertCircle className="w-3 h-3 text-rose-300" />
                ) : (
                  <Check className="w-3 h-3 text-emerald-200" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Action Menu (Three dots / Hover bar) */}
        {!isDeleted && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${
              isOwn ? '-left-8' : '-right-8'
            } opacity-0 group-hover:opacity-100 transition-opacity flex items-center z-10`}
          >
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-md"
                title="Opsi Pesan"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  className={`absolute top-full mt-1 ${
                    isOwn ? 'right-0' : 'left-0'
                  } w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 py-1 text-xs`}
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  {canCopy && (
                    <button
                      onClick={handleCopy}
                      className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center gap-2 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </button>
                  )}

                  <button
                    onClick={handleReply}
                    className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center gap-2 transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Balas</span>
                  </button>

                  {isEdited && (
                    <button
                      onClick={() => {
                        onOpenRevisions(message.id_message);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center gap-2 transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Riwayat Revisi</span>
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-amber-600/20 hover:text-amber-300 flex items-center gap-2 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-600/20 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
