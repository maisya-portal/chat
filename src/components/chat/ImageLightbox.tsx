import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ImageLightboxProps {
  src: string | null;
  fileName?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, fileName, onClose }) => {
  if (!src) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <a
          href={src}
          download={fileName || 'gambar-maisya.jpg'}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <Download className="w-4 h-4" />
          <span>Unduh</span>
        </a>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600/80 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
        <img
          src={src}
          alt={fileName || 'Pratinjau Gambar'}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
        />
        {fileName && (
          <p className="text-xs text-slate-300 mt-3 font-mono bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
            {fileName}
          </p>
        )}
      </div>
    </div>
  );
};
