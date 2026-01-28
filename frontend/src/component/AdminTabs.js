'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, Users, Building2, Layers, Boxes, CalendarOff } from 'lucide-react';

const adminTabs = [
    { name: 'Spaces', path: '/dashboard/admin/spaces', icon: LayoutGrid },
    { name: 'Bookings', path: '/dashboard/admin/bookings', icon: Calendar },
    { name: 'Users', path: '/dashboard/admin/users', icon: Users },
    { name: 'Departments', path: '/dashboard/admin/departments', icon: Building2 },
    { name: 'Floors', path: '/dashboard/admin/floors', icon: Layers },
    { name: 'Amenities', path: '/dashboard/admin/amenities', icon: Boxes },
    { name: 'Blackouts', path: '/dashboard/admin/blackouts', icon: CalendarOff },
];

export default function AdminTabs() {
    const pathname = usePathname();

    return (
        <div className="sticky top-0 z-10 bg-[#FFFEF8]/95 backdrop-blur-sm border-b-[3px] border-black pt-4 pb-4 px-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2">
                    {adminTabs.map((tab) => {
                        const isActive = pathname === tab.path;

                        return (
                            <Link
                                key={tab.path}
                                href={tab.path}
                                className={`
                  relative flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-200 font-bold text-sm tracking-tight
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
    );
}
