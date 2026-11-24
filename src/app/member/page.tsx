'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MemberProfile,
  getCurrentMember,
  loginMember,
  registerMember,
  logoutMember,
  syncFromCloudDatabase,
} from '@/lib/member-store';

export default function MemberPage() {
  const [activeMember, setActiveMember] = useState<MemberProfile | null>(null);
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  useEffect(() => {
    setActiveMember(getCurrentMember());
    syncFromCloudDatabase().then(() => setActiveMember(getCurrentMember()));
    const handleSync = () => setActiveMember(getCurrentMember());
    window.addEventListener('mood-auth-change', handleSync);
    return () => window.removeEventListener('mood-auth-change', handleSync);
  }, []);

  const handleSubmitAuth = useCallback(
    async (pinToSubmit: string) => {
      setStatusMessage(null);
      await syncFromCloudDatabase();
      if (mode === 'LOGIN') {
        const res = loginMember(phone, pinToSubmit);
        if (!res.success) {
          setStatusMessage({ type: 'error', text: res.message });
          setPin('');
        } else {
          setStatusMessage({ type: 'success', text: res.message });
          setActiveMember(res.member || null);
          setPin('');
        }
      } else {
        const res = registerMember(phone, name, pinToSubmit);
        if (!res.success) {
          setStatusMessage({ type: 'error', text: res.message });
          setPin('');
        } else {
          setStatusMessage({ type: 'success', text: res.message });
          setActiveMember(res.member || null);
          setPin('');
        }
      }
    },
    [mode, phone, name]
  );

  const handleDigitPress = (digit: string) => {
    setStatusMessage(null);
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 6) {
        setTimeout(() => {
          handleSubmitAuth(nextPin);
        }, 140);
      }
    }
  };

  const handleBackspace = () => {
    setStatusMessage(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClearPin = () => {
    setStatusMessage(null);
    setPin('');
  };

  const fillDemoAccount = () => {
    setMode('LOGIN');
    setPhone('0812345678');
    setPin('123456');
    setTimeout(() => {
      const res = loginMember('0812345678', '123456');
      if (res.success) {
        setActiveMember(res.member || null);
      }
    }, 150);
  };

  if (activeMember) {
    const stampsInCurrentCycle = activeMember.totalHoursAccumulated % 10;
    const hoursUntilFree = 10 - stampsInCurrentCycle;
    const freeHoursEarned = Math.floor(activeMember.totalHoursAccumulated / 10);
    const isStaff = activeMember.role === 'STAFF';

    return (
      <div className="max-w-[1150px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Top Member Header */}
        <div className="hairline-b pb-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
                MOOD® MEMBER PASS
              </p>
              {isStaff && (
                <span className="px-2.5 py-0.5 bg-[#121212] text-[#F7F5F0] text-xs font-bold">
                  ★ บัญชีพนักงานร้าน (STAFF)
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl sm:text-6xl text-[#121212] mt-2">
              สวัสดี, {activeMember.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              logoutMember();
              setActiveMember(null);
              setPin('');
            }}
            className="px-5 py-2.5 hairline-all font-tech text-xs uppercase tracking-wider text-[#68645E] hover:text-[#121212] hover:border-[#121212] editorial-transition self-start sm:self-end"
          >
            ออกจากระบบ (SIGN OUT)
          </button>
        </div>

        {/* If promoted to STAFF via DEV console, show direct Staff Counter Banner */}
        {isStaff && (
          <div className="mb-10 p-5 hairline-all bg-[#121212] text-[#F7F5F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#D9381E] block">
                ★ สิทธิ์พนักงานร้าน (ได้รับการโปรโมทจากระบบ DEV แล้ว)
              </span>
              <p className="text-xs sm:text-sm mt-1">
                บัญชีของคุณสามารถเข้าใช้งานหน้าจัดการคิวห้องและตรวจสลิปหน้าร้านได้ทันทีด้วยรหัส PIN ของคุณเอง
              </p>
            </div>
            <Link
              href="/admin"
              className="px-5 py-3 bg-[#D9381E] hover:bg-[#F7F5F0] hover:text-[#121212] text-[#F7F5F0] text-xs font-bold whitespace-nowrap text-center editorial-transition"
            >
              เข้าหน้าจัดการร้าน (/admin) →
            </Link>
          </div>
        )}

        {/* Main Asymmetric Member Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left 7 Cols: 10-Hour Acoustic Stamp Card */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#EFECE6] hairline-all p-6 sm:p-10">
              <div className="flex items-baseline justify-between hairline-b pb-5 mb-8">
                <div>
                  <span className="font-tech text-[10px] uppercase tracking-widest text-[#68645E] block">
                    LOYALTY STAMP CARD (สะสมครบ 10 ชม. ฟรี 1 ชม.)
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl text-[#121212] mt-1">
                    10-Hour Studio Pass
                  </h2>
                </div>
                <div className="text-right font-tech">
                  <span className="text-2xl font-semibold text-[#D9381E]">
                    {stampsInCurrentCycle} / 10
                  </span>
                  <span className="text-[10px] text-[#68645E] block">HOURS STAMPED</span>
                </div>
              </div>

              {/* 10 Stamp Slots Grid */}
              <div className="grid grid-cols-5 hairline-t hairline-l mb-8">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const slotNumber = idx + 1;
                  const isStamped = slotNumber <= stampsInCurrentCycle;
                  const isRewardSlot = slotNumber === 10;

                  return (
                    <div
                      key={slotNumber}
                      className={`aspect-square hairline-r hairline-b p-2.5 sm:p-3 flex flex-col justify-between editorial-transition ${
                        isStamped
                          ? 'bg-[#121212] text-[#F7F5F0]'
                          : isRewardSlot
                          ? 'bg-[#D9381E]/10 text-[#D9381E]'
                          : 'bg-[#F7F5F0] text-[#68645E]'
                      }`}
                    >
                      <span className="font-tech text-[10px]">
                        {String(slotNumber).padStart(2, '0')}
                      </span>
                      <div className="text-center my-auto">
                        {isStamped ? (
                          <span className="font-display text-xl sm:text-3xl text-[#F7F5F0]">
                            M.
                          </span>
                        ) : isRewardSlot ? (
                          <span className="font-tech text-[10px] font-bold uppercase">
                            FREE 1H
                          </span>
                        ) : (
                          <span className="font-tech text-xs opacity-30">○</span>
                        )}
                      </div>
                      <span className="font-tech text-[9px] uppercase tracking-wider opacity-75">
                        {isStamped ? 'STAMPED' : isRewardSlot ? 'REWARD' : '1 HR'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 hairline-t text-xs">
                <span className="text-[#121212] font-medium">
                  อีกเพียง <strong className="text-[#D9381E]">{hoursUntilFree} ชั่วโมง</strong> จะได้รับสิทธิ์ร้องฟรี 1 ชั่วโมง!
                </span>
                <span className="font-tech text-[11px] text-[#68645E]">
                  ชั่วโมงสะสมรวมทั้งหมด: {activeMember.totalHoursAccumulated} ชม.
                </span>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Member Profile Summary & Quick Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="hairline-all bg-[#F7F5F0] p-6 sm:p-8 space-y-6">
              <div className="hairline-b pb-4">
                <span className="font-tech text-[10px] uppercase tracking-widest text-[#68645E] block">
                  MEMBER CREDENTIALS
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-[#121212] mt-1">
                  ข้อมูลบัญชีสมาชิก
                </h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-2 hairline-b">
                  <span className="text-[#68645E]">เบอร์โทรศัพท์ (ID)</span>
                  <span className="text-[#121212] font-bold">{activeMember.phone}</span>
                </div>
                <div className="flex justify-between py-2 hairline-b">
                  <span className="text-[#68645E]">ชื่อเล่น</span>
                  <span className="text-[#121212] font-semibold">{activeMember.name}</span>
                </div>
                <div className="flex justify-between py-2 hairline-b">
                  <span className="text-[#68645E]">สถานะบัญชี</span>
                  <span className="text-[#121212] font-bold">
                    {isStaff ? '★ พนักงานร้าน (STAFF)' : 'สมาชิกทั่วไป (CUSTOMER)'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#68645E]">สิทธิ์ชั่วโมงฟรีที่มี</span>
                  <span className="text-[#D9381E] font-bold">
                    {freeHoursEarned} ชั่วโมงฟรี
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  href="/booking"
                  className="w-full py-4 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] text-xs font-bold uppercase tracking-wider text-center block editorial-transition"
                >
                  ไปหน้าจองห้องพร้อมสะสมชั่วโมง →
                </Link>
                <Link
                  href={`/status?phone=${activeMember.phone}`}
                  className="w-full py-3.5 hairline-all text-[#121212] hover:bg-[#EFECE6] text-xs font-bold uppercase tracking-wider text-center block editorial-transition"
                >
                  เช็คสถานะคิวจองของฉัน
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1150px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 hairline-all bg-[#F7F5F0]">
        {/* Left 6 Cols */}
        <div className="lg:col-span-6 p-7 sm:p-12 lg:hairline-r flex flex-col justify-between bg-[#EFECE6]/50">
          <div>
            <p className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
              MOOD® MEMBER ACCESS — PHONE + 6-DIGIT PIN
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-[#121212] mt-3">
              เข้าสู่ระบบ / สมัครสมาชิก
            </h1>

            <p className="mt-5 text-sm text-[#68645E] leading-[1.8]">
              เข้าสู่ระบบหรือสมัครสมาชิกง่ายๆ ใน 10 วินาที เพียงใช้ <strong>เบอร์โทรศัพท์ 10 หลัก</strong> คู่กับ <strong>รหัส PIN ตัวเลข 6 หลัก</strong> เพื่อรับสิทธิ์สะสมชั่วโมงร้องเพลงครบ 10 ชม. ฟรี 1 ชม.
            </p>

            <div className="mt-8 pt-6 hairline-t space-y-3 text-xs sm:text-sm text-[#121212]">
              <div className="flex items-baseline gap-3">
                <span className="font-tech text-[#D9381E]">01</span>
                <span>สมัครใหม่วันนี้ รับฟรีแสตมป์สะสม 1 ชั่วโมงแรกทันที</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-tech text-[#D9381E]">02</span>
                <span>ไม่ต้องจำรหัสผ่านยาวๆ ใช้แค่เบอร์โทร + เลข 6 หลัก</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-tech text-[#D9381E]">03</span>
                <span>พนักงานใหม่สามารถสมัครสมาชิกที่นี่เพื่อให้ผู้ดูแลโปรโมทเป็นบัญชีพนักงานได้</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 hairline-t">
            <span className="font-tech text-[10px] uppercase tracking-widest text-[#68645E] block mb-2">
              FOR TESTING / ทดลองระบบทันที
            </span>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="px-4 py-2.5 hairline-all bg-[#F7F5F0] hover:bg-[#121212] hover:text-[#F7F5F0] text-xs font-bold editorial-transition"
            >
              คลิกเพื่อเข้าบัญชีตัวอย่าง (0812345678 / PIN: 123456) →
            </button>
          </div>
        </div>

        {/* Right 6 Cols: Phone Input & 6-Digit Bank Keypad */}
        <div className="lg:col-span-6 p-7 sm:p-12">
          <div className="grid grid-cols-2 hairline-all mb-8 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setStatusMessage(null);
                setPin('');
              }}
              className={`py-3.5 uppercase tracking-wider editorial-transition ${
                mode === 'LOGIN'
                  ? 'bg-[#121212] text-[#F7F5F0]'
                  : 'bg-[#F7F5F0] text-[#68645E] hover:text-[#121212]'
              }`}
            >
              01 / เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setStatusMessage(null);
                setPin('');
              }}
              className={`py-3.5 uppercase tracking-wider hairline-l editorial-transition ${
                mode === 'REGISTER'
                  ? 'bg-[#121212] text-[#F7F5F0]'
                  : 'bg-[#F7F5F0] text-[#68645E] hover:text-[#121212]'
              }`}
            >
              02 / สมัครใหม่
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-bold text-[#68645E] mb-1.5">
                เบอร์โทรศัพท์ 10 หลัก (ใช้เป็น ID) *
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="08XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3.5 bg-[#F7F5F0] hairline-all font-bold text-base tracking-wider text-[#121212] focus:border-[#121212] focus:outline-none"
              />
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-[#68645E] mb-1.5">
                  ชื่อเล่น *
                </label>
                <input
                  type="text"
                  placeholder="เช่น มิ้นท์"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#F7F5F0] hairline-all text-base sm:text-sm text-[#121212] focus:border-[#121212] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="mb-6 text-center">
            <div className="text-xs font-bold text-[#68645E] mb-3">
              {mode === 'LOGIN'
                ? 'กดรหัส PIN 6 หลักของคุณ'
                : 'ตั้งรหัส PIN ตัวเลข 6 หลัก'}
            </div>

            <div className="flex items-center justify-center gap-4 py-3">
              {Array.from({ length: 6 }).map((_, idx) => {
                const isFilled = idx < pin.length;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                      isFilled
                        ? 'bg-[#121212] border-[#121212] scale-110'
                        : 'bg-transparent border-[#121212]/30'
                    }`}
                  />
                );
              })}
            </div>

            {statusMessage && (
              <div
                className={`mt-3 p-3 text-xs font-bold hairline-all ${
                  statusMessage.type === 'error'
                    ? 'bg-[#D9381E]/10 text-[#D9381E] border-[#D9381E]/30'
                    : 'bg-[#121212] text-[#F7F5F0]'
                }`}
              >
                {statusMessage.text}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 hairline-t hairline-l select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                type="button"
                key={digit}
                onClick={() => handleDigitPress(digit)}
                className="py-4 hairline-r hairline-b bg-[#F7F5F0] hover:bg-[#EFECE6] active:bg-[#121212] active:text-[#F7F5F0] text-lg font-bold text-[#121212] transition-colors"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              className="py-4 hairline-r hairline-b bg-[#EFECE6]/50 hover:bg-[#EFECE6] text-xs font-bold uppercase text-[#68645E]"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              className="py-4 hairline-r hairline-b bg-[#F7F5F0] hover:bg-[#EFECE6] active:bg-[#121212] active:text-[#F7F5F0] text-lg font-bold text-[#121212] transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-4 hairline-r hairline-b bg-[#EFECE6]/50 hover:bg-[#EFECE6] text-sm font-bold text-[#121212]"
            >
              ⌫ DEL
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-[#68645E]">
            เมื่อกดตัวเลขครบ 6 หลัก ระบบจะเข้าสู่บัญชีให้อัตโนมัติทันที
          </p>
        </div>
      </div>
    </div>
  );
}
