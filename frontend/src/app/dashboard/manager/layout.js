'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Megaphone, ClipboardList } from 'lucide-react';

const managerTabs = [
  { name: 'Users', path: '/dashboard/manager/users', icon: Users },
  { name: 'Announcements', path: '/dashboard/manager/announcements', icon: Megaphone },
  { name: 'Assignments', path: '/dashboard/manager/assignments', icon: ClipboardList },
];

export default function ManagerLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFEF8]" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Manager Navigation Header */}
      <div className="sticky top-0 z-10 bg-[#FFFEF8]/95 backdrop-blur-sm border-b-[3px] border-black pt-4 pb-4 px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2">
            {managerTabs.map((tab) => {
              const isActive = pathname === tab.path;

              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`
                    relative flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl border-2 transition-all duration-200 font-bold text-sm tracking-tight min-w-[160px]
                    ${isActive
                      ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                      : 'bg-white text-black border-black/10 hover:border-black hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }
                  `}
                >
                  <tab.icon size={16} strokeWidth={2.5} />
                  <span className="whitespace-nowrap uppercase tracking-wider">
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-8 py-8 relative">
        <div className="max-w-[1600px] mx-auto relative">
          {children}
        </div>
      </div>
    </div>
  );
}
