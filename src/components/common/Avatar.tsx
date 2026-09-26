import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isOnline,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const getInitials = (n: string) => {
    if (!n) return 'M';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  // Generate consistent background color based on name
  const getBgColor = (n: string) => {
    const colors = [
      'bg-emerald-600',
      'bg-teal-600',
      'bg-cyan-600',
      'bg-blue-600',
      'bg-indigo-600',
      'bg-amber-600'
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) hash += n.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-emerald-500/20 shadow-sm`}
          onError={(e) => {
            // Fallback to initials if image link breaks
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${getBgColor(
            name
          )} text-white font-semibold rounded-full flex items-center justify-center border border-white/10 shadow-sm`}
        >
          {getInitials(name)}
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-slate-900 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-500'
          } ${size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
        />
      )}
    </div>
  );
};
