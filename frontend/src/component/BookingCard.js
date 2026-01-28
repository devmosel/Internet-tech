/**
 * BookingCard Component
 * Displays individual booking details with actions
 * Active bookings have green background (from Figma)
 */

'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  XCircle,
  QrCode,
  MoreHorizontal
} from 'lucide-react';
import { hapticClick } from '@/utils/animations';
import { useRef } from 'react';

export default function BookingCard({ booking, onCheckIn, onCheckOut, onCancel, onShowQR, compact = false }) {
  const [showQRCode, setShowQRCode] = useState(false);

  // Refs for animation
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const cancelRef = useRef(null);
  const qrRef = useRef(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: 'bg-white',
        text: 'text-black',
        label: 'Active',
        borderColor: 'border-green-500' // Accent border
      },
      checkin: {
        bg: 'bg-white',
        text: 'text-black',
        label: 'Checked In',
        borderColor: 'border-blue-500'
      },
      finished: {
        bg: 'bg-white',
        text: 'text-gray-500',
        label: 'Finished',
        borderColor: 'border-gray-400'
      },
      completed: {
        bg: 'bg-white',
        text: 'text-gray-500',
        label: 'Finished',
        borderColor: 'border-gray-400'
      },
      cancelled: {
        bg: 'bg-white',
        text: 'text-red-500',
        label: 'Cancelled',
        borderColor: 'border-red-500'
      }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <div className={`${config.bg} border-2 ${config.borderColor} rounded-lg px-3 py-1 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]`}>
        <span className={`text-xs font-black ${config.text} uppercase tracking-wide`}>
          {config.label}
        </span>
      </div>
    );
  };

  // Get card background and border based on status
  const getCardStyle = (status) => {
    if (status === 'active') {
      return {
        bg: 'bg-[#DCFCE7]', // Watercolor Green
        border: 'border-black'
      };
    }
    if (status === 'checkin') {
      return {
        bg: 'bg-[#E0F2FE]', // Watercolor Blue
        border: 'border-black'
      };
    }
    if (status === 'cancelled') {
      return {
        bg: 'bg-[#FEE2E2]', // Watercolor Red
        border: 'border-black'
      };
    }
    if (status === 'finished' || status === 'completed') {
      return {
        bg: 'bg-[#F3F4F6]', // Watercolor Gray
        border: 'border-black'
      };
    }
    return {
      bg: 'bg-white',
      border: 'border-black'
    };
  };

  const cardStyle = getCardStyle(booking.status);

  // Check if booking has buttons (not cancelled or finished)
  const hasButtons = booking.status !== 'cancelled' && booking.status !== 'finished' && booking.status !== 'completed';

  // Animation handlers
  const handleCheckInClick = () => hapticClick(checkInRef.current, () => onCheckIn(booking));
  const handleCheckOutClick = () => hapticClick(checkOutRef.current, () => onCheckOut(booking));
  const handleCancelClick = () => hapticClick(cancelRef.current, () => onCancel(booking));
  const handleQRClick = () => hapticClick(qrRef.current, () => setShowQRCode(!showQRCode));

  // Compact mode rendering
  if (compact) {
    return (
      <>
        <div className={`${cardStyle.bg} border-[3px] border-black rounded-[24px] p-5 flex flex-col gap-4 h-full hover:-translate-y-1 transition-all duration-200`}>
          {/* Header: Space Name & Status */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h3 className="font-black text-lg text-black line-clamp-1 uppercase tracking-wide" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
                {booking.space_name}
              </h3>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                {booking.space_type}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          {/* Date & Time Info */}
          <div className="flex flex-col gap-2 bg-white/50 p-3 rounded-xl border-2 border-black/10">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-black" strokeWidth={2.5} />
              <p className="text-xs font-bold text-black">
                {booking.date}
              </p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-black" strokeWidth={2.5} />
              <p className="text-xs font-bold text-black">
                {booking.start_time} - {booking.end_time}
              </p>
            </div>
          </div>

          {/* Check-in Code */}
          {hasButtons && booking.checkin_code && (
            <div className="bg-white border-2 border-black rounded-xl p-3 flex flex-col gap-1 items-center shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Code
              </p>
              <p className="text-lg font-black text-black font-mono tracking-widest leading-none">
                {booking.checkin_code}
              </p>
            </div>
          )}

          {/* Actions */}
          {hasButtons && (
            <div className="flex flex-col gap-2 mt-auto">
              {/* Primary Action */}
              {!booking.checkin_at ? (
                <button
                  ref={checkInRef}
                  onClick={handleCheckInClick}
                  disabled={booking.status !== 'active'}
                  className="bg-black text-white rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] transition-all w-full"
                >
                  <LogIn size={16} strokeWidth={2.5} />
                  <span>Check In</span>
                </button>
              ) : (
                <button
                  ref={checkOutRef}
                  onClick={handleCheckOutClick}
                  disabled={booking.status === 'finished' || booking.status === 'cancelled' || booking.checkout_at !== null}
                  className="bg-white text-black rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all w-full"
                >
                  <LogOut size={16} strokeWidth={2.5} />
                  <span>Check Out</span>
                </button>
              )}

              {/* Secondary Actions */}
              <div className="flex gap-2">
                <button
                  ref={cancelRef}
                  onClick={handleCancelClick}
                  disabled={booking.status === 'finished' || booking.status === 'cancelled'}
                  className="flex-1 bg-white border-2 border-black text-red-600 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-50 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <XCircle size={14} strokeWidth={2.5} />
                  <span>Cancel</span>
                </button>
                <button
                  ref={qrRef}
                  onClick={handleQRClick}
                  disabled={booking.status === 'finished' || booking.status === 'cancelled'}
                  className="flex-1 bg-white border-2 border-black text-black rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-gray-50 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <QrCode size={14} strokeWidth={2.5} />
                  <span>QR</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Section - Below the card */}
        {hasButtons && showQRCode && (
          <div className="bg-white border-2 border-black rounded-xl p-6 flex flex-col items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              onClick={() => setShowQRCode(false)}
              className="self-end p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close QR Code"
            >
              <XCircle size={20} strokeWidth={2.5} />
            </button>
            <p className="text-xs font-bold text-black uppercase tracking-wider">
              Scan to check in
            </p>
            <div className="bg-white p-3 rounded-lg border-2 border-black">
              <QRCode
                value={booking.checkin_code || 'N/A'}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>
            <p className="text-sm font-mono font-bold text-gray-600">
              {booking.checkin_code || 'N/A'}
            </p>
          </div>
        )}
      </>
    );
  }

  // Regular mode rendering
  return (
    <div className={`${cardStyle.bg} border-[3px] border-black rounded-[24px] p-6 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-200`}>
      {/* Header: Space Name & Status */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-black text-2xl text-black tracking-tight uppercase" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
            {booking.space_name}
          </h3>
          <p className="text-sm font-bold text-black/60 uppercase tracking-wide">
            {booking.space_type}
          </p>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      {/* Date & Time Info */}
      <div className="flex flex-col gap-3 bg-white/40 p-4 rounded-xl border-2 border-black/10">
        {/* Date */}
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-black" strokeWidth={2.5} />
          <p className="text-base font-bold text-black">
            {booking.date}
          </p>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-black" strokeWidth={2.5} />
          <p className="text-base font-bold text-black">
            {booking.start_time} - {booking.end_time}
          </p>
        </div>
      </div>

      {/* Check-in Code & Actions */}
      {hasButtons && (
        <div className="flex flex-col gap-4 pt-2">
          {/* Check-in Code Box and Action Buttons Row 1 */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Check-in Code Box */}
            <div className="flex-1 bg-white border-2 border-black rounded-xl p-4 flex flex-col justify-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider">
                Check-in Code
              </p>
              <p className="text-2xl font-black text-black font-mono tracking-widest">
                {booking.checkin_code || 'N/A'}
              </p>
            </div>

            {/* Check In / Check Out Button */}
            {!booking.checkin_at ? (
              // Check In Button
              <button
                ref={checkInRef}
                onClick={handleCheckInClick}
                disabled={booking.status !== 'active'}
                className="flex-[2] bg-black text-white border-2 border-black rounded-xl px-4 py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all"
              >
                <LogIn size={20} strokeWidth={2.5} />
                <span>Check In</span>
              </button>
            ) : (
              // Check Out Button
              <button
                ref={checkOutRef}
                onClick={handleCheckOutClick}
                disabled={booking.status === 'finished' || booking.status === 'cancelled' || booking.checkout_at !== null}
                className="flex-[2] bg-white text-black border-2 border-black rounded-xl px-4 py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <LogOut size={20} strokeWidth={2.5} />
                <span>Check Out</span>
              </button>
            )}

            {/* Cancel Button */}
            <button
              ref={cancelRef}
              onClick={handleCancelClick}
              disabled={booking.status === 'finished' || booking.status === 'cancelled'}
              className="bg-white border-2 border-black text-red-600 rounded-xl px-4 py-3 font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:-translate-y-0.5 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
              aria-label="Cancel Booking"
            >
              <XCircle size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* Show QR Button Row 2 */}
          <div className="flex justify-center">
            <button
              ref={qrRef}
              onClick={handleQRClick}
              disabled={booking.status === 'finished' || booking.status === 'cancelled'}
              className="w-full bg-white border-2 border-black text-black rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <QrCode size={16} strokeWidth={2.5} />
              <span>{showQRCode ? 'Hide QR Code' : 'Show QR Code'}</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Code Section - Shown when showQRCode is true */}
      {hasButtons && showQRCode && (
        <div className="bg-white border-2 border-black rounded-2xl p-8 flex flex-col items-center gap-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Title */}
          <p className="text-sm font-bold text-black uppercase tracking-wide">
            Scan to check in
          </p>

          {/* QR Code Container */}
          <div className="bg-white border-2 border-black rounded-xl p-4 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <QRCode
              value={booking.checkin_code || 'N/A'}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>

          {/* Code Text */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border-2 border-black">
            <p className="text-sm font-bold text-gray-500 uppercase">
              Code:
            </p>
            <p className="text-lg font-black text-black font-mono">
              {booking.checkin_code || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
