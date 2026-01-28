'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Calendar } from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '@/styles/calendar-glassy.css';

export default function BlackoutDialog({ isOpen, onClose, mode = 'create', blackoutData = null, onSubmit }) {
    const modalRef = useRef(null);
    const backdropRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showCalendar, setShowCalendar] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    // Date range state
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    // Populate form data when editing
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && blackoutData) {
                setFormData({
                    title: blackoutData.title || '',
                    description: blackoutData.description || ''
                });
                setDateRange([
                    {
                        startDate: new Date(blackoutData.start_at),
                        endDate: new Date(blackoutData.end_at),
                        key: 'selection'
                    }
                ]);
            } else {
                // Reset form for create mode
                setFormData({
                    title: '',
                    description: ''
                });
                setDateRange([
                    {
                        startDate: new Date(),
                        endDate: new Date(),
                        key: 'selection'
                    }
                ]);
            }
            setErrors({});
            setShowCalendar(false);
        }
    }, [mode, blackoutData, isOpen]);

    // Animate modal entrance
    useEffect(() => {
        if (isOpen && modalRef.current && backdropRef.current) {
            setIsClosing(false);

            gsap.set(backdropRef.current, { opacity: 0 });
            gsap.set(modalRef.current, { scale: 0.95, opacity: 0, y: 10 });

            const tl = gsap.timeline();
            tl.to(backdropRef.current, {
                opacity: 1,
                duration: 0.25,
                ease: 'power1.out'
            })
                .to(modalRef.current, {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.35,
                    ease: 'power2.out'
                }, '-=0.15');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (isClosing) return;

        setIsClosing(true);

        const tl = gsap.timeline({
            onComplete: () => {
                onClose();
                setIsClosing(false);
            }
        });

        tl.to(modalRef.current, {
            scale: 0.95,
            opacity: 0,
            y: 10,
            duration: 0.25,
            ease: 'power1.in'
        })
            .to(backdropRef.current, {
                opacity: 0,
                duration: 0.2,
                ease: 'power1.in'
            }, '-=0.15');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert dates to ISO format with time set to start/end of day
            const startDate = new Date(dateRange[0].startDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(dateRange[0].endDate);
            endDate.setHours(23, 59, 59, 999);

            const submitData = {
                title: formData.title,
                start_at: startDate.toISOString(),
                end_at: endDate.toISOString(),
                description: formData.description
            };

            await onSubmit(submitData);

            // Success animation
            if (modalRef.current) {
                gsap.to(modalRef.current, {
                    scale: 1.03,
                    duration: 0.3,
                    ease: 'power1.inOut',
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        handleClose();
                    }
                });
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const formatDateRange = () => {
        const start = dateRange[0].startDate;
        const end = dateRange[0].endDate;

        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };

        if (start.toDateString() === end.toDateString()) {
            return formatDate(start);
        }

        return `${formatDate(start)} - ${formatDate(end)}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-white border-[3px] border-black rounded-2xl w-full max-w-[550px] overflow-hidden"
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 p-2 bg-white border-2 border-transparent hover:border-black rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all z-10"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Header */}
                <div className="bg-black text-white px-8 py-6 border-b-[3px] border-black">
                    <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
                        {mode === 'create' ? 'Add New Blackout' : 'Edit Blackout'}
                    </h2>
                    <p className="text-white/70 font-medium text-sm mt-1">
                        {mode === 'create' ? 'Schedule a maintenance period' : 'Modify existing schedule'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-8 bg-[#FFFEF8]">
                    <div className="flex flex-col gap-6">
                        {/* Title */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className={`h-12 px-4 bg-white border-2 ${errors.title ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}
                                placeholder="Enter blackout title"
                                autoComplete="off"
                            />
                            {errors.title && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Date Range Picker */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Date Range
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className="w-full h-12 px-4 bg-white border-2 border-black rounded-xl text-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-between"
                                >
                                    <span>{formatDateRange()}</span>
                                    <Calendar size={20} className="text-black" strokeWidth={2.5} />
                                </button>

                                {showCalendar && (
                                    <div className="absolute top-full left-0 mt-3 z-50 rounded-2xl overflow-hidden border-2 border-black bg-white">
                                        <div className="p-2">
                                            <DateRange
                                                editableDateInputs={true}
                                                onChange={item => setDateRange([item.selection])}
                                                moveRangeOnFirstSelection={false}
                                                ranges={dateRange}
                                                rangeColors={['#000000']}
                                                className="border-0 font-sans"
                                            />
                                        </div>
                                        <div className="p-4 border-t-2 border-black flex justify-end bg-gray-50">
                                            <button
                                                type="button"
                                                onClick={() => setShowCalendar(false)}
                                                className="px-6 py-2 bg-black text-white border-2 border-black rounded-lg text-sm font-black uppercase tracking-wider hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className={`min-h-[120px] px-4 py-3 bg-white border-2 ${errors.description ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-vertical`}
                                placeholder="Enter blackout description"
                                rows={4}
                            />
                            {errors.description && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                                    {errors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8 pt-6 border-t-2 border-dashed border-black/20">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-white text-black border-[3px] border-black rounded-xl h-14 flex items-center justify-center font-black uppercase tracking-wider hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] active:shadow-none active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-black text-white border-[3px] border-black rounded-xl h-14 flex items-center justify-center font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                mode === 'create' ? 'Create Blackout' : 'Update Blackout'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
