/**
 * Dashboard Layout Component
 * Wraps all dashboard pages with sidebar and notification panel
 * Renders once - only content changes on navigation
 */

'use client';

import { useState } from 'react';
import Sidebar from '@/component/Sidebar';
import NotificationPanel from '@/component/NotificationPanel';
import { useSidebar } from '@/contexts/SidebarContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function DashboardLayout({ children }) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { currentUser } = useCurrentUser();

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">
      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - renders once */}
      <Sidebar isOpen={isSidebarOpen} currentUser={currentUser} />

      {/* Main Content */}
      <div className={`relative transition-all duration-500 ease-in-out ${
        isSidebarOpen ? 'md:ml-64' : 'ml-0'
      }`}>
        {/* Hamburger Toggle */}
        <button
          onClick={toggleSidebar}
          className={`fixed top-6 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 z-10 transition-all duration-500 ease-in-out ${
            isSidebarOpen ? 'left-[272px]' : 'left-6'
          }`}
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Notification Toggle */}
        <button
          onClick={toggleNotification}
          className="fixed top-6 right-6 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 z-10"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* Notification Panel - renders once */}
        <NotificationPanel 
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />

        {/* Page Content - this is what changes */}
        {children}
      </div>
    </div>
  );
}
