import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ScreenShareProvider } from './context/ScreenShareContext';
import { LoginView } from './views/LoginView';
import { ChatView } from './views/ChatView';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden select-none">
        {/* Ambient Radial Glowing Aura */}
        <div className="absolute w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute w-64 h-64 bg-teal-500/10 rounded-full blur-2xl animate-pulse pointer-events-none delay-500" />

        {/* Dynamic Animated Logo Container with Dual Concentric Orbitals */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer Rotating Glowing Gradient Ring */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 opacity-60 blur-xs animate-spin [animation-duration:3s]" />
          
          {/* Reverse Orbiting Dashed Ring */}
          <div className="absolute -inset-2 rounded-2xl border border-dashed border-emerald-400/50 animate-spin-reverse opacity-70" />

          {/* Pulsing Radar Halo */}
          <div className="absolute -inset-1 rounded-2xl bg-emerald-400/30 animate-ping opacity-25" />

          {/* Main Logo Card */}
          <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-emerald-500/40 p-0.5 shadow-2xl flex items-center justify-center z-10 transition-transform">
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-[14px] flex items-center justify-center shadow-inner">
              <span className="text-emerald-400 font-black text-2xl tracking-wider animate-pulse">
                M
              </span>
            </div>
          </div>
        </div>

        {/* Text Information with subtle gradient */}
        <div className="text-center z-10 space-y-1.5 px-4">
          <h2 className="text-base font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent tracking-wide">
            Memuat Maisya Chat Room...
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Pondok Pesantren Imam Syafi'i Brebes
          </p>
        </div>

        {/* Animated Progress Bar & Bouncing Dots */}
        <div className="mt-6 flex flex-col items-center gap-3 z-10">
          <div className="w-48 h-1 bg-slate-800/80 rounded-full overflow-hidden relative shadow-inner">
            <div className="absolute inset-y-0 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500 rounded-full w-24 animate-shimmer-progress shadow-lg shadow-emerald-500/50" />
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
          </div>
        </div>
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
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
