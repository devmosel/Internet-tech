'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks';
import { getUserDisplayName, getUserInitials } from '@/utils/user';
import { User, Mail, Phone, Building2, Shield, Camera } from 'lucide-react';

export default function ProfilePage() {
    const { currentUser, isLoading } = useCurrentUser();

    // Form state - initialized with current user data
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        department: ''
    });

    // Track if form is in edit mode
    const [isEditing, setIsEditing] = useState(false);

    // Initialize form data when user loads
    useState(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || currentUser.username || '',
                phone: currentUser.phone || '',
                department: currentUser.department || ''
            });
        }
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // TODO: Implement API call to update user profile
        console.log('Saving profile:', formData);
        setIsEditing(false);
        // Show success toast here
    };

    const handleCancel = () => {
        // Reset form to original user data
        if (currentUser) {
            setFormData({
                name: currentUser.name || currentUser.username || '',
                phone: currentUser.phone || '',
                department: currentUser.department || ''
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-full px-4 sm:px-6 md:px-8 py-8 md:py-10 bg-[#FFFEF8]" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

            {/* Background Aesthetics */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#E0F2FE] rounded-full blur-[80px]" />
                <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-[#DCFCE7] rounded-full blur-[60px]" />
            </div>

            <div className="relative z-10 w-full">

                {/* Header */}
                <div className="mb-12">
                    <p className="text-gray-500 font-medium mb-1 pl-1">
                        Account Settings
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
                        MY <span className="text-gray-400">PROFILE</span>
                    </h1>
                </div>

                {/* Profile Card - Full Width */}
                <div className="bg-white border-[3px] border-black rounded-[24px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">

                    {/* Avatar Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-8 border-b-[3px] border-black">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center text-white border-[3px] border-black overflow-hidden">
                                    {currentUser?.avatar ? (
                                        <img
                                            src={currentUser.avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-black">{getUserInitials(currentUser)}</span>
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Camera size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">
                                    {getUserDisplayName(currentUser)}
                                </h2>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-lg text-sm font-bold uppercase tracking-wider">
                                        <Shield size={14} strokeWidth={2.5} />
                                        {currentUser?.role || 'User'}
                                    </span>
                                    {currentUser?.department && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border-2 border-black rounded-lg text-sm font-bold uppercase tracking-wider">
                                            <Building2 size={14} strokeWidth={2.5} />
                                            {currentUser.department}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <div className="space-y-6">

                            {/* Full Name */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-2">
                                    <User size={16} strokeWidth={2.5} />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-2">
                                    <Mail size={16} strokeWidth={2.5} />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={currentUser?.email || ''}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1 ml-1">Email cannot be changed</p>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-2">
                                    <Phone size={16} strokeWidth={2.5} />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
                                    placeholder="+49 123 456 7890"
                                />
                            </div>

                            {/* Department */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-2">
                                    <Building2 size={16} strokeWidth={2.5} />
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
                                    placeholder="Engineering, Marketing, etc."
                                />
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8 pt-8 border-t-2 border-gray-100">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-black text-white border-[3px] border-black rounded-xl px-6 py-4 font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 bg-white text-black border-[3px] border-black rounded-xl px-6 py-4 font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 bg-black text-white border-[3px] border-black rounded-xl px-6 py-4 font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
