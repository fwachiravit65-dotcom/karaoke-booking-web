'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MemberProfile,
  getCurrentMember,
  loginMember,
  registerMember,
  logoutMember,
} from '@/lib/member-store';

export default function MemberPage() {
  const [activeMember, setActiveMember] = useState<MemberProfile | null>(null);
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form states
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  useEffect(() => {
    setActiveMember(getCurrentMember());
    const handleSync = () => setActiveMember(getCurrentMember());
    window.addEventListener('mood-auth-change', handleSync);
    return () => window.removeEventListener('mood-auth-change', handleSync);
  }, []);

  const handleSubmitAuth = useCallback(
    (pinToSubmit: string) => {
      setStatusMessage(null);
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
        // Auto-verify once 6th digit is pressed (just like mobile banking apps)
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

  // IF LOGGED IN: SHOW DIGITAL MEMBER CARD & 10-HOUR STAMP LEDGER
  if (activeMember) {
    const stampsInCurrentCycle = activeMember.totalHoursAccumulated % 10;
    const hoursUntilFree = 10 - stampsInCurrentCycle;
    const freeHoursEarned = Math.floor(activeMember.totalHoursAccumulated / 10);

    return (
      <div className="max-w-[1150px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Top Member Header */}
        <div className="hairline-b pb-8 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
              MOOD® AFTER-SCHOOL CLUB — MEMBER PASS
            </p>
            <h1 className="font-display text-5xl sm:text-6xl text-[#121212] mt-2 leading-none">
              Welcome, {activeMember.name}
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
            SIGN OUT / ออกจากระบบ
          </button>
        </div>

        {/* Main Asymmetric Member Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left 7 Cols: 10-Hour Acoustic Stamp Card */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#EFECE6] hairline-all p-6 sm:p-10">
              <div className="flex items-baseline justify-between hairline-b pb-5 mb-8">
                <div>
                  <span className="font-tech text-[10px] uppercase tracking-widest text-[#68645E] block">
                    LOYALTY STAMP CARD (สะสมครบ 10 ชม. ฟรี 1 ชม.)
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl text-[#121212] mt-1">
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
                      className={`aspect-square hairline-r hairline-b p-3 flex flex-col justify-between editorial-transition ${
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
                          <span className="font-display text-2xl sm:text-3xl italic text-[#F7F5F0]">
                            M.
                          </span>
                        ) : isRewardSlot ? (
                          <span className="font-tech text-[10px] font-bold uppercase tracking-tighter">
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 hairline-t text-xs">
                <span className="text-[#121212] font-medium">
                  อีกเพียง <strong className="text-[#D9381E]">{hoursUntilFree} ชั่วโมง</strong> จะได้รับสิทธิ์ร้องฟรี 1 ชั่วโมง!
                </span>
                <span className="font-tech text-[11px] text-[#68645E]">
                  TOTAL ACCUMULATED: {activeMember.totalHoursAccumulated} HRS
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
                <h3 className="font-display text-3xl text-[#121212] mt-1">
                  Account Ledger
                </h3>
              </div>

              <div className="space-y-3 font-tech text-xs">
                <div className="flex justify-between py-2 hairline-b">
                  <span className="text-[#68645E]">PHONE ID (เบอร์สมาชิก)</span>
                  <span className="text-[#121212] font-semibold">{activeMember.phone}</span>
                </div>
                <div className="flex justify-between py-2 hairline-b">
                  <span className="text-[#68645E]">NICKNAME</span>
                  <span className="font-sans text-[#121212] font-medium">{activeMember.name}</span>
                </div>
                <div className="flex justify-between py-2 hairline-b">
                  <span className="text-[#68645E]">SECURITY PIN</span>
                  <span className="text-[#121212]">• • • • • • (6-DIGIT LOCK)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#68645E]">FREE HOURS VOUCHER</span>
                  <span className="text-[#D9381E] font-semibold">
                    {freeHoursEarned} ชั่วโมงฟรีที่ใช้ได้
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  href="/booking"
                  className="w-full py-4 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] font-tech text-xs uppercase tracking-widest text-center block editorial-transition"
                >
                  RESERVE STUDIO &amp; EARN STAMPS →
                </Link>
                <Link
                  href={`/status?phone=${activeMember.phone}`}
                  className="w-full py-3.5 hairline-all text-[#121212] hover:bg-[#EFECE6] font-tech text-xs uppercase tracking-widest text-center block editorial-transition"
                >
                  VIEW MY RESERVATIONS (เช็คคิวของฉัน)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN: SHOW PHONE ID + 6-DIGIT BANK-STYLE PIN KEYPAD
  return (
    <div className="max-w-[1150px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 hairline-all bg-[#F7F5F0]">
        {/* Left 6 Cols: Editorial Explanation & Mode Switcher */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:hairline-r flex flex-col justify-between bg-[#EFECE6]/50">
          <div>
            <p className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
              MOOD® MEMBER ACCESS — PHONE + 6-DIGIT PIN
            </p>
            <h1 className="font-display text-5xl sm:text-6xl text-[#121212] mt-3 leading-[0.96]">
              Quick access. <br />
              <span className="italic text-[#68645E]">No email required.</span>
            </h1>

            <p className="mt-6 text-sm text-[#68645E] leading-relaxed">
              เข้าสู่ระบบหรือสมัครสมาชิกง่ายๆ ใน 10 วินาที เพียงใช้ <strong>เบอร์โทรศัพท์ 10 หลัก</strong> คู่กับ <strong>รหัส PIN ตัวเลข 6 หลัก</strong> (เหมือนแอปธนาคาร) เพื่อรับสิทธิ์สะสมชั่วโมงร้องเพลงครบ 10 ชม. ฟรี 1 ชม. และดึงชื่ออัตโนมัติเวลาจองห้อง
            </p>

            {/* Benefits List */}
            <div className="mt-8 pt-6 hairline-t space-y-3 text-xs text-[#121212]">
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
                <span>ป้องกันคนอื่นแอบเอาเบอร์โทรมาสวมรอยดูหรือยกเลิกคิวจอง</span>
              </div>
            </div>
          </div>

          {/* 1-Click Demo Testing Helper */}
          <div className="mt-10 pt-6 hairline-t">
            <span className="font-tech text-[10px] uppercase tracking-widest text-[#68645E] block mb-2">
              FOR TESTING / ทดลองระบบทันที
            </span>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="px-4 py-2.5 hairline-all bg-[#F7F5F0] hover:bg-[#121212] hover:text-[#F7F5F0] font-tech text-xs editorial-transition"
            >
              คลิกเพื่อเข้าบัญชีตัวอย่าง (0812345678 / PIN: 123456) →
            </button>
          </div>
        </div>

        {/* Right 6 Cols: Phone Input & Tactile 6-Digit Bank Keypad */}
        <div className="lg:col-span-6 p-8 sm:p-12">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 hairline-all mb-8 font-tech text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setStatusMessage(null);
                setPin('');
              }}
              className={`py-3.5 uppercase tracking-wider editorial-transition ${
                mode === 'LOGIN'
                  ? 'bg-[#121212] text-[#F7F5F0] font-semibold'
                  : 'bg-[#F7F5F0] text-[#68645E] hover:text-[#121212]'
              }`}
            >
              01 / เข้าสู่ระบบ (LOGIN)
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
                  ? 'bg-[#121212] text-[#F7F5F0] font-semibold'
                  : 'bg-[#F7F5F0] text-[#68645E] hover:text-[#121212]'
              }`}
            >
              02 / สมัครใหม่ (REGISTER)
            </button>
          </div>

          {/* Step 1: Phone ID & Name */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block font-tech text-[11px] uppercase tracking-wider text-[#68645E] mb-1.5">
                PHONE NUMBER ID / เบอร์โทรศัพท์ 10 หลัก *
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="08XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 bg-[#F7F5F0] hairline-all font-tech text-base tracking-wider text-[#121212] focus:border-[#121212] focus:outline-none"
              />
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block font-tech text-[11px] uppercase tracking-wider text-[#68645E] mb-1.5">
                  NICKNAME / ชื่อเล่น และชื่อแก๊ง *
                </label>
                <input
                  type="text"
                  placeholder="เช่น นนนี่ (ม.5/1)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F7F5F0] hairline-all text-sm text-[#121212] focus:border-[#121212] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Step 2: 6-Digit PIN Dots Display */}
          <div className="mb-6 text-center">
            <div className="font-tech text-[11px] uppercase tracking-widest text-[#68645E] mb-3">
              {mode === 'LOGIN'
                ? 'ENTER 6-DIGIT SECURITY PIN (กดรหัส PIN 6 หลัก)'
                : 'SET YOUR 6-DIGIT PIN (ตั้งรหัสผ่านตัวเลข 6 หลัก)'}
            </div>

            {/* 6 Indicator Circles */}
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
                className={`mt-3 p-3 text-xs font-medium hairline-all ${
                  statusMessage.type === 'error'
                    ? 'bg-[#D9381E]/10 text-[#D9381E] border-[#D9381E]/30'
                    : 'bg-[#121212] text-[#F7F5F0]'
                }`}
              >
                {statusMessage.text}
              </div>
            )}
          </div>

          {/* Architectural Bank-Style Number Pad */}
          <div className="grid grid-cols-3 hairline-t hairline-l select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                type="button"
                key={digit}
                onClick={() => handleDigitPress(digit)}
                className="py-4 hairline-r hairline-b bg-[#F7F5F0] hover:bg-[#EFECE6] active:bg-[#121212] active:text-[#F7F5F0] font-tech text-lg font-medium text-[#121212] transition-colors"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              className="py-4 hairline-r hairline-b bg-[#EFECE6]/50 hover:bg-[#EFECE6] font-tech text-xs uppercase tracking-wider text-[#68645E]"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              className="py-4 hairline-r hairline-b bg-[#F7F5F0] hover:bg-[#EFECE6] active:bg-[#121212] active:text-[#F7F5F0] font-tech text-lg font-medium text-[#121212] transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-4 hairline-r hairline-b bg-[#EFECE6]/50 hover:bg-[#EFECE6] font-tech text-sm text-[#121212]"
            >
              ⌫ DEL
            </button>
          </div>

          <p className="mt-4 text-center font-tech text-[11px] text-[#68645E]">
            เมื่อกดตัวเลขครบ 6 หลัก ระบบจะเข้าสู่บัญชีให้อัตโนมัติทันที
          </p>
        </div>
      </div>
    </div>
  );
}
