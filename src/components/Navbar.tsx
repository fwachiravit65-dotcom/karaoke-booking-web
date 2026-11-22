'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MemberProfile, getCurrentMember } from '@/lib/member-store';

export default function Navbar() {
  const [member, setMember] = useState<MemberProfile | null>(null);

  useEffect(() => {
    setMember(getCurrentMember());
    const handleSync = () => setActiveMemberState();
    const setActiveMemberState = () => setMember(getCurrentMember());
    window.addEventListener('mood-auth-change', handleSync);
    return () => window.removeEventListener('mood-auth-change', handleSync);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#F7F5F0]/95 backdrop-blur-md hairline-b">
      {/* Main Top Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Brand Wordmark MOOD. + Karaoke Room */}
        <div className="flex items-baseline gap-3 sm:gap-4">
          <Link href="/" className="group flex items-baseline gap-0.5">
            <span className="font-display text-2xl sm:text-3xl tracking-tight text-[#121212] leading-none">
              MOOD
            </span>
            <span className="text-[#D9381E] font-display text-2xl sm:text-3xl leading-none">
              .
            </span>
          </Link>
          <span className="font-tech text-[11px] sm:text-xs text-[#68645E] pl-3 sm:pl-4 hairline-l">
            Karaoke Room
          </span>
        </div>

        {/* Desktop Nav + Mobile CTA */}
        <nav className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/#spaces"
            className="link-editorial text-xs sm:text-sm font-medium text-[#121212] hidden md:inline-block"
          >
            <span className="font-tech text-[11px] text-[#68645E] mr-1.5">01</span>
            ห้องทั้งหมด
          </Link>

          <Link
            href="/status"
            className="link-editorial text-xs sm:text-sm font-medium text-[#121212] hidden md:inline-block"
          >
            <span className="font-tech text-[11px] text-[#68645E] mr-1.5">02</span>
            เช็คคิวจอง
          </Link>

          <Link
            href="/member"
            className="link-editorial text-xs sm:text-sm font-medium text-[#121212] hidden md:flex items-center gap-1.5"
          >
            <span className="font-tech text-[11px] text-[#D9381E]">03</span>
            {member ? (
              <span className="font-medium">
                {member.name.split(' ')[0]}{' '}
                <span className="font-tech text-[11px] px-2 py-0.5 rounded-full bg-[#EFECE6] hairline-all text-[#D9381E]">
                  {member.totalHoursAccumulated % 10}/10H
                </span>
              </span>
            ) : (
              <span>สมาชิก (PIN)</span>
            )}
          </Link>

          <Link
            href="/booking"
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] text-xs sm:text-sm font-semibold tracking-tight editorial-transition flex items-center gap-1.5"
          >
            <span>จองห้อง</span>
            <span>→</span>
          </Link>
        </nav>
      </div>

      {/* Mobile-Only Quick Navigation Strip (Shows cleanly on phones < 768px) */}
      <div className="md:hidden grid grid-cols-3 hairline-t bg-[#EFECE6]/60 text-center text-xs font-semibold">
        <Link
          href="/#spaces"
          className="py-2.5 hairline-r text-[#121212] active:bg-[#121212] active:text-[#F7F5F0]"
        >
          <span className="text-[10px] text-[#68645E] mr-1">01</span>
          ห้องทั้งหมด
        </Link>
        <Link
          href="/status"
          className="py-2.5 hairline-r text-[#121212] active:bg-[#121212] active:text-[#F7F5F0]"
        >
          <span className="text-[10px] text-[#68645E] mr-1">02</span>
          เช็คคิวจอง
        </Link>
        <Link
          href="/member"
          className="py-2.5 text-[#121212] active:bg-[#121212] active:text-[#F7F5F0] truncate px-1"
        >
          <span className="text-[10px] text-[#D9381E] mr-1">03</span>
          {member ? `${member.name.split(' ')[0]} (${member.totalHoursAccumulated % 10}/10)` : 'สมาชิก (PIN)'}
        </Link>
      </div>
    </header>
  );
}
