import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { PermissionKey, PermissionMap } from '../types/permission';
import { GasClient } from '../api/gasClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: PermissionMap;
  isLoading: boolean;
  login: (nama: string, kodeLogin: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { nama: string; username: string; kodeLogin: string; roleId?: string; noWa?: string; keterangan?: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  can: (permission: PermissionKey | string) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isMusyrif: boolean;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    nama?: string;
    fotoUrl?: string;
    noWa?: string;
    keterangan?: string;
    kodeLogin?: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'maisya_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await GasClient.validateSession(savedToken);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(savedToken);
        setPermissions(res.permissions || {});
      } else {
        logout();
      }
    } catch (e) {
      console.error('Session validation error:', e);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (nama: string, kodeLogin: string) => {
    setIsLoading(true);
    try {
      const res = await GasClient.login(nama, kodeLogin);
      if (res.success && res.token && res.user) {
        setUser(res.user);
        setToken(res.token);
        setPermissions(res.permissions || {});
        localStorage.setItem(TOKEN_KEY, res.token);
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Login gagal. Periksa kembali nama dan kode Anda.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan saat menghubungi server.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { nama: string; username: string; kodeLogin: string; roleId?: string; noWa?: string; keterangan?: string }) => {
    setIsLoading(true);
    try {
      const res = await GasClient.registerUser(data);
      if (res.success) {
        return { success: true, message: res.message };
      } else {
        return { success: false, error: res.error || 'Pendaftaran gagal.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan saat pendaftaran.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (token) {
      GasClient.logout(token);
    }
    setUser(null);
    setToken(null);
    setPermissions({});
    localStorage.removeItem(TOKEN_KEY);
  };

  const can = (permission: PermissionKey | string): boolean => {
    if (!user) return false;
    if (user.role_id === 'ROLE_SUPERADMIN') return true;
    return !!permissions[permission];
  };

  const refreshUser = async () => {
    if (token) {
      const res = await GasClient.validateSession(token);
      if (res.success && res.user) {
        setUser(res.user);
        setPermissions(res.permissions || {});
      }
    }
  };

  const updateProfile = async (data: {
    nama?: string;
    fotoUrl?: string;
    noWa?: string;
    keterangan?: string;
    kodeLogin?: string;
  }) => {
    if (!user) return { success: false, error: 'Belum login' };
    try {
      const res = await GasClient.updateProfile(user.id_user, data);
      if (res.success) {
        if (res.user) {
          setUser(res.user);
        } else {
          setUser(prev => prev ? ({
            ...prev,
            ...(data.nama ? { nama: data.nama.trim() } : {}),
            ...(data.fotoUrl !== undefined ? { foto_url: data.fotoUrl } : {}),
            ...(data.noWa !== undefined ? { no_wa: data.noWa } : {}),
            ...(data.keterangan !== undefined ? { keterangan: data.keterangan } : {})
          }) : prev);
        }
        return { success: true, message: res.message || 'Profil berhasil diperbarui' };
      }
      return { success: false, error: res.error || 'Gagal memperbarui profil' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan' };
    }
  };

  const isSuperAdmin = user?.role_id === 'ROLE_SUPERADMIN';
  const isAdmin = isSuperAdmin || user?.role_id === 'ROLE_ADMIN';
  const isMusyrif = user?.role_id === 'ROLE_MUSYRIF';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        isLoading,
        login,
        register,
        logout,
        can,
        isSuperAdmin,
        isAdmin,
        isMusyrif,
        refreshUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
