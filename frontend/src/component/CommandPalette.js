'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import {
  Calendar,
  Clock,
  Grid3x3,
  Map,
  Home,
  BookOpen,
  Timer,
  Search,
  ArrowRight
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onOpenPomodoro }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  // Quick actions
  const quickActions = [
    {
      id: 'book-space',
      name: 'Book a Space',
      description: 'Find and reserve workspace',
      icon: Calendar,
      shortcut: 'B',
      action: () => {
        onClose();
        router.push('/dashboard/booking');
      }
    },
    {
      id: 'my-bookings',
      name: 'My Bookings',
      description: 'View your reservations',
      icon: BookOpen,
      shortcut: 'M',
      action: () => {
        onClose();
        router.push('/dashboard/myBooking');
      }
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Return to home',
      icon: Home,
      shortcut: 'H',
      action: () => {
        onClose();
        router.push('/dashboard');
      }
    },
    {
      id: 'pomodoro',
      name: 'Start Pomodoro',
      description: 'Deep focus timer',
      icon: Timer,
      shortcut: 'P',
      action: () => {
        onClose();
        if (onOpenPomodoro) {
          onOpenPomodoro();
        }
      }
    },
    {
      id: 'grid-view',
      name: 'Grid View',
      description: 'Switch to grid layout',
      icon: Grid3x3,
      shortcut: 'G',
      action: () => {
        onClose();
        router.push('/dashboard/booking');
      }
    },
    {
      id: 'floor-plan',
      name: 'Floor Plan View',
      description: 'Visual space map',
      icon: Map,
      shortcut: 'F',
      action: () => {
        onClose();
        router.push('/dashboard/booking');
      }
    }
  ];

  // Filter actions based on query
  const filteredActions = quickActions.filter(action =>
    action.name.toLowerCase().includes(query.toLowerCase()) ||
    action.description.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Portal entrance animation
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Reset query and selection
      setQuery('');
      setSelectedIndex(0);

      // Animate entrance
      gsap.fromTo(
        containerRef.current,
        {
          clipPath: 'circle(0% at 50% 50%)',
          opacity: 0
        },
        {
          clipPath: 'circle(150% at 50% 50%)',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            // Focus input after animation
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }
        }
      );
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        clipPath: 'circle(0% at 50% 50%)',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          onClose();
        }
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredActions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredActions[selectedIndex]) {
            filteredActions[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredActions]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]"
        onClick={handleClose}
      />

      {/* Command Palette */}
      <div
        ref={containerRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[800px] z-[301] flex items-center justify-center"
        style={{ clipPath: 'circle(0% at 50% 50%)' }}
      >
        <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          {/* Search Input */}
          <div className="relative border-b-[3px] border-black bg-white">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black">
              <Search size={24} strokeWidth={3} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="w-full pl-14 pr-6 py-6 text-xl font-bold bg-transparent border-none outline-none placeholder:text-gray-400 placeholder:font-black placeholder:uppercase placeholder:tracking-wide text-black tracking-tight"
              style={{ fontFamily: 'Tanker-Regular, sans-serif' }}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs font-black bg-black text-white rounded border-2 border-black">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto bg-[#FFFEF8]">
            {filteredActions.length > 0 ? (
              <div className="p-3 bg-[#FFFEF8]">
                <div className="text-xs font-black text-black px-3 py-2 uppercase tracking-widest border-b-2 border-black/10 mx-3 mb-2">
                  Quick Actions
                </div>
                {filteredActions.map((action, index) => {
                  const Icon = action.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={action.id}
                      onClick={() => action.action()}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all group border-2 ${isSelected
                          ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] translate-x-1'
                          : 'bg-white text-black border-transparent hover:border-black'
                        }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                            ? 'bg-white text-black border-white'
                            : 'bg-gray-100 border-black group-hover:bg-white'
                          }`}
                      >
                        <Icon size={20} strokeWidth={2.5} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-black text-base uppercase tracking-wide mb-0.5">
                          {action.name}
                        </div>
                        <div
                          className={`text-xs font-bold ${isSelected ? 'text-white/70' : 'text-gray-500'
                            }`}
                        >
                          {action.description}
                        </div>
                      </div>

                      {/* Shortcut */}
                      {action.shortcut && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <kbd
                            className={`px-2 py-1 text-xs font-black rounded border-2 ${isSelected
                                ? 'bg-white text-black border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-gray-100 text-gray-500 border-gray-300'
                              }`}
                          >
                            ⌘{action.shortcut}
                          </kbd>
                        </div>
                      )}

                      {/* Arrow indicator */}
                      {isSelected && (
                        <ArrowRight size={20} strokeWidth={3} className="flex-shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-gray-400 font-bold uppercase tracking-widest">
                  No results found for "{query}"
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-[3px] border-black bg-white px-5 py-3 flex items-center justify-between text-xs font-bold text-black">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border-2 border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 border-2 border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">↓</kbd>
                <span className="uppercase tracking-wider">Navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border-2 border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">↵</kbd>
                <span className="uppercase tracking-wider">Select</span>
              </span>
            </div>
            <div className="uppercase tracking-wider font-black">
              Cmd+K
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
