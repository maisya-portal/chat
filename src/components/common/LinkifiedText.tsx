import React from 'react';
import { ExternalLink, Play } from 'lucide-react';

interface LinkifiedTextProps {
  text: string;
  isOwn?: boolean;
}

/**
 * Ekstrak ID Video YouTube dari berbagai format link:
 * - https://youtu.be/yAu5VdpHcTc?feature=shared
 * - https://www.youtube.com/watch?v=yAu5VdpHcTc
 * - https://www.youtube.com/shorts/yAu5VdpHcTc
 * - https://www.youtube.com/embed/yAu5VdpHcTc
 */
export function getYouTubeVideoId(urlStr: string): string | null {
  try {
    const raw = urlStr.startsWith('http://') || urlStr.startsWith('https://')
      ? urlStr
      : `https://${urlStr}`;
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\/+/, '').split('/')[0].split('?')[0];
      return id && id.length === 11 ? id : null;
    }

    if (host.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;

      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.replace('/shorts/', '').split('/')[0].split('?')[0];
        return id && id.length === 11 ? id : null;
      }

      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.replace('/embed/', '').split('/')[0].split('?')[0];
        return id && id.length === 11 ? id : null;
      }
    }
  } catch (e) {
    // Ignore invalid url parse
  }
  return null;
}

export const LinkifiedText: React.FC<LinkifiedTextProps> = ({ text, isOwn = false }) => {
  if (!text) return null;

  // Regex mendeteksi semua URL yang diawali http://, https://, atau www.
  const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
  const parts = text.split(urlRegex);

  // Cari link YouTube pertama (jika ada) untuk dibuatkan preview card
  let firstYouTubeId: string | null = null;
  let firstYouTubeUrl: string | null = null;

  const renderedContent = parts.map((part, index) => {
    if (!part) return null;

    if (part.match(/^(https?:\/\/|www\.)/i)) {
      // Bersihkan tanda baca di akhir URL jika ada (seperti titik, koma, tanda kurung penutup)
      let cleanUrl = part;
      let trailing = '';

      while (cleanUrl.length > 0 && /[.,;:!?]$/.test(cleanUrl)) {
        trailing = cleanUrl.slice(-1) + trailing;
        cleanUrl = cleanUrl.slice(0, -1);
      }

      if (cleanUrl.endsWith(')') && !cleanUrl.includes('(')) {
        trailing = ')' + trailing;
        cleanUrl = cleanUrl.slice(0, -1);
      }

      const href = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
        ? cleanUrl
        : `https://${cleanUrl}`;

      const ytId = getYouTubeVideoId(cleanUrl);
      if (ytId && !firstYouTubeId) {
        firstYouTubeId = ytId;
        firstYouTubeUrl = href;
      }

      return (
        <React.Fragment key={index}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1 font-medium underline underline-offset-2 break-all transition-all cursor-pointer ${
              isOwn
                ? 'text-emerald-100 hover:text-white decoration-emerald-200/80 hover:decoration-white'
                : 'text-emerald-400 hover:text-emerald-300 decoration-emerald-500/70 hover:decoration-emerald-400'
            }`}
            title={`Buka tautan: ${href}`}
          >
            <span>{cleanUrl}</span>
            <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-80" />
          </a>
          {trailing}
        </React.Fragment>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });

  return (
    <div className="space-y-2">
      {/* Konten teks asli dengan link aktif */}
      <p className="whitespace-pre-wrap break-words leading-relaxed select-text">
        {renderedContent}
      </p>

      {/* Kartu Cuplikan Video YouTube (jika terdapat link YouTube) */}
      {firstYouTubeId && firstYouTubeUrl && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            window.open(firstYouTubeUrl!, '_blank', 'noopener,noreferrer');
          }}
          className={`group/yt relative mt-2 rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md ${
            isOwn
              ? 'bg-black/25 border-emerald-400/30 hover:border-emerald-300'
              : 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-500/60'
          }`}
        >
          {/* Thumbnail Container */}
          <div className="relative aspect-video w-full overflow-hidden bg-black/40">
            <img
              src={`https://img.youtube.com/vi/${firstYouTubeId}/hqdefault.jpg`}
              alt="YouTube Video Preview"
              className="w-full h-full object-cover group-hover/yt:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover/yt:bg-black/10 transition-colors flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-lg group-hover/yt:bg-red-500 group-hover/yt:scale-110 transition-all">
                <Play className="w-5 h-5 ml-0.5 fill-white" />
              </div>
            </div>
          </div>

          {/* Info Bar Bawah */}
          <div className="p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0">
                <Play className="w-2.5 h-2.5 fill-white" />
              </div>
              <span className="font-semibold text-slate-100 truncate">
                Tonton Video di YouTube
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium group-hover/yt:underline shrink-0">
              <span>Buka</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
