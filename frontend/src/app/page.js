'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- Components ---

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "h-12 px-6 rounded-xl font-medium text-base transition-all duration-300 border-[3px] border-black flex items-center justify-center gap-2 relative active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white";

  const variants = {
    primary: "bg-[#030213] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
    secondary: "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
    ghost: "bg-transparent border-transparent shadow-none hover:bg-black/5 !h-auto !px-4 !py-2"
  };

  return (
    <button className={`btn-animate ${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <div className="feature-card bg-white rounded-[24px] p-8 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300 group h-full flex flex-col relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FFD233] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 scale-0 group-hover:scale-150 transform origin-center" />

      <div className="bg-[#FFD233] w-14 h-14 rounded-xl border-[3px] border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform duration-500 ease-elastic-out">
        {icon}
      </div>
      <h3 className="font-['Tanker-Regular'] text-2xl text-black mb-3 tracking-wide relative z-10">
        {title}
      </h3>
      <p className="font-sans text-base text-black/70 leading-relaxed font-medium relative z-10">
        {description}
      </p>
    </div>
  );
};

// --- Main Page ---

export default function LandingPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);

  // Interactive Tilt Logic for Hero Image
  useEffect(() => {
    const heroSection = heroRef.current;
    if (!heroSection) return;

    const handleMouseMove = (e) => {
      if (!heroImageRef.current) return;

      const { clientX, clientY } = e;
      const { left, top, width, height } = heroSection.getBoundingClientRect();
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      gsap.to(heroImageRef.current, {
        rotationY: x * 10,  // Tilt left/right
        rotationX: -y * 10, // Tilt up/down
        x: x * 20,
        y: y * 20,
        duration: 0.5,
        ease: "power2.out",
        transformPerspective: 1000
      });
    };

    const handleMouseLeave = () => {
      if (!heroImageRef.current) return;
      gsap.to(heroImageRef.current, {
        rotationY: 0,
        rotationX: 0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
      });
    };

    heroSection.addEventListener('mousemove', handleMouseMove);
    heroSection.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      heroSection.removeEventListener('mousemove', handleMouseMove);
      heroSection.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Main GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {

      // 1. Floating Shapes Animation (Background)
      const shapes = gsap.utils.toArray('.floating-shape');
      shapes.forEach((shape, i) => {
        gsap.to(shape, {
          y: "random(-50, 50)",
          rotation: "random(-20, 20)",
          duration: "random(3, 6)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2
        });
      });

      // 2. Hero Cards Staggered Entrance
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Main hero card slides up
      heroTl.from('.hero-card', {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "back.out(1.2)"
      });

      // Badge pops in
      heroTl.from('.hero-badge', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(2)"
      }, "-=0.8");

      // Text lines reveal with smooth slide
      heroTl.from('.hero-text-line', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.out"
      }, "-=0.5");

      // Buttons pop in
      heroTl.from('.hero-btn', {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.5)"
      }, "-=0.4");

      // 3. Counter Animation
      const counters = document.querySelectorAll('.counter');
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        gsap.to(counter, {
          innerHTML: target,
          duration: 2,
          delay: 1,
          snap: { innerHTML: 1 },
          ease: "power2.out",
          modifiers: {
            innerHTML: (value) => Math.round(value).toLocaleString() + "+"
          }
        });
      });

      // 4. Stars Twinkle Animation
      gsap.utils.toArray('.star-icon').forEach((star, i) => {
        gsap.fromTo(star,
          { scale: 0, rotation: -180 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.4,
            delay: 1.2 + (i * 0.1),
            ease: "back.out(3)"
          }
        );
      });

      // 5. Activity bars pulse
      gsap.utils.toArray('.activity-bar').forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: gsap.utils.random(0.5, 1.5),
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: i * 0.15
        });
      });

      // 6. Avatar pulse effect
      gsap.utils.toArray('.avatar-pulse').forEach((avatar, i) => {
        gsap.to(avatar, {
          scale: 1.05,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.3
        });
      });

      // 7. Feature pills hover-ready state
      gsap.utils.toArray('.feature-pill').forEach((pill) => {
        pill.addEventListener('mouseenter', () => {
          gsap.to(pill, { scale: 1.02, duration: 0.3, ease: "power2.out" });
        });
        pill.addEventListener('mouseleave', () => {
          gsap.to(pill, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
      });

      // 8. Magnetic button effect for CTA
      gsap.utils.toArray('.magnetic-btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, {
            x: x * 0.15,
            y: y * 0.15,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)"
          });
        });
      });

      // 4. Feature Cards Interaction
      gsap.utils.toArray('.feature-card-wrapper').forEach((card, i) => {
        gsap.fromTo(card,
          {
            opacity: 0,
            y: 100,
            rotation: gsap.utils.random(-5, 5)
          },
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.8,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse"
            },
            delay: i * 0.1
          }
        );
      });

      // 5. How It Works - Connecting Line Animation
      gsap.from('.step-line', {
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.5,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: '#how-it-works',
          start: "top 60%"
        }
      });

      // 6. Step Items Pop-in
      gsap.utils.toArray('.step-item').forEach((step, i) => {
        gsap.from(step, {
          x: -50,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: step,
            start: "top 85%"
          },
          delay: i * 0.2
        });
      });

      // 7. CTA Parallax Text
      gsap.to('.cta-text', {
        backgroundPosition: '0% 100%',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Button Hover Effect (Magnetic-ish)
  const handleBtnHover = (e) => {
    const btn = e.currentTarget;
    gsap.to(btn, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleBtnLeave = (e) => {
    const btn = e.currentTarget;
    gsap.to(btn, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <div ref={containerRef} className="bg-[#FFFEF8] relative w-full min-h-screen font-sans text-black overflow-x-hidden selection:bg-[#FFD233] selection:text-black">

      {/* Background Floating Decor */}
      <div className="absolute top-20 left-10 w-20 h-20 border-[3px] border-black rounded-full text-[#E0E7FF] opacity-50 floating-shape z-0 pointer-events-none" />
      <div className="absolute top-40 right-20 w-12 h-12 bg-[#FFD233] border-[3px] border-black rotate-12 floating-shape z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-orange-400 border-[3px] border-black rounded-full floating-shape z-0 pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FFFEF8]/90 backdrop-blur-md border-b-[3px] border-black px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <h1 className="font-['Tanker-Regular'] text-3xl md:text-4xl text-black tracking-wide group-hover:scale-105 transition-transform duration-300">
              openBO
            </h1>
          </Link>

          <div className="hidden md:flex gap-8 items-center bg-white border-[3px] border-black px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <Link href="#features" className="font-bold text-sm uppercase tracking-wider text-black hover:text-[#FFD233] transition-colors relative overflow-hidden">
              Features
            </Link>
            <Link href="#how-it-works" className="font-bold text-sm uppercase tracking-wider text-black hover:text-[#FFD233] transition-colors">
              How it works
            </Link>
            <Link href="#pricing" className="font-bold text-sm uppercase tracking-wider text-black hover:text-[#FFD233] transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="hidden sm:block">
              <span className="font-bold text-sm uppercase tracking-wide hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">
                Sign in
              </span>
            </Link>
            <Link href="/login">
              <Button className="!h-10 !px-4 !text-sm" onMouseEnter={handleBtnHover} onMouseLeave={handleBtnLeave}>
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="flex items-center justify-center py-12 md:py-20 px-4 relative z-10">
        <div className="w-full max-w-7xl">
          {/* Main Hero Grid - Bento Style */}
          <div className="grid grid-cols-12 gap-4 lg:gap-6 mb-0">

            {/* Left Column - Main Content (spans 7 cols on desktop) */}
            <div className="col-span-12 lg:col-span-7 space-y-6">

              {/* Main Hero Card */}
              <div className="hero-card bg-white rounded-[32px] p-8 lg:p-12 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD233]/5 via-transparent to-[#FF6B35]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Badge */}
                <div className="hero-badge inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-sm font-semibold tracking-wide">500+ companies trust us</span>
                </div>

                {/* Headline */}
                <div className="space-y-3 mb-8 relative z-10">
                  <div className="overflow-hidden">
                    <h1 className="hero-text-line font-['Tanker-Regular'] text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-black leading-[1.1]">
                      Your workspace,
                    </h1>
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="hero-text-line font-['Tanker-Regular'] text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F7931E]">perfectly</span>
                      <span className="text-black"> organized</span>
                    </h1>
                  </div>
                </div>

                {/* Description */}
                <p className="hero-text-line text-lg md:text-xl text-black/60 max-w-[500px] leading-relaxed font-medium mb-10">
                  Book desks, meeting rooms, and more in seconds. The modern way to manage your office space.
                </p>

                {/* CTA Row */}
                <div className="flex flex-wrap gap-4 hero-btn">
                  <Link href="/login">
                    <button
                      className="magnetic-btn group h-14 px-8 bg-black text-white rounded-2xl font-bold text-base border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                    >
                      Start for free
                      <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </Link>
                  <button className="magnetic-btn h-14 px-6 bg-transparent text-black rounded-2xl font-bold text-base border-[3px] border-black/10 hover:border-black hover:bg-black/5 transition-all duration-300 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#FF6B35]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    Watch demo
                  </button>
                </div>
              </div>

              {/* Bottom Row - Two Small Cards */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {/* Stats Card */}
                <div className="hero-card stat-card bg-[#E0E7FF] rounded-[24px] p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-xl border-2 border-black flex items-center justify-center">
                      <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="font-['Tanker-Regular'] text-3xl lg:text-4xl text-black counter" data-target="2500">0</span>
                  </div>
                  <p className="text-sm font-semibold text-black/70">Active users booking daily</p>
                </div>

                {/* Rating Card */}
                <div className="hero-card stat-card bg-[#FFD233] rounded-[24px] p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-5 h-5 text-black star-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-['Tanker-Regular'] text-2xl text-black mb-1">4.9 / 5</p>
                  <p className="text-sm font-semibold text-black/70">Based on 1,200+ reviews</p>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Cards (spans 5 cols on desktop) */}
            <div className="col-span-12 lg:col-span-5 grid gap-4 lg:gap-6">

              {/* Main Image Card */}
              <div ref={heroImageRef} className="hero-card relative h-[300px] lg:h-[340px] bg-white rounded-[32px] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
                <Image
                  src="/hero-image.png"
                  alt="Modern workspace"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Floating notification */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border-[2px] border-black rounded-xl p-3 shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-400 rounded-full border-[2px] border-black flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-black truncate">Desk A-12 booked!</p>
                      <p className="text-xs text-black/60">Tomorrow, 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Pills Row */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {/* Quick Book Card */}
                <div className="hero-card feature-pill bg-white rounded-[20px] p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <div className="w-12 h-12 bg-[#FF6B35] rounded-xl border-[2px] border-black flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="font-bold text-sm text-black">Quick Book</p>
                  <p className="text-xs text-black/50 mt-1">30 sec average</p>
                </div>

                {/* Floor Plan Card */}
                <div className="hero-card feature-pill bg-white rounded-[20px] p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <div className="w-12 h-12 bg-[#E0E7FF] rounded-xl border-[2px] border-black flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform duration-300">
                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="font-bold text-sm text-black">Floor Plans</p>
                  <p className="text-xs text-black/50 mt-1">Visual booking</p>
                </div>
              </div>

              {/* Live Activity Bar */}
              <div className="hero-card bg-black rounded-[20px] p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(255,210,51,0.5)] overflow-hidden relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-black flex items-center justify-center text-xs font-bold text-gray-600 avatar-pulse">
                          {['S', 'M', 'J'][i - 1]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">12 people booking now</p>
                      <p className="text-white/50 text-xs">Live activity</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`w-1.5 h-${i === 2 ? '4' : '3'} bg-green-400 rounded-full activity-bar`} style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="bg-[#E0E7FF] border-y-[3px] border-black py-16 md:py-24 px-4 overflow-hidden relative">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-20 space-y-6 relative">
            <h2 className="font-['Tanker-Regular'] text-5xl md:text-6xl text-black">
              Everything you need<br />to manage your workspace
            </h2>
            <p className="font-medium text-xl text-black/70 max-w-2xl mx-auto">
              Built for modern teams who value flexibility, collaboration, and efficiency.
            </p>

            {/* Decor Elements */}
            <div className="floating-shape absolute top-0 right-0 lg:-right-12 rotate-12 bg-[#FFD233] w-24 h-24 border-[3px] border-black rounded-full hidden lg:flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-[360deg] transition-transform duration-1000">
              <span className="text-4xl">✨</span>
            </div>
            <div className="floating-shape absolute bottom-0 left-0 lg:-left-12 -rotate-12 bg-white w-20 h-20 border-[3px] border-black rounded-lg hidden lg:flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform">
              <span className="text-4xl">🛠️</span>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card-wrapper">
              <FeatureCard
                icon={<svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                title="Smart booking"
                description="Reserve your desk in seconds with our intuitive calendar interface. Plan ahead or book on the go."
              />
            </div>

            <div className="feature-card-wrapper">
              <FeatureCard
                icon={<svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>}
                title="Visual Floor Plans"
                description="Visualize your office layout and choose the perfect spot based on location and amenities."
              />
            </div>

            <div className="feature-card-wrapper">
              <FeatureCard
                icon={<svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
                title="Instant Confirm"
                description="Get immediate booking confirmation with automatic calendar integration and notifications."
              />
            </div>

            <div className="feature-card-wrapper">
              <FeatureCard
                icon={<svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                title="Secure & Reliable"
                description="Enterprise-grade security ensures your data and bookings are always protected."
              />
            </div>

            <div className="feature-card-wrapper">
              <FeatureCard
                icon={<svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                title="Flexible Schedule"
                description="Book by the hour, day, or week. Modify or cancel reservations with ease and no hassle."
              />
            </div>

            <div className="feature-card-wrapper">
              <FeatureCard
                icon={<svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                title="Team Sync"
                description="See where your teammates are sitting and book nearby desks for better collaboration."
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-[#FFFEF8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-20 space-y-6">
            <h2 className="font-['Tanker-Regular'] text-5xl md:text-6xl text-black">
              Simple by design
            </h2>
            <p className="font-medium text-xl text-black/70 max-w-2xl mx-auto">
              Booking a workspace shouldn't be complicated. We've streamlined the process to just three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Steps */}
            <div className="space-y-12 relative">
              {/* Connecting Line (Absolute) */}
              <div className="step-line absolute left-[31px] top-6 bottom-6 w-[3px] bg-black/10 -z-10 origin-top"></div>

              {[
                { num: "01", title: "View available spaces", desc: "Browse your office layout and see which desks are available in real-time." },
                { num: "02", title: "Select your spot", desc: "Choose your preferred desk based on location, amenities, and team proximity." },
                { num: "03", title: "Confirm booking", desc: "Complete your reservation in one click and receive instant confirmation." }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-8 step-item group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-black rounded-lg translate-x-1 translate-y-1"></div>
                    <div className="bg-white w-16 h-16 rounded-lg border-[3px] border-black flex items-center justify-center flex-shrink-0 relative z-10 group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform cursor-pointer">
                      <p className="font-['Tanker-Regular'] text-3xl text-black">{step.num}</p>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1 pt-2">
                    <h3 className="font-['Tanker-Regular'] text-3xl text-black tracking-wide group-hover:text-[#FFD233] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="font-medium text-lg text-black/60">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Image */}
            <div className="relative h-[600px] w-full how-it-works-image group">
              <div className="absolute inset-0 bg-orange-400 rounded-[32px] translate-x-4 translate-y-4 border-[3px] border-black transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
              <div className="relative h-full w-full bg-white rounded-[32px] border-[3px] border-black overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/how-it-works-image.png"
                  alt="Office booking interface"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section bg-black py-24 px-4 border-t-[3px] border-black relative overflow-hidden">
        {/* Animated Background Gradient Text */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[20vw] font-['Tanker-Regular'] text-white whitespace-nowrap animate-marquee">
            BOOK NOW BOOK NOW BOOK NOW
          </span>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="font-['Tanker-Regular'] text-6xl md:text-7xl text-white leading-none">
            Ready to transform<br /><span className="text-[#FFD233] animate-pulse">your workspace?</span>
          </h2>
          <p className="font-medium text-xl text-white/80 max-w-2xl mx-auto">
            Join forward-thinking companies who have already simplified their office booking experience with openBO.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <Link href="/login">
              <button className="h-14 px-8 bg-[#FFD233] rounded-xl font-bold text-lg text-black border-[3px] border-white hover:bg-white transition-all hover:scale-110 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.6)]">
                Get started for free
              </button>
            </Link>
            <button className="h-14 px-8 bg-transparent text-white border-[3px] border-white rounded-xl font-bold text-lg hover:bg-white hover:text-black transition-all hover:scale-110 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.6)]">
              Schedule a demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FFFEF8] border-t-[3px] border-black pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Column 1 - Brand */}
            <div className="space-y-6">
              <h3 className="font-['Tanker-Regular'] text-4xl text-black">
                openBO
              </h3>
              <p className="font-medium text-base text-black/70">
                Workspace booking made simple for modern offices.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white hover:bg-[#FFD233] hover:text-black transition-colors border-2 border-transparent hover:border-black cursor-pointer hover:rotate-12 transition-transform">X</div>
                <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white hover:bg-[#FFD233] hover:text-black transition-colors border-2 border-transparent hover:border-black cursor-pointer hover:-rotate-12 transition-transform">In</div>
              </div>
            </div>

            {/* Column 2 - Product */}
            <div className="space-y-6">
              <h4 className="font-black text-lg uppercase tracking-wider text-black">
                Product
              </h4>
              <ul className="space-y-4">
                <li><Link href="#features" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">Features</Link></li>
                <li><Link href="#pricing" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">Pricing</Link></li>
                <li><Link href="#security" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">Security</Link></li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div className="space-y-6">
              <h4 className="font-black text-lg uppercase tracking-wider text-black">
                Company
              </h4>
              <ul className="space-y-4">
                <li><Link href="#about" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">About</Link></li>
                <li><Link href="#blog" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">Blog</Link></li>
                <li><Link href="#careers" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">Careers</Link></li>
              </ul>
            </div>

            {/* Column 4 - Legal */}
            <div className="space-y-6">
              <h4 className="font-black text-lg uppercase tracking-wider text-black">
                Legal
              </h4>
              <ul className="space-y-4">
                <li><Link href="#privacy" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">Privacy</Link></li>
                <li><Link href="#terms" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">Terms</Link></li>
                <li><Link href="#contact" className="font-medium hover:underline decoration-2 underline-offset-4 decoration-[#FFD233]">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t-[3px] border-black/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-bold text-sm text-black/50">
              © 2025 openBO. All rights reserved.
            </p>
            <div className="flex gap-4">
              <div className="h-3 w-3 rounded-full bg-red-400 border border-black hover:scale-150 transition-transform"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400 border border-black hover:scale-150 transition-transform"></div>
              <div className="h-3 w-3 rounded-full bg-green-400 border border-black hover:scale-150 transition-transform"></div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        
        /* Activity bar heights for dynamic sizing */
        .activity-bar:nth-child(1) { height: 12px; }
        .activity-bar:nth-child(2) { height: 18px; }
        .activity-bar:nth-child(3) { height: 10px; }
        
        /* Smooth card hover transitions */
        .hero-card {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      box-shadow 0.3s ease;
        }
        
        /* Stat card number animation */
        .stat-card .counter {
          display: inline-block;
          min-width: 80px;
        }
        
        /* Star icon base state for animation */
        .star-icon {
          transform-origin: center;
        }
        
        /* Magnetic button cursor */
        .magnetic-btn {
          cursor: pointer;
          will-change: transform;
        }
        
        /* Feature pill interaction */
        .feature-pill {
          will-change: transform, box-shadow;
        }
      `}</style>
    </div>
  );
}
