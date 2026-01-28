'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { gsap } from 'gsap';

export default function PomodoroOverlay({ position, onClose }) {
    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [breathScale, setBreathScale] = useState(1);

    // Refs
    const containerRef = useRef(null);
    const timeRef = useRef(null);
    const breathRef = useRef(null);
    const controlsRef = useRef(null);
    const modeRef = useRef(null);

    // Constants
    const MODES = {
        focus: { time: 25 * 60, label: 'DEEP FOCUS', color: 'text-white' },
        shortBreak: { time: 5 * 60, label: 'SHORT BREAK', color: 'text-green-400' },
        longBreak: { time: 15 * 60, label: 'LONG BREAK', color: 'text-blue-400' }
    };

    // Initial Entrance Animation - content reveals through expanding circle
    useEffect(() => {
        // Animate clip-path to reveal content through circle
        gsap.fromTo(containerRef.current, 
            { 
                clipPath: `circle(0% at ${position.x}% ${position.y}%)`
            },
            { 
                clipPath: `circle(150% at ${position.x}% ${position.y}%)`,
                duration: 0.7,
                ease: 'power2.inOut'
            }
        );
    }, [position]);

    // Breathing Animation
    useEffect(() => {
        if (!isActive) {
            setBreathScale(1);
            return;
        }

        const breathInterval = setInterval(() => {
            setBreathScale(prev => prev === 1 ? 1.5 : 1);
        }, 4000);

        return () => clearInterval(breathInterval);
    }, [isActive]);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (soundEnabled) {
                // playSound();
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, soundEnabled]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time);
    };

    const changeMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(MODES[newMode].time);
    };

    const handleClose = () => {
        // Animate page clip-path to shrink into circle
        gsap.to(containerRef.current, {
            clipPath: `circle(0% at ${position.x}% ${position.y}%)`,
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => {
                onClose();
            }
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Progress Bar Calculation
    const totalTime = MODES[mode].time;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[200] bg-black text-white selection:bg-white selection:text-black flex flex-col">

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
                <button
                    onClick={handleClose}
                    className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors"
                >
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase">Back to Dashboard</span>
                </button>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white transition-colors"
                    >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-8">

                {/* Background Ambient Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Subtle gradient blob */}
                    <div
                        ref={breathRef}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] bg-white rounded-full blur-[150px] transition-all duration-[4000ms] ease-in-out"
                        style={{ 
                            transform: `translate(-50%, -50%) scale(${breathScale})`,
                            opacity: isActive ? 0.15 : 0.05
                        }}
                    />
                </div>

                {/* Mode Selector */}
                <div ref={modeRef} className="flex gap-4 mb-20 relative z-10">
                    {Object.keys(MODES).map((m) => (
                        <button
                            key={m}
                            onClick={() => changeMode(m)}
                            className={`px-6 py-2 rounded-full border transition-all duration-300 text-xs font-bold tracking-[0.2em] uppercase ${mode === m
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-white/50 border-transparent hover:border-white/20'
                                }`}
                        >
                            {MODES[m].label}
                        </button>
                    ))}
                </div>

                {/* THE TIMER */}
                <div ref={timeRef} className="relative z-10 mb-20 select-none flex flex-col items-center transition-all duration-300">
                    <h1 className="text-[18vw] md:text-[240px] leading-none font-black tracking-widest tabular-nums mix-blend-difference" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
                        {formatTime(timeLeft)}
                    </h1>

                    {/* Progress Bar (Minimalist Line) */}
                    <div className="w-64 h-1 bg-white/10 mt-12 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div ref={controlsRef} className="flex items-center gap-8 relative z-10">
                    <button
                        onClick={resetTimer}
                        className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        {isActive ? (
                            <Pause size={32} fill="currentColor" stroke="none" />
                        ) : (
                            <Play size={32} fill="currentColor" stroke="none" className="ml-1" />
                        )}
                    </button>
                </div>

            </div>

            {/* Motivational / Status Text */}
            <div className="absolute bottom-12 w-full text-center text-white/30 font-mono text-xs tracking-[0.3em] uppercase mix-blend-difference">
                {isActive ? 'FOCUS SEQUENCE INITIATED' : 'READY TO BEGIN'}
            </div>

        </div>
    );
}
