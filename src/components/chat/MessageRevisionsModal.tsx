import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { MessageRevision } from '../../types/message';
import { GasClient } from '../../api/gasClient';
import { History, Clock, User as UserIcon } from 'lucide-react';
import { formatRelativeDate } from '../../utils/dateUtils';

interface MessageRevisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string | null;
}

export const MessageRevisionsModal: React.FC<MessageRevisionsModalProps> = ({
  isOpen,
  onClose,
  messageId
}) => {
  const [revisions, setRevisions] = useState<MessageRevision[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && messageId) {
      setLoading(true);
      GasClient.getMessageRevisions(messageId).then(res => {
        if (res.success && res.revisions) {
          setRevisions(res.revisions);
        } else {
          setRevisions([]);
        }
        setLoading(false);
      });
    }
  }, [isOpen, messageId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Riwayat Revisi Pesan"
      subtitle="Catatan audit perubahan teks pesan di tb_message_revisions"
      maxWidth="lg"
    >
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          Memuat riwayat perubahan...
        </div>
      ) : revisions.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          Tidak ada riwayat revisi yang tercatat untuk pesan ini.
        </div>
      ) : (
        <div className="space-y-4">
          {revisions.map((rev, idx) => (
            <div
              key={rev.id_revision || idx}
              className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <UserIcon className="w-3.5 h-3.5" />
                  {rev.edited_by_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelativeDate(rev.edited_at)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/40 text-slate-300 font-mono text-xs whitespace-pre-wrap">
                {rev.old_content}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
