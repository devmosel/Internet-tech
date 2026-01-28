'use client';

import { useRef } from 'react';
import { hapticClick } from '@/utils/animations';

/**
 * ButtonV1 - Primary button component with 3D effect and haptic animation
 * 
 * Features:
 * - 3D appearance with bottom border
 * - Hover: lifts up, darkens background
 * - Click: haptic scale animation
 * - Active: presses down, border disappears
 * 
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.children - Button text/content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.loadingText - Text to show when loading
 */
export default function ButtonV1({
    onClick,
    disabled = false,
    loading = false,
    children,
    className = '',
    loadingText = 'Loading...',
    ...props
}) {
    const contentRef = useRef(null);

    const handleClick = (e) => {
        if (disabled || loading) return;

        hapticClick(contentRef.current, () => {
            onClick?.(e);
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
        bg-neutral-900 text-white text-sm font-bold px-8 py-3 
        rounded-xl border-b-4 border-neutral-700 
        hover:bg-neutral-800 hover:border-neutral-600 hover:-translate-y-1 
        active:border-b-0 active:translate-y-1 
        transition-all duration-150 
        flex items-center justify-center gap-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
            {...props}
        >
            <span ref={contentRef} className="inline-block">
                {loading ? loadingText : children}
            </span>
        </button>
    );
}
