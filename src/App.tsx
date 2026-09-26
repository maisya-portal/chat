import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ScreenShareProvider } from './context/ScreenShareContext';
import { LoginView } from './views/LoginView';
import { ChatView } from './views/ChatView';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl animate-pulse-subtle mb-4">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-xl">
            M
          </div>
        </div>
        <p className="text-sm font-semibold text-emerald-300">Memuat Maisya Chat Room...</p>
        <p className="text-xs text-slate-500 mt-1">Pondok Pesantren Imam Syafi'i Brebes</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <ScreenShareProvider>
      <ChatProvider>
        <ChatView />
      </ChatProvider>
    </ScreenShareProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
