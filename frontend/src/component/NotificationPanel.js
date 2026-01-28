'use client';

import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bell
} from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed right-6 top-[76px] w-full max-w-96 bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20 overflow-hidden animate-slideDown">
      {/* Header */}
      <div className="border-b-[3px] border-black p-5 bg-black text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] active:translate-y-px active:shadow-none"
          >
            <X size={18} className="text-black" strokeWidth={3} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <Bell size={14} />
          <p className="text-xs font-bold uppercase tracking-wide">You're all caught up</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto bg-[#FFFEF8]">
        {/* Booking Confirmed */}
        <button className="w-full p-4 rounded-xl bg-white border-2 border-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all text-left">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-green-500 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-black uppercase tracking-wide mb-1">
                Booking Confirmed
              </p>
              <p className="text-xs text-black font-medium mb-2 line-clamp-2">
                Your booking for Desk A1 on October 27 has been confirmed.
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <Clock size={12} />
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
        </button>

        {/* Reminder */}
        <button className="w-full p-4 rounded-xl bg-white border-2 border-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all text-left">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-500 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Clock size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-black uppercase tracking-wide mb-1">
                Reminder
              </p>
              <p className="text-xs text-black font-medium mb-2 line-clamp-2">
                Your booking starts in 1 hour. Check-in code: ABC123
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <Clock size={12} />
                <span>5 hours ago</span>
              </div>
            </div>
          </div>
        </button>

        {/* Booking Cancelled */}
        <button className="w-full p-4 rounded-xl bg-white border-2 border-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all text-left">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-orange-500 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-black uppercase tracking-wide mb-1">
                Booking Cancelled
              </p>
              <p className="text-xs text-black font-medium mb-2 line-clamp-2">
                Conference A booking for October 28 has been cancelled.
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <Clock size={12} />
                <span>1 day ago</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
