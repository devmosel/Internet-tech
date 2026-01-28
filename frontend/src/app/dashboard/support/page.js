'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    {
        id: 1,
        question: "How do I check in to my booked space?",
        answer: "Checking in is easy! Open your 'My Bookings' page, find your active booking, and click the 'Check In' button. You can also scan the QR code located at the desk/room entrance using the QR scanner in the app."
    },
    {
        id: 2,
        question: "Can I cancel a booking?",
        answer: "Yes, you can cancel a booking up to 30 minutes before the start time. Go to 'My Bookings', find the reservation, and click 'Cancel'. Refunds are processed automatically if applicable."
    },
    {
        id: 3,
        question: "What operating hours are the spaces open?",
        answer: "The workspaces are accessible 24/7 for members. However, specific amenities like the cafe or support desk operate from 8:00 AM to 8:00 PM."
    },
    {
        id: 4,
        question: "Do I need to bring my own monitor?",
        answer: "Most 'Pro' workspaces come equipped with 27-inch 4K monitors and USB-C docks. Check the space details before booking to see exactly what's included."
    },
    {
        id: 5,
        question: "Is printing included?",
        answer: "Basic black & white printing is free. Color printing requires credits which can be purchased from the admin dashboard."
    },
    {
        id: 6,
        question: "How do I reset my password?",
        answer: "Currently, account management is handled by your organization's admin. Please contact your office manager or IT support to request a password reset."
    }
];

export default function FAQPage() {
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (id) => {
        setOpenItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="min-h-full px-4 sm:px-6 md:px-8 py-8 md:py-10 bg-[#FFFEF8]" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

            {/* Background Aesthetics - Matching other pages */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#E0F2FE] rounded-full blur-[80px]" />
                <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-[#FFEDD5] rounded-full blur-[60px]" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto">

                {/* Header - Centered F&Q */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl md:text-8xl font-black text-black tracking-widest" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
                        F&Q
                    </h1>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {faqs.map((faq) => {
                        const isOpen = openItems[faq.id];

                        return (
                            <div
                                key={faq.id}
                                className={`bg-white border-[3px] border-black rounded-[24px] overflow-hidden transition-all duration-200 ${isOpen ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
                            >
                                <button
                                    onClick={() => toggleItem(faq.id)}
                                    className="w-full text-left p-6 flex justify-between gap-4"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 font-black text-lg">
                                            {faq.id}
                                        </div>
                                        <span className="font-black text-xl text-black uppercase tracking-tight py-1.5 flex-1 leading-tight">
                                            {faq.question}
                                        </span>
                                    </div>

                                    <div className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center shrink-0 transition-all duration-200 ${isOpen ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                        {isOpen ? <ChevronUp size={20} className="stroke-[3]" /> : <ChevronDown size={20} className="stroke-[3]" />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-6 pb-6 pl-[5.5rem] pr-8 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <p className="text-sm font-bold text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
