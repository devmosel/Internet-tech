'use client';

import { useRef } from 'react';
import { hapticClick } from '@/utils/animations';

/**
 * LevelTabs Component
 * Navigation tabs for selecting floor levels with availability indicators
 * 
 * @param {string} selectedLevel - Currently selected floor ID ('lantai1', 'lantai2', 'lantai3')
 * @param {Function} onSelectLevel - Handler for floor selection
 * @param {Object} availability - Availability counts for each floor { lantai1, lantai2, lantai3 }
 */
export default function LevelTabs({
    selectedLevel,
    onSelectLevel,
    availability = { lantai1: 0, lantai2: 0, lantai3: 0 }
}) {
    const tabs = [
        { id: 'lantai3', label: 'Floor 3', count: availability.lantai3 },
        { id: 'lantai2', label: 'Floor 2', count: availability.lantai2 },
        { id: 'lantai1', label: 'Floor 1', count: availability.lantai1 }
    ];

    // Refs for animation
    const tabRefs = useRef([]);

    const handleTabClick = (index, floorId) => {
        if (floorId === selectedLevel) return;

        hapticClick(tabRefs.current[index], () => {
            onSelectLevel(floorId);
        });
    };

    return (
        <div className="h-full flex flex-col items-center py-6">
            <div className="relative flex flex-col justify-between h-full w-[140px]">
                {/* Vertical Track Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-[3px] bg-black rounded-full z-0"></div>

                {tabs.map((tab, index) => {
                    const isActive = selectedLevel === tab.id;

                    return (
                        <div key={tab.id} className="relative z-10 flex items-center group">
                            {/* Circle Indicator */}
                            <button
                                ref={el => tabRefs.current[index] = el}
                                onClick={() => handleTabClick(index, tab.id)}
                                className={`
                                    w-8 h-8 rounded-full border-[3px] border-black transition-all duration-300 z-20
                                    flex items-center justify-center
                                    ${isActive
                                        ? 'bg-black scale-110 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)]'
                                        : 'bg-white hover:border-neutral-500 hover:scale-105'
                                    }
                                `}
                                aria-label={`Select ${tab.label}`}
                            >
                                {isActive && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                            </button>

                            {/* Label Card */}
                            <div
                                className={`
                                    absolute left-10 pl-4 transition-all duration-300 cursor-pointer
                                    ${isActive
                                        ? 'opacity-100 translate-x-0'
                                        : 'opacity-60 hover:opacity-100'
                                    }
                                `}
                                onClick={() => handleTabClick(index, tab.id)}
                            >
                                <div className={`
                                    px-4 py-2 rounded-xl border-2 border-black flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    ${isActive ? 'bg-black' : 'bg-white'}
                                `}>
                                    <span className={`font-black text-sm uppercase tracking-wider ${isActive ? 'text-white' : 'text-black'}`}>
                                        {tab.label}
                                    </span>
                                    {tab.count > 0 ? (
                                        <span className={`
                                            text-[10px] font-bold px-1.5 py-0.5 rounded
                                            ${isActive ? 'bg-white text-black' : 'bg-black text-white'}
                                        `}>
                                            {tab.count}
                                        </span>
                                    ) : (
                                        <span className={`text-[10px] uppercase font-bold ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>Full</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
