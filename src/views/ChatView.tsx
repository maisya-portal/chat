import React, { useState } from 'react';
import { SidebarRoomList } from '../components/room/SidebarRoomList';
import { ChatArea } from '../components/chat/ChatArea';
import { RoomInfoPanel } from '../components/room/RoomInfoPanel';
import { AdminDashboardModal } from '../components/admin/AdminDashboardModal';
import { Toast } from '../components/common/Toast';
import { useChat } from '../context/ChatContext';

export const ChatView: React.FC = () => {
  const { toast } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* Toast Notification Container */}
      <Toast toast={toast} />

      {/* Left Sidebar: Room List */}
      <SidebarRoomList
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <ChatArea
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleInfoPanel={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
        />
      </main>

      {/* Right Drawer: Room Info & Participants */}
      <RoomInfoPanel
        isOpen={isInfoPanelOpen}
        onClose={() => setIsInfoPanelOpen(false)}
      />

      {/* Backdrop for mobile right panel */}
      {isInfoPanelOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsInfoPanelOpen(false)}
        />
      )}

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />
    </div>
  );
};
