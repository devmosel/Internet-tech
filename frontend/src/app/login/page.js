'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, Suspense } from 'react';
import { gsap } from 'gsap';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/auth';
import { login } from '@/services/authService';

function LoginForm() {
  const formRef = useRef(null);
  const imageRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Get redirect parameter if exists
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Check authentication IMMEDIATELY on mount
  useEffect(() => {
    if (auth.isAuthenticated()) {
      // User already logged in, redirect immediately
      window.location.href = '/dashboard';
    } else {
      // Not authenticated, show login form
      setIsCheckingAuth(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the login service instead of direct fetch
      const data = await login(formData.username, formData.password);
      
      console.log('Login successful, redirecting to:', redirectTo);
      
      // Redirect to intended destination or dashboard
      window.location.href = redirectTo;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip animations if checking auth
    if (isCheckingAuth) return;

    // Form Animation
    const formElements = formRef.current?.querySelectorAll('.animate-form');
    if (formElements) {
      gsap.fromTo(formElements,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.2
        }
      );
    }

    // Image Animation
    if (imageRef.current) {
      gsap.fromTo(imageRef.current,
        { opacity: 0, scale: 1.1 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power2.out'
        }
      );

      // Text overlay animation
      const textOverlay = imageRef.current.querySelector('.text-overlay');
      if (textOverlay) {
        gsap.fromTo(textOverlay,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.5,
            ease: 'power2.out'
          }
        );
      }
    }
  }, [isCheckingAuth]);

  // Show nothing while checking authentication (prevents flash)
  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="bg-[#FFFEF8] relative w-full h-screen overflow-hidden" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Left Section - Login Form */}
      <div ref={formRef} className="absolute h-[520px] left-[143.25px] top-[231.5px] w-[448px]">
        {/* Back to home button */}
        <Link href="/">
          <div className="absolute h-[24px] left-0 top-0 w-[123.312px] cursor-pointer animate-form group">
            <div className="absolute left-0 w-[16px] h-[16px] top-[4px]">
              <svg className="block max-w-none w-full h-full transition-transform group-hover:-translate-x-1" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="absolute font-sans font-medium leading-[24px] left-[24px] text-[16px] text-[rgba(0,0,0,0.6)] whitespace-nowrap top-[-0.5px] tracking-[-0.3125px] group-hover:text-black transition-colors">
              Back to home
            </p>
          </div>
        </Link>

        {/* Header */}
        <div className="absolute flex flex-col gap-[8px] h-[62px] left-0 top-[72px] w-[448px] animate-form">
          <div className="h-[30px] relative w-full">
            <p className="absolute font-black leading-[30px] left-0 text-[32px] text-black whitespace-nowrap top-0 tracking-tight" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
              openBO
            </p>
          </div>
          <div className="h-[24px] relative w-full">
            <p className="absolute font-sans font-medium leading-[24px] left-0 text-[16px] text-[rgba(0,0,0,0.5)] whitespace-nowrap top-[-0.5px] tracking-[-0.3125px]">
              Welcome back 👋
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="absolute flex flex-col gap-[24px] h-[354px] left-0 top-[166px] w-[448px] animate-form">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-xl text-sm font-medium shadow-[4px_4px_0px_0px_rgba(239,68,68,0.3)]">
              ⚠️ {error}
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-[8px] h-[58px] w-full">
            <div className="flex gap-[8px] h-[14px] items-center w-full">
              <p className="font-sans font-bold leading-[14px] text-[14px] text-black whitespace-nowrap tracking-[-0.1504px]">
                Username
              </p>
            </div>
            <input 
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="bg-white border-2 border-black h-[44px] rounded-xl px-[16px] py-[4px] font-sans font-medium text-[14px] text-black tracking-[-0.1504px] outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-[8px] h-[64px] w-full">
            <div className="flex h-[20px] items-center justify-between w-full">
              <div className="h-[14px]">
                <p className="font-sans font-bold leading-[14px] text-[14px] text-black whitespace-nowrap tracking-[-0.1504px]">
                  Password
                </p>
              </div>
              <button type="button" className="h-[20px] hover:underline transition-all">
                <p className="font-sans font-medium leading-[20px] text-[14px] text-[rgba(0,0,0,0.5)] whitespace-nowrap tracking-[-0.1504px] hover:text-black">
                  Forgot password?
                </p>
              </button>
            </div>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="bg-white border-2 border-black h-[44px] rounded-xl px-[16px] py-[4px] font-sans font-medium text-[14px] text-black tracking-[-0.1504px] outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Sign in Button */}
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black h-[48px] rounded-xl w-full font-bold text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <p className="font-sans font-bold leading-[20px] text-[16px] text-white tracking-[-0.1504px]">
              {loading ? '⏳ Signing in...' : '🚀 Sign in'}
            </p>
          </button>

          {/* Divider */}
          <div className="h-[16px] relative w-full">
            <div className="absolute bg-[rgba(0,0,0,0.15)] h-[2px] left-0 top-[7.5px] w-full" />
            <div className="absolute bg-[#FFFEF8] h-[16px] left-1/2 top-0 -translate-x-1/2 px-3">
              <p className="font-sans font-bold leading-[16px] text-black text-[12px] whitespace-nowrap uppercase tracking-wider">
                Or continue with
              </p>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-[12px] h-[44px] w-full">
            <button className="bg-white border-2 border-black rounded-xl flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all">
              <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                <path d="M15.68 8.18182C15.68 7.61455 15.6291 7.06909 15.5345 6.54545H8V9.64364H12.3055C12.12 10.64 11.5564 11.4836 10.7091 12.0509V14.0655H13.2945C14.8073 12.6691 15.68 10.6182 15.68 8.18182Z" fill="#4285F4"/>
                <path d="M8 16C10.16 16 11.9709 15.2873 13.2945 14.0655L10.7091 12.0509C9.99273 12.5309 9.07636 12.8218 8 12.8218C5.91636 12.8218 4.15273 11.4182 3.52364 9.52727H0.850909V11.5927C2.16727 14.2036 4.87273 16 8 16Z" fill="#34A853"/>
                <path d="M3.52364 9.52C3.36364 9.04 3.27273 8.52727 3.27273 8C3.27273 7.47273 3.36364 6.96 3.52364 6.48V4.41455H0.850909C0.309091 5.49091 0 6.70909 0 8C0 9.29091 0.309091 10.5091 0.850909 11.5855L2.91636 9.97091L3.52364 9.52Z" fill="#FBBC05"/>
                <path d="M8 3.18182C9.17818 3.18182 10.2255 3.58545 11.0291 4.34545L13.3527 2.02182C11.9636 0.72 10.1527 0 8 0C4.87273 0 2.16727 1.79636 0.850909 4.41455L3.52364 6.48C4.15273 4.58909 5.91636 3.18182 8 3.18182Z" fill="#EA4335"/>
              </svg>
              <p className="font-sans font-bold leading-[20px] text-[14px] text-black tracking-[-0.1504px]">
                Google
              </p>
            </button>
            <button className="bg-white border-2 border-black rounded-xl flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all">
              <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                <path d="M13.9142 5.32443C13.5507 5.32443 13.1872 5.40871 12.8596 5.57727C12.5681 5.72776 12.3126 5.9474 12.1113 6.21816C11.9099 6.48893 11.7681 6.80337 11.6962 7.13586C11.6242 7.46835 11.6243 7.81067 11.6964 8.14313C11.7684 8.47558 11.9103 8.78998 12.1117 9.06068C12.3132 9.33139 12.5687 9.55095 12.8603 9.70132C13.1518 9.8517 13.4725 9.92915 13.797 9.92915C14.1216 9.92915 14.4423 9.8517 14.7338 9.70132C15.0253 9.55095 15.2809 9.33139 15.4823 9.06068C15.6837 8.78998 15.8257 8.47558 15.8977 8.14313C15.9698 7.81067 15.9699 7.46835 15.8979 7.13586C15.826 6.80337 15.6842 6.48893 15.4828 6.21816C15.2815 5.9474 15.026 5.72776 14.7345 5.57727C14.4069 5.40871 14.0434 5.32443 13.6799 5.32443H13.9142Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M11.1528 1.51515C10.5213 0.519048 9.36165 0 8.13636 0C6.64772 0 5.27367 0.693939 4.40909 1.84848C3.54451 3.00303 3.27273 4.5303 3.60606 5.89697C1.41818 5.89697 0 7.31515 0 9.50303C0 11.697 1.41818 13.1152 3.61212 13.1152H6.78788C7.07879 13.1152 7.35758 12.9994 7.56364 12.7934C7.7697 12.5873 7.88485 12.3085 7.88485 12.0176V6.98485C7.88485 6.69394 7.7697 6.41515 7.56364 6.20909C7.35758 6.00303 7.07879 5.88788 6.78788 5.88788H5.03636C5.27051 5.12476 5.77632 4.47286 6.46133 4.04737C7.14635 3.62188 7.96519 3.45238 8.76265 3.56702C9.56011 3.68166 10.288 4.07293 10.8188 4.66893C11.3495 5.26493 11.6479 6.02693 11.6606 6.81818V8.53939C11.6606 8.8303 11.7758 9.10909 11.9818 9.31515C12.1879 9.52121 12.4667 9.63636 12.7576 9.63636C13.0485 9.63636 13.3273 9.75151 13.5333 9.95758C13.7394 10.1636 13.8545 10.4424 13.8545 10.7333C13.8545 11.0242 13.7394 11.303 13.5333 11.5091C13.3273 11.7152 13.0485 11.8303 12.7576 11.8303H11.6364C11.3455 11.8303 11.0667 11.9455 10.8606 12.1515C10.6546 12.3576 10.5394 12.6364 10.5394 12.9273C10.5394 13.2182 10.6546 13.497 10.8606 13.7031C11.0667 13.9091 11.3455 14.0242 11.6364 14.0242H12.7576C13.6262 14.0242 14.4591 13.6797 15.0774 13.0614C15.6957 12.4431 16.0424 11.6102 16.0424 10.7415C16.0424 9.87291 15.6979 9.03999 15.0796 8.42169C14.4613 7.80338 13.6284 7.45879 12.7597 7.45879H11.6606V6.81818C11.6501 5.82909 11.3333 4.87273 10.7515 4.08485C10.6182 3.89697 10.4727 3.72121 10.3152 3.55758C10.7273 2.81212 11.0485 2.12121 11.1528 1.51515Z" fill="currentColor"/>
              </svg>
              <p className="font-sans font-bold leading-[20px] text-[14px] text-black tracking-[-0.1504px]">
                Apple
              </p>
            </button>
          </div>

          {/* Sign up link */}
          <div className="h-[24px] relative w-full flex items-center justify-center gap-2">
            <p className="font-sans font-medium leading-[20px] text-[14px] text-[rgba(0,0,0,0.5)] tracking-[-0.1504px]">
              Don't have an account?
            </p>
            <Link href="/login">
              <button className="font-sans font-bold leading-[24px] text-[16px] text-black tracking-[-0.3125px] hover:underline decoration-2 underline-offset-2">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section - Image and Text */}
      <div ref={imageRef} className="absolute bg-[#ececf0] h-full right-0 top-0 w-1/2">
        <div className="absolute h-full left-0 top-0 w-full">
          <div className="absolute h-full left-0 top-0 w-full">
            <Image 
              src="/login-workspace.png" 
              alt="Modern workspace setup" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute h-full left-0 top-0 w-full bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        
        {/* Bottom text overlay */}
        <div className="absolute flex flex-col gap-[16px] h-[91px] left-[64px] bottom-[64px] w-[calc(100%-128px)] max-w-[448px] text-overlay">
          <div className="h-[27px] relative w-full">
            <p className="font-sans font-medium leading-[27px] text-[18px] text-white tracking-[-0.4395px]">
              Streamline your workspace booking
            </p>
          </div>
          <div className="relative w-full">
            <p className="font-sans font-normal leading-[24px] text-[16px] text-[rgba(255,255,255,0.8)] tracking-[-0.3125px]">
              Join teams worldwide who trust openBO to manage their open-space office bookings with ease and efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

