'use client';

import AdminTabs from '@/component/AdminTabs';

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFEF8]" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Admin Navigation Header */}
      <AdminTabs />

      {/* Page Content */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-8 relative">
        {children}
      </div>
    </div>
  );
}
