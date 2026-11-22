'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MemberProfile,
  DevAccount,
  getAllMembers,
  REGISTERED_STAFF,
  DEV_ACCOUNTS,
  verifyDevLogin,
} from '@/lib/member-store';

const DEV_SESSION_KEY = 'mood_karaoke_dev_session_v1';

export default function DevConsolePage() {
  const [devSession, setDevSession] = useState<DevAccount | null>(null);
  const [devId, setDevId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [members, setMembers] = useState<MemberProfile[]>([]);

  useEffect(() => {
    setMembers(getAllMembers());
    try {
      const saved = sessionStorage.getItem(DEV_SESSION_KEY);
      if (saved) {
        setDevSession(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = verifyDevLogin(devId, password);
    if (!res.success || !res.account) {
      setErrorMsg('DEV ID หรือ Password ไม่ถูกต้อง (ต้องใช้รหัสที่ระบุในโค้ดเท่านั้น)');
      return;
    }
    setDevSession(res.account);
    sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(res.account));
  };

  const handleDevLogout = () => {
    setDevSession(null);
    sessionStorage.removeItem(DEV_SESSION_KEY);
    setDevId('');
    setPassword('');
  };

  if (!devSession) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
        <div className="hairline-all bg-[#F7F5F0] p-8 sm:p-10">
          <span className="font-tech text-[11px] uppercase tracking-widest text-[#D9381E] block">
            CODE-LOCKED TERMINAL — DEV TEAM ONLY
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-[#121212] mt-1">
            DEV System Console
          </h1>
          <p className="text-xs text-[#68645E] mt-2 mb-6 leading-relaxed">
            ส่วนนี้แยกจากหน้าพนักงานทั่วไป ไม่มีการเปิดรับสมัครหน้าเว็บ ไอดีและรหัสผ่านต้องถูกเขียนระบุไว้ในไฟล์โค้ด (<code className="text-[#121212]">src/lib/member-store.ts</code>) เท่านั้น
          </p>

          <form onSubmit={handleDevLogin} className="space-y-4">
            <div>
              <label className="block font-tech text-[11px] uppercase tracking-wider text-[#68645E] mb-1.5">
                DEV ID (รหัสประจำตัวทีมพัฒนา)
              </label>
              <input
                type="text"
                placeholder="เช่น mood-dev"
                value={devId}
                onChange={(e) => setDevId(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F5F0] hairline-all font-tech text-sm text-[#121212] focus:border-[#121212] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-tech text-[11px] uppercase tracking-wider text-[#68645E] mb-1.5">
                DEV PASSWORD (รหัสผ่านจากโค้ด)
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F5F0] hairline-all font-tech text-sm text-[#121212] focus:border-[#121212] focus:outline-none"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 hairline-all bg-[#D9381E]/10 text-[#D9381E] text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#121212] hover:bg-[#D9381E] text-[#F7F5F0] font-tech text-xs uppercase tracking-widest editorial-transition"
            >
              ACCESS DEV DATABASE →
            </button>
          </form>

          <div className="mt-6 pt-5 hairline-t text-xs text-[#68645E] flex items-center justify-between">
            <span>สำหรับทดสอบ: ID <strong className="text-[#121212]">mood-dev</strong> / Pass <strong className="text-[#121212]">MOOD-DEV-2026</strong></span>
            <button
              type="button"
              onClick={() => {
                setDevId('mood-dev');
                setPassword('MOOD-DEV-2026');
              }}
              className="text-[#D9381E] font-semibold underline"
            >
              กรอกอัตโนมัติ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 hairline-b">
        <div>
          <span className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
            DEV ROOT CONSOLE — LOGGED IN AS: {devSession.devId} ({devSession.role})
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-[#121212] mt-2 leading-none">
            System Registry &amp; Accounts
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2.5 hairline-all bg-[#EFECE6] text-xs font-tech hover:bg-[#121212] hover:text-[#F7F5F0] editorial-transition"
          >
            ไปหน้าพนักงาน (/admin) →
          </Link>
          <button
            type="button"
            onClick={handleDevLogout}
            className="px-4 py-2.5 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] text-xs font-tech uppercase tracking-wider editorial-transition"
          >
            LOGOUT DEV
          </button>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 hairline-all bg-[#EFECE6]/60">
        <div className="p-6 sm:p-8 hairline-b sm:border-b-0 sm:hairline-r">
          <span className="font-tech text-xs text-[#68645E] block mb-2">
            01 / จำนวนลูกค้าที่สมัครสมาชิกทั้งหมด
          </span>
          <div className="font-display text-4xl sm:text-5xl text-[#121212]">
            {members.length} <span className="text-sm font-normal text-[#68645E]">บัญชี</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 hairline-b sm:border-b-0 sm:hairline-r">
          <span className="font-tech text-xs text-[#68645E] block mb-2">
            02 / จำนวนรหัสพนักงานที่ลงทะเบียนไว้ทั้งหมด
          </span>
          <div className="font-display text-4xl sm:text-5xl text-[#D9381E]">
            {REGISTERED_STAFF.length} <span className="text-sm font-normal text-[#68645E]">รหัสพนักงาน</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <span className="font-tech text-xs text-[#68645E] block mb-2">
            03 / บัญชีทีม DEV (Hardcoded in Code)
          </span>
          <div className="font-display text-4xl sm:text-5xl text-[#121212]">
            {DEV_ACCOUNTS.length} <span className="text-sm font-normal text-[#68645E]">สิทธิ์ระดับโค้ด</span>
          </div>
        </div>
      </div>

      {/* Table 1: Registered Customers */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-[#121212]">
            1. รายชื่อลูกค้าที่สมัครสมาชิกทั้งหมด ({members.length} ท่าน)
          </h2>
          <span className="font-tech text-xs text-[#68645E]">
            TABLE: public.members
          </span>
        </div>

        <div className="hairline-all overflow-x-auto bg-[#F7F5F0]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="hairline-b bg-[#EFECE6] font-tech text-xs text-[#68645E]">
                <th className="py-3.5 px-5 hairline-r">#</th>
                <th className="py-3.5 px-5 hairline-r">เบอร์โทรศัพท์ (ID)</th>
                <th className="py-3.5 px-5 hairline-r">ชื่อเล่นลูกค้า</th>
                <th className="py-3.5 px-5 hairline-r">รหัส PIN 6 หลัก</th>
                <th className="py-3.5 px-5 hairline-r">ชั่วโมงสะสมรวม</th>
                <th className="py-3.5 px-5">สิทธิ์ชั่วโมงฟรี</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => (
                <tr key={m.phone} className="hairline-b hover:bg-[#EFECE6]/40">
                  <td className="py-3.5 px-5 font-tech hairline-r">{idx + 1}</td>
                  <td className="py-3.5 px-5 font-tech font-semibold text-[#121212] hairline-r">
                    {m.phone}
                  </td>
                  <td className="py-3.5 px-5 font-medium hairline-r">{m.name}</td>
                  <td className="py-3.5 px-5 font-tech text-[#D9381E] hairline-r">
                    {m.pin || '••••••'} <span className="text-[11px] text-[#68645E]">({m.pinHash})</span>
                  </td>
                  <td className="py-3.5 px-5 font-tech hairline-r">
                    {m.totalHoursAccumulated} ชั่วโมง
                  </td>
                  <td className="py-3.5 px-5 font-tech text-[#D9381E] font-semibold">
                    {Math.floor(m.totalHoursAccumulated / 10)} ชม.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Registered Staff PINs */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-[#121212]">
            2. รหัสพนักงานที่ลงทะเบียนไว้ทั้งหมด ({REGISTERED_STAFF.length} รหัส)
          </h2>
          <span className="font-tech text-xs text-[#68645E]">
            CONFIG: src/lib/member-store.ts (REGISTERED_STAFF)
          </span>
        </div>

        <div className="hairline-all overflow-x-auto bg-[#F7F5F0]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="hairline-b bg-[#EFECE6] font-tech text-xs text-[#68645E]">
                <th className="py-3.5 px-5 hairline-r">รหัสพนักงาน</th>
                <th className="py-3.5 px-5 hairline-r">ชื่อ / หน้าที่</th>
                <th className="py-3.5 px-5 hairline-r">PIN เข้าหน้าแอดมิน (6 หลัก)</th>
                <th className="py-3.5 px-5 hairline-r">ตำแหน่ง</th>
                <th className="py-3.5 px-5">สาขาประจำการ</th>
              </tr>
            </thead>
            <tbody>
              {REGISTERED_STAFF.map((st) => (
                <tr key={st.staffId} className="hairline-b hover:bg-[#EFECE6]/40">
                  <td className="py-3.5 px-5 font-tech font-semibold hairline-r">
                    {st.staffId}
                  </td>
                  <td className="py-3.5 px-5 font-medium hairline-r">{st.name}</td>
                  <td className="py-3.5 px-5 font-tech text-base font-bold text-[#D9381E] hairline-r">
                    {st.pinCode}
                  </td>
                  <td className="py-3.5 px-5 font-tech text-xs hairline-r">{st.role}</td>
                  <td className="py-3.5 px-5 text-xs text-[#68645E]">{st.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
