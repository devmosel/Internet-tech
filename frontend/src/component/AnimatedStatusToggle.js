'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function AnimatedStatusToggle({
    status,
    onClick,
    isPending = false
}) {
    const availableRef = useRef(null);
    const maintenanceRef = useRef(null);
    const prevStatusRef = useRef(status);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current) {
            // Initial setup
            if (status === 'available') {
                gsap.set(availableRef.current, { y: 0 });
                gsap.set(maintenanceRef.current, { y: 20 });
            } else {
                gsap.set(availableRef.current, { y: -20 });
                gsap.set(maintenanceRef.current, { y: 0 });
            }
            isInitialized.current = true;
        }
    }, [status]);

    useEffect(() => {
        if (isInitialized.current && prevStatusRef.current !== status) {
            // Animate status change
            if (status === 'maintenance') {
                // Switching to maintenance
                gsap.to(availableRef.current, {
                    y: -20,
                    ease: 'power2.inOut',
                    duration: 0.5
                });
                gsap.to(maintenanceRef.current, {
                    y: 0,
                    ease: 'power2.inOut',
                    duration: 0.5
                });
            } else {
                // Switching to available
                gsap.to(availableRef.current, {
                    y: 0,
                    ease: 'power2.inOut',
                    duration: 0.5
                });
                gsap.to(maintenanceRef.current, {
                    y: 20,
                    ease: 'power2.inOut',
                    duration: 0.5
                });
            }

            prevStatusRef.current = status;
        }
    }, [status]);

    const getStatusConfig = (status) => {
        const configs = {
            available: {
                bgColor: 'bg-green-100',
                textColor: 'text-[#016630]',
                hoverColor: 'hover:bg-green-200'
            },
            maintenance: {
                bgColor: 'bg-[#ffe2e2]',
                textColor: 'text-[#e7000b]',
                hoverColor: 'hover:bg-[#ffd0d0]'
            },
        };
        return configs[status] || configs.available;
    };

    const statusConfig = getStatusConfig(status);

    return (
        <button
            onClick={onClick}
            className={`relative inline-flex items-center justify-center px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer ${statusConfig.bgColor} ${statusConfig.hoverColor} ${isPending ? 'ring-2 ring-offset-1 ring-black' : ''
                }`}
            style={{ width: '100px', height: '28px' }}
            title={`Click to toggle status (currently ${status})`}
        >
            {/* Text container with overflow hidden */}
            <div className="relative w-full h-full overflow-hidden">
                <span
                    ref={availableRef}
                    className={`absolute w-full h-full flex justify-center items-center font-medium ${statusConfig.textColor} text-[12px] tracking-tight`}
                >
                    available
                </span>
                <span
                    ref={maintenanceRef}
                    className={`absolute w-full h-full flex justify-center items-center font-medium ${statusConfig.textColor} text-[12px] tracking-tight`}
                >
                    maintenance
                </span>
            </div>
        </button>
    );
}
