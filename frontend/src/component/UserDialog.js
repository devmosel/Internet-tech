'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Eye, EyeOff } from 'lucide-react';
import { getAllDepartments } from '@/services/departmentService';

export default function UserDialog({ isOpen, onClose, mode = 'create', userData = null, onSubmit, isManager = false }) {
    const modalRef = useRef(null);
    const backdropRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [errors, setErrors] = useState({});
    const [countryCode, setCountryCode] = useState('+49');

    // Country codes with flags
    const countryCodes = [
        { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
        { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
        { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA' },
        { code: '+44', country: 'GB', flag: '🇬🇧', name: 'UK' },
        { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
    ];

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'employee',
        department_id: '',
        status: true
    });

    // Password visibility toggle
    const [showPassword, setShowPassword] = useState(false);

    // Fetch departments on mount (only for non-managers)
    useEffect(() => {
        // Skip fetching departments if user is a manager
        if (isManager) return;

        const fetchDepartments = async () => {
            try {
                const response = await getAllDepartments();
                if (response.success && response.data) {
                    setDepartments(response.data);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchDepartments();
    }, [isManager]);

    // Populate form data when editing
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && userData) {
                // Extract country code from phone number
                const userPhone = userData.phone || '';
                const matchedCountry = countryCodes.find(c => userPhone.startsWith(c.code));
                if (matchedCountry) {
                    setCountryCode(matchedCountry.code);
                    setFormData({
                        username: userData.username || '',
                        email: userData.email || '',
                        password: '', // Password not included in edit mode
                        phone: userPhone.replace(matchedCountry.code, '').trim(),
                        role: userData.role || 'employee',
                        department_id: userData.department_id || '',
                        status: userData.is_active !== undefined ? userData.is_active : true
                    });
                } else {
                    setFormData({
                        username: userData.username || '',
                        email: userData.email || '',
                        password: '',
                        phone: userPhone,
                        role: userData.role || 'employee',
                        department_id: userData.department_id || '',
                        status: userData.is_active !== undefined ? userData.is_active : true
                    });
                }
            } else {
                // Reset form for create mode - completely empty
                setCountryCode('+49');
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'employee',
                    department_id: '',
                    status: true
                });
            }
            setErrors({});
        }
    }, [mode, userData, isOpen]);

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

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (mode === 'create' && !formData.password.trim()) {
            newErrors.password = 'Password is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        }

        // Only validate department_id for non-managers (superadmin/admin)
        if (!isManager && !formData.department_id) {
            newErrors.department_id = 'Department is required';
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
            // Prepare data based on mode
            const submitData = {
                username: formData.username,
                email: formData.email,
                phone: `${countryCode}${formData.phone}`, // Combine country code with phone
                is_active: formData.status
            };

            // Only include role and department for non-managers (superadmin/admin)
            if (!isManager) {
                submitData.role = formData.role;
                submitData.department_id = parseInt(formData.department_id);
            }

            // Only include password in create mode
            if (mode === 'create') {
                submitData.password = formData.password;
            } else if (mode === 'edit' && formData.password.trim()) {
                // Include password in edit mode only if a new password is provided
                submitData.password = formData.password;
            }

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
                className="relative bg-white border-[3px] border-black rounded-2xl w-full max-w-[520px] overflow-hidden"
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
                        {mode === 'create' ? 'Add New User' : 'Edit User'}
                    </h2>
                    <p className="text-white/70 font-medium text-sm mt-1">
                        {mode === 'create' ? 'Enter user details below' : 'Update existing user information'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-8 bg-[#FFFEF8]">
                    <div className="flex flex-col gap-5">
                        {/* Username */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className={`h-12 px-4 bg-white border-2 ${errors.username ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}
                                placeholder="Enter username"
                                autoComplete="off"
                            />
                            {errors.username && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`h-12 px-4 bg-white border-2 ${errors.email ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}
                                placeholder="Enter email"
                            />
                            {errors.email && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                                    {errors.email}
                                </p>
                            )}
                        </div>


                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Password {mode === 'edit' && <span className="text-gray-400 normal-case text-xs">(Leave blank to keep current)</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`h-12 px-4 pr-12 bg-white border-2 ${errors.password ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all w-full`}
                                    placeholder={mode === 'create' ? 'Enter password' : 'Enter new password (optional)'}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} className="text-gray-600" strokeWidth={2.5} />
                                    ) : (
                                        <Eye size={18} className="text-gray-600" strokeWidth={2.5} />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Phone
                            </label>
                            <div className="flex gap-3">
                                {/* Country Code Selector */}
                                <div className="relative">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="h-12 pl-3 pr-8 bg-white border-2 border-black rounded-xl text-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none cursor-pointer min-w-[100px]"
                                    >
                                        {countryCodes.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.flag} {country.code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                                {/* Phone Number Input */}
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`flex-1 h-12 px-4 bg-white border-2 ${errors.phone ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                                    {errors.phone}
                                </p>
                            )}
                        </div>


                        {/* Role & Department Row - Hidden for managers */}
                        {!isManager && (
                            <div className="grid grid-cols-2 gap-4">
                                {/* Role */}
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-sm uppercase tracking-wider text-black">
                                        Role
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.role}
                                            onChange={(e) => handleInputChange('role', e.target.value)}
                                            className="w-full h-12 px-4 bg-white border-2 border-black rounded-xl text-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="employee">Employee</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Department */}
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-sm uppercase tracking-wider text-black">
                                        Department
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.department_id}
                                            onChange={(e) => handleInputChange('department_id', e.target.value)}
                                            className={`w-full h-12 px-4 bg-white border-2 ${errors.department_id ? 'border-red-500' : 'border-black'} rounded-xl text-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none cursor-pointer`}
                                        >
                                            <option value="">Select Dept</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.department_id && (
                                        <p className="text-xs font-bold text-red-500 absolute -bottom-5 left-0 w-full truncate">
                                            Required
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm uppercase tracking-wider text-black">
                                Status
                            </label>
                            <div className="flex items-center gap-3 bg-white p-1 rounded-xl border-2 border-black">
                                <button
                                    type="button"
                                    onClick={() => handleInputChange('status', true)}
                                    className={`flex-1 h-10 rounded-lg text-sm font-black uppercase tracking-wider transition-all border-2 ${formData.status
                                        ? 'bg-green-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]'
                                        : 'bg-transparent border-transparent text-gray-400 hover:text-black'
                                        }`}
                                >
                                    Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleInputChange('status', false)}
                                    className={`flex-1 h-10 rounded-lg text-sm font-black uppercase tracking-wider transition-all border-2 ${!formData.status
                                        ? 'bg-red-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]'
                                        : 'bg-transparent border-transparent text-gray-400 hover:text-black'
                                        }`}
                                >
                                    Inactive
                                </button>
                            </div>
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
                                mode === 'create' ? 'Create User' : 'Update User'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
