'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomCalendar({ selectedDate, onDateSelect, onClose }) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (selectedDate) {
            const date = new Date(selectedDate);
            return new Date(date.getFullYear(), date.getMonth(), 1);
        }
        return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    });

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Previous month's days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                day,
                isCurrentMonth: true,
                date: new Date(year, month, day)
            });
        }

        // Next month's days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            days.push({
                day,
                isCurrentMonth: false,
                date: new Date(year, month + 1, day)
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateClick = (dateObj) => {
        if (!dateObj.isCurrentMonth) return;

        const year = dateObj.date.getFullYear();
        const month = String(dateObj.date.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        onDateSelect(dateString);
        if (onClose) onClose();
    };

    const isSelectedDate = (dateObj) => {
        if (!selectedDate || !dateObj.isCurrentMonth) return false;
        const selected = new Date(selectedDate);
        return (
            dateObj.date.getDate() === selected.getDate() &&
            dateObj.date.getMonth() === selected.getMonth() &&
            dateObj.date.getFullYear() === selected.getFullYear()
        );
    };

    const isToday = (dateObj) => {
        const today = new Date();
        return (
            dateObj.date.getDate() === today.getDate() &&
            dateObj.date.getMonth() === today.getMonth() &&
            dateObj.date.getFullYear() === today.getFullYear()
        );
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden w-[340px]">
            {/* Header */}
            <div className="bg-neutral-900 px-5 py-4 flex items-center justify-between">
                <h2 className="text-[22px] font-bold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft size={20} className="text-white/80" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight size={20} className="text-white/80" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4 bg-white">
                {/* Day Names */}
                <div className="grid grid-cols-7 mb-2">
                    {dayNames.map((day) => (
                        <div
                            key={day}
                            className="text-center font-semibold text-[13px] text-gray-600 py-1.5"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-y-1">
                    {days.map((dateObj, index) => {
                        const selected = isSelectedDate(dateObj);
                        const today = isToday(dateObj);

                        return (
                            <button
                                key={index}
                                onClick={() => handleDateClick(dateObj)}
                                disabled={!dateObj.isCurrentMonth}
                                className={`
                  h-10 flex items-center justify-center text-[15px] font-medium rounded-full
                  transition-all
                  ${!dateObj.isCurrentMonth ? 'text-gray-300 cursor-default' : 'text-neutral-900 cursor-pointer'}
                  ${selected ? 'bg-neutral-900 text-white font-bold shadow-sm' : ''}
                  ${today && !selected ? 'border-2 border-neutral-900' : ''}
                  ${!selected && dateObj.isCurrentMonth ? 'hover:bg-gray-100' : ''}
                `}
                            >
                                {dateObj.day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
