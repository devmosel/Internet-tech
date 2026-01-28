/**
 * Dashboard Layout
 * Wraps all dashboard routes with sidebar and notification panel
 * Sidebar renders once and persists across all dashboard pages
 * Auth check handled by middleware
 */

'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/component/Sidebar';
import NotificationPanel from '@/component/NotificationPanel';
import CommandPalette from '@/component/CommandPalette';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Listen to sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarOpen(event.detail.isOpen);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);

    // Get initial state from localStorage
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true');
    }

    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Global keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FFFEF8]" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Sidebar - Renders once for all dashboard pages */}
      <Sidebar />

      {/* Main Content Area - Responsive to sidebar state */}
      <div
        className="flex-1 transition-all duration-300"
        style={{
          marginLeft: isSidebarOpen ? '256px' : '72px'
        }}
      >
        {/* Top Notification Panel - Hidden for now */}
        {/* <NotificationPanel /> */}

        {/* Page Content - This changes when navigating between dashboard pages */}
        <main className="relative min-h-screen p-8">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
