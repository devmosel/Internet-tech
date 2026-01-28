/**
 * Reusable Sidebar component
 * Can be shown/hidden with toggle button
 * Matches Figma design with open/collapsed states
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import LogoutButton from '@/component/LogoutButton';
import Tooltip from '@/component/Tooltip';
import { getUserDisplayName, getUserInitials } from '@/utils/user';
import { gsap } from 'gsap';
import {
  Menu,
  X,
  LayoutDashboard,
  BookSearch,
  BookCheck,
  Shield,
  HelpCircle,
  Settings,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();

  // Refs for GSAP animations
  const sidebarRef = useRef(null);
  const headerTextRef = useRef(null);
  const navigationLabelsRef = useRef([]);
  const userProfileRef = useRef(null);

  // Manage sidebar open/close state with localStorage persistence
  // Always start with true to avoid hydration mismatch
  const [isOpen, setIsOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const isInitialMount = useRef(true);

  // Load from localStorage after mount to avoid hydration issues
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setIsOpen(savedState === 'true');
    }

    // Mark as ready to show
    setIsReady(true);

    // Allow animations after initial render and storage load
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Save state to localStorage when it changes
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('sidebarOpen', String(newState));

    // Dispatch custom event for layout to listen
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isOpen: newState } }));
  };

  // GSAP Animation Effect
  useEffect(() => {
    if (!sidebarRef.current) return;

    // Skip animation on initial mount to prevent flash
    if (isInitialMount.current) return;

    const tl = gsap.timeline();

    if (isOpen) {
      // Opening animation
      tl.to(sidebarRef.current, {
        width: '256px',
        duration: 0.4,
        ease: 'power2.out'
      });

      // Animate in text elements after width change
      if (headerTextRef.current) {
        tl.fromTo(headerTextRef.current, {
          opacity: 0,
          x: -20
        }, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out'
        }, '-=0.2');
      }

      // Animate navigation labels
      const validLabels = navigationLabelsRef.current.filter(Boolean);
      if (validLabels.length > 0) {
        tl.fromTo(validLabels, {
          opacity: 0,
          x: -15
        }, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.05
        }, '-=0.2');
      }

      // User profile stays visible without animation
    } else {
      // Closing animation - hide content first, then shrink width
      const elementsToHide = [
        headerTextRef.current,
        ...navigationLabelsRef.current.filter(Boolean)
      ].filter(Boolean);

      if (elementsToHide.length > 0) {
        tl.to(elementsToHide, {
          opacity: 0,
          x: -10,
          duration: 0.2,
          ease: 'power2.in'
        });
      }

      tl.to(sidebarRef.current, {
        width: '72px',
        duration: 0.3,
        ease: 'power2.inOut'
      }, '-=0.1');
    }

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  // Dispatch initial state on mount
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isOpen } }));
  }, [isOpen]);

  return (
    <div
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen bg-[#FFFEF8] border-r-[3px] border-black flex flex-col z-20"
      style={{
        overflow: 'hidden',
        width: isOpen ? '256px' : '72px',
        visibility: isReady ? 'visible' : 'hidden'
      }}
    >
      {/* Header with Logo Only */}
      <div className="px-4 pt-8 pb-6">
        <div className={`h-[48px] rounded-lg flex items-center transition-colors ${isOpen ? 'justify-center' : 'justify-center'
          }`}>
          {/* Header Logo - Open State */}
          {isOpen && (
            <img
              ref={headerTextRef}
              src="/mascott.png"
              alt="OpenBO Logo"
              className="h-12 w-auto object-contain"
              style={{ opacity: isInitialMount.current ? 1 : undefined }}
            />
          )}
          {/* Header Logo - Closed State */}
          {!isOpen && (
            <img
              src="/mascott.png"
              alt="OpenBO Logo"
              className="h-10 w-auto object-contain"
            />
          )}
        </div>
      </div>


      {/* Navigation */}
      <div className="flex-1 px-4 pt-4 flex flex-col gap-4">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`h-[41px] rounded-xl flex items-center transition-all w-full font-bold ${isOpen ? 'px-3 gap-3' : 'justify-center'
            } text-black hover:bg-white`}
        >
          {isOpen ? (
            <X size={18} className="flex-shrink-0" />
          ) : (
            <Menu size={18} className="flex-shrink-0" />
          )}
          {isOpen && (
            <span
              ref={el => navigationLabelsRef.current[0] = el}
              className="text-sm font-normal tracking-[-0.3008px] leading-[21px]"
              style={{ opacity: isInitialMount.current ? 1 : undefined }}
            >
              Collapse
            </span>
          )}
        </button>


        {/* Main Navigation */}
        <div className="flex flex-col gap-1">
          <Tooltip text="Overview" disabled={isOpen}>
            <button
              onClick={() => router.push('/dashboard')}
              className={`h-[41px] rounded-xl flex items-center transition-all w-full font-bold ${isOpen ? 'px-3 gap-3' : 'justify-center'
                } ${pathname === '/dashboard'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-white'
                }`}
            >
              <LayoutDashboard size={18} className="flex-shrink-0" />
              {isOpen && (
                <span
                  ref={el => navigationLabelsRef.current[1] = el}
                  className="text-sm font-normal tracking-[-0.3008px] leading-[21px]"
                  style={{ opacity: isInitialMount.current ? 1 : undefined }}
                >
                  Overview
                </span>
              )}
            </button>
          </Tooltip>

          <Tooltip text="Spaces" disabled={isOpen}>
            <button
              onClick={() => router.push('/dashboard/booking')}
              className={`h-[41px] rounded-xl flex items-center transition-all w-full font-bold ${isOpen ? 'px-3 gap-3' : 'justify-center'
                } ${pathname === '/dashboard/booking'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-white'
                }`}
            >
              <BookSearch size={18} className="flex-shrink-0" />
              {isOpen && (
                <span
                  ref={el => navigationLabelsRef.current[2] = el}
                  className="text-sm font-normal tracking-[-0.3008px] leading-[21px]"
                  style={{ opacity: isInitialMount.current ? 1 : undefined }}
                >
                  Spaces
                </span>
              )}
            </button>
          </Tooltip>

          <Tooltip text="Bookings" disabled={isOpen}>
            <button
              onClick={() => router.push('/dashboard/myBooking')}
              className={`h-[41px] rounded-xl flex items-center transition-all w-full font-bold ${isOpen ? 'px-3 gap-3' : 'justify-center'
                } ${pathname === '/dashboard/myBooking'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-white'
                }`}
            >
              <BookCheck size={18} className="flex-shrink-0" strokeWidth={2.5} />
              {isOpen && (
                <span
                  ref={el => navigationLabelsRef.current[3] = el}
                  className="text-sm font-normal tracking-[-0.3008px] leading-[21px]"
                  style={{ opacity: isInitialMount.current ? 1 : undefined }}
                >
                  Bookings
                </span>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="h-[2px] bg-black/10" />

        {/* Settings Navigation */}
        <div className="flex flex-col gap-1">
          {/* Admin Dashboard - Only for superadmin */}
          {currentUser?.role === 'superadmin' && (
            <Tooltip text="Admin Dashboard" disabled={isOpen}>
              <button
                onClick={() => router.push('/dashboard/admin')}
                className={`h-[41px] rounded-xl flex items-center transition-all w-full font-bold ${isOpen ? 'px-3 gap-3' : 'justify-center'
                  } ${pathname.startsWith('/dashboard/admin')
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-white'
                  }`}
              >
                <Shield size={18} className="flex-shrink-0" />
                {isOpen && (
                  <span
                    ref={el => navigationLabelsRef.current[4] = el}
                    className="text-sm font-normal tracking-[-0.3008px] leading-[21px]"
                    style={{ opacity: isInitialMount.current ? 1 : undefined }}
                  >
                    Admin Dashboard
                  </span>
                )}
              </button>
            </Tooltip>
          )}

          {/* Manager Dashboard - Only for manager */}
          {currentUser?.role === 'manager' && (
            <Tooltip text="Manager Dashboard" disabled={isOpen}>
              <button
                onClick={() => router.push('/dashboard/manager')}
                className={`h-[41px] rounded-xl flex items-center transition-all w-full font-bold ${isOpen ? 'px-3 gap-3' : 'justify-center'
                  } ${pathname.startsWith('/dashboard/manager')
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-white'
                  }`}
              >
                <Shield size={18} className="flex-shrink-0" />
                {isOpen && (
                  <span
                    ref={el => navigationLabelsRef.current[4] = el}
                    className="text-sm font-normal tracking-[-0.3008px] leading-[21px]"
                    style={{ opacity: isInitialMount.current ? 1 : undefined }}
                  >
                    Manager Dashboard
                  </span>
                )}
              </button>
            </Tooltip>
          )}

          <Tooltip text="Support" disabled={isOpen}>
            <button
              onClick={() => router.push('/dashboard/support')}
              className={`h-[41px] rounded-xl flex items-center transition-all w-full font-bold ${isOpen ? 'px-3 gap-3' : 'justify-center'
                } ${pathname.startsWith('/dashboard/support')
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-white'
                }`}
            >
              <HelpCircle size={18} className="flex-shrink-0" />
              {isOpen && (
                <span
                  ref={el => navigationLabelsRef.current[currentUser?.role === 'superadmin' ? 5 : 4] = el}
                  className="text-sm font-normal tracking-[-0.3008px] leading-[21px]"
                  style={{ opacity: isInitialMount.current ? 1 : undefined }}
                >
                  Support
                </span>
              )}
            </button>
          </Tooltip>

          <Tooltip text="Settings" disabled={isOpen}>
            <button
              className={`h-[41px] rounded-xl flex items-center transition-all w-full font-bold text-black hover:bg-white ${isOpen ? 'px-3 gap-3' : 'justify-center'
                }`}
            >
              <Settings size={18} className="flex-shrink-0" />
              {isOpen && (
                <span
                  ref={el => navigationLabelsRef.current[currentUser?.role === 'superadmin' ? 6 : 5] = el}
                  className="text-sm font-normal tracking-[-0.3008px] leading-[21px]"
                  style={{ opacity: isInitialMount.current ? 1 : undefined }}
                >
                  Settings
                </span>
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* User Profile & Sign Out */}
      <div className="border-t-[2px] border-black/10 px-4 py-4 flex flex-col gap-3">
        {/* Full Profile - Shown when open */}
        <div
          ref={userProfileRef}
          className="flex flex-col gap-2"
          style={{ display: isOpen ? 'flex' : 'none' }}
        >
          {/* User Profile */}
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
          >
            <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">{getUserInitials(currentUser)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-950 truncate">
                {getUserDisplayName(currentUser)}
              </p>
              <p className="text-xs font-medium text-gray-500 truncate">
                {currentUser?.email || 'user@company.com'}
              </p>
            </div>
          </button>
          {/* Sign Out Button */}
          <LogoutButton className="h-10 rounded-xl flex items-center gap-3 px-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium">
            <LogOut size={18} className="flex-shrink-0" />
            <span className="text-sm">
              Sign Out
            </span>
          </LogoutButton>
        </div>

        {/* Compact Profile - Shown when closed */}
        <div style={{ display: !isOpen ? 'flex' : 'none' }} className="flex flex-col gap-3">
          {/* User Avatar Only */}
          <Tooltip text={getUserDisplayName(currentUser)} disabled={false}>
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white mx-auto cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">{getUserInitials(currentUser)}</span>
              )}
            </button>
          </Tooltip>
          {/* Sign Out Icon Only */}
          <Tooltip text="Sign Out" disabled={false}>
            <LogoutButton className="w-10 h-10 flex items-center justify-center mx-auto hover:bg-red-50 rounded-lg transition-colors group">
              <LogOut size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />
            </LogoutButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
