/**
 * Custom Tooltip component
 * Shows tooltip instantly on hover without delay
 */

'use client';

import { useState, useRef, useEffect } from 'react';

export default function Tooltip({ children, text, disabled = false }) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top + rect.height / 2,
                left: rect.right + 8, // 8px gap from the icon
            });
        }
    }, [isVisible]);

    if (disabled || !text) {
        return children;
    }

    return (
        <>
            <div
                ref={triggerRef}
                className="relative inline-block w-full"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                <div
                    className="fixed z-[9999] pointer-events-none -translate-y-1/2"
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                >
                    <div className="bg-neutral-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap relative">
                        {text}
                        {/* Arrow */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900"></div>
                    </div>
                </div>
            )}
        </>
    );
}
