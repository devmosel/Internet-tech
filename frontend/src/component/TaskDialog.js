'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Users } from 'lucide-react';

export default function TaskDialog({ isOpen, onClose, onSubmit, assignmentId, users = [], mode = 'create', taskData = null }) {
    const modalRef = useRef(null);
    const backdropRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        priority: 'medium',
        user_id: '',
        is_done: false
    });

    // Reset/populate form when opening
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && taskData) {
                setFormData({
                    title: taskData.title || '',
                    priority: taskData.priority || 'medium',
                    user_id: taskData.user_id?.toString() || '',
                    is_done: taskData.is_done || false
                });
            } else {
                setFormData({
                    title: '',
                    priority: 'medium',
                    user_id: '',
                    is_done: false
                });
            }
            setErrors({});
        }
    }, [isOpen, mode, taskData]);

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
            newErrors.title = 'Task title is required';
        }

        if (!formData.user_id) {
            newErrors.user_id = 'Please assign a user';
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
            await onSubmit({
                title: formData.title,
                priority: formData.priority,
                user_id: parseInt(formData.user_id),
                is_done: formData.is_done
            });

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
                className="relative bg-white border-[3px] border-black rounded-2xl w-full max-w-[510px] overflow-hidden"
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
                        {mode === 'edit' ? 'Edit Task' : 'Add New Task'}
                    </h2>
                    <p className="text-white/70 font-medium text-sm mt-1">
                        {mode === 'edit' ? 'Update task details' : 'Create a task for this assignment'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-8 bg-[#FFFEF8]">
                    <div className="flex flex-col gap-6">
                        {/* Title */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Task Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className={`h-12 px-4 bg-white border-2 ${errors.title ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}
                                placeholder="Enter task title"
                                autoComplete="off"
                            />
                            {errors.title && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Priority */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Priority
                            </label>
                            <div className="flex gap-3">
                                {['low', 'medium', 'high'].map((priority) => (
                                    <button
                                        key={priority}
                                        type="button"
                                        onClick={() => handleInputChange('priority', priority)}
                                        className={`flex-1 h-12 rounded-xl border-2 border-black font-bold uppercase text-sm transition-all ${
                                            formData.priority === priority
                                                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                                : 'bg-white text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                        }`}
                                    >
                                        {priority}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assign User */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Assign To
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => handleInputChange('user_id', e.target.value)}
                                    className={`h-12 px-4 pr-10 bg-white border-2 ${errors.user_id ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all w-full appearance-none`}
                                >
                                    <option value="">Select a user</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>
                                <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} strokeWidth={2.5} />
                            </div>
                            {errors.user_id && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                                    {errors.user_id}
                                </p>
                            )}
                        </div>

                        {/* Is Done Checkbox */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleInputChange('is_done', !formData.is_done)}
                                className={`w-6 h-6 border-2 border-black rounded flex items-center justify-center transition-all ${
                                    formData.is_done ? 'bg-black' : 'bg-white'
                                }`}
                            >
                                {formData.is_done && (
                                    <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                )}
                            </button>
                            <label className="font-bold text-sm text-black cursor-pointer" onClick={() => handleInputChange('is_done', !formData.is_done)}>
                                Mark as completed
                            </label>
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
                                    <span>{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
                                </div>
                            ) : (
                                mode === 'edit' ? 'Update Task' : 'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
