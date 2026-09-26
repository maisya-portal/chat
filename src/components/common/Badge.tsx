import React from 'react';
import { RoleId } from '../../types/user';

interface BadgeProps {
  roleId?: RoleId | string;
  label?: string;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ roleId, label, variant, size = 'sm' }) => {
  let text = label;
  let styleVariant = variant || 'slate';

  if (roleId) {
    switch (roleId) {
      case 'ROLE_SUPERADMIN':
        text = text || 'Super Admin';
        styleVariant = 'amber';
        break;
      case 'ROLE_ADMIN':
        text = text || 'Admin';
        styleVariant = 'purple';
        break;
      case 'ROLE_MUSYRIF':
        text = text || 'Musyrif';
        styleVariant = 'emerald';
        break;
      case 'ROLE_STAFF':
        text = text || 'Staff';
        styleVariant = 'blue';
        break;
      case 'ROLE_PESERTA':
      default:
        text = text || 'Peserta';
        styleVariant = 'slate';
        break;
    }
  }

  const variantStyles = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    slate: 'bg-slate-700/50 text-slate-300 border-slate-600/30'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${variantStyles[styleVariant]} ${sizeStyles[size]}`}
    >
      {text}
    </span>
  );
};
