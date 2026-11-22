'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyDevLogin } from '@/lib/member-store';

export default function Footer() {
  const router = useRouter();
  const [devId, setDevId] = useState('');
  const [devPass, setDevPass] = useState('');
  const [devError, setDevError] = useState('');

  const handleQuickDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDevError('');
    const res = verifyDevLogin(devId, devPass);
    if (!res.success || !res.account) {
      setDevError('ID หรือรหัสผ่าน DEV ไม่ถูกต้อง');
      return;
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mood_karaoke_dev_session_v1', JSON.stringify(res.account));
    }
    router.push('/dev');
  };

  return (
    <footer className="hairline-t bg-[#F7F5F0] text-[#121212] mt-28">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        {/* Top 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 hairline-b">
          {/* Col 1: Brand Statement */}
          <div className="md:col-span-4 py-12 md:pr-10 md:hairline-r flex flex-col justify-between">
            <div>
              <p className="font-tech text-[11px] uppercase tracking-widest text-[#68645E] mb-3">
                MOOD KARAOKE ROOM — ROI ET
              </p>
              <h3 className="font-display text-3xl sm:text-4xl leading-tight text-[#121212]">
                Quiet rooms <br />
                <span className="text-[#68645E] font-semibold">for loud friends.</span>
              </h3>
            </div>
            <p className="mt-6 text-xs sm:text-sm text-[#68645E] leading-[1.8]">
              พื้นที่ปล่อยจอยหลังเลิกเรียน ห้องเก็บเสียงดีไซน์มินิมอล แสงสวย บรรยากาศได้ พร้อมให้คุณระบายมันออกมาให้มากที่สุด
            </p>
          </div>

          {/* Col 2: Hours & Location */}
          <div className="md:col-span-4 py-12 md:px-10 md:hairline-r hairline-t md:border-t-0 flex flex-col justify-between space-y-6">
            <div>
              <p className="font-tech text-[11px] uppercase tracking-widest text-[#68645E] mb-4">
                HOURS &amp; LOCATION
              </p>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 hairline-b">
                  <span className="text-[#68645E]">เปิดให้บริการทุกวัน (After School)</span>
                  <span className="font-tech font-semibold">15:00 — 23:00</span>
                </div>
                <div className="flex justify-between py-1.5 hairline-b">
                  <span className="text-[#68645E]">ราคาเริ่มต้น</span>
                  <span className="font-tech text-[#D9381E] font-semibold">฿140 / ชั่วโมง</span>
                </div>
                <div className="py-1.5">
                  <span className="text-[#68645E] block text-xs mb-1">พิกัดร้าน:</span>
                  <span className="font-semibold text-[#121212]">
                    สาขา : ร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทยาลัย)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links, Contact & Socials (IG, TikTok, Facebook Fanpage) */}
          <div className="md:col-span-4 py-12 md:pl-10 hairline-t md:border-t-0 flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="font-tech text-[11px] uppercase tracking-widest text-[#68645E] mb-3">
                  MENU
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                  <li>
                    <Link href="/#spaces" className="link-editorial">01 / ห้องทั้งหมด</Link>
                  </li>
                  <li>
                    <Link href="/booking" className="link-editorial">02 / จองคิวห้องออนไลน์</Link>
                  </li>
                  <li>
                    <Link href="/status" className="link-editorial">03 / เช็คสถานะคิวจอง</Link>
                  </li>
                  <li>
                    <Link href="/member" className="link-editorial">04 / สมาชิก (PIN 6 หลัก)</Link>
                  </li>
                  <li>
                    <Link href="/admin" className="link-editorial text-[#68645E]">05 / พนักงานหน้าร้าน</Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-tech text-[11px] uppercase tracking-widest text-[#68645E] mb-3">
                  SOCIAL &amp; CONTACT
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="link-editorial text-[#121212]"
                    >
                      IG : @mood.karaoke.roiet
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noreferrer"
                      className="link-editorial text-[#121212]"
                    >
                      TikTok : @mood.karaoke
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="link-editorial text-[#121212]"
                    >
                      FB Fanpage : MOOD Karaoke ร้อยเอ็ด
                    </a>
                  </li>
                  <li className="pt-2 font-tech text-xs text-[#68645E]">
                    TEL : 095-660-2420
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* DEV TEAM EXCLUSIVE LOGIN BAR (Before Bottom Wordmark) */}
        <div className="py-6 px-5 my-6 bg-[#EFECE6]/70 hairline-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tech text-[11px] px-2 py-0.5 bg-[#121212] text-[#F7F5F0]">
                  DEV ONLY
                </span>
                <span className="font-display text-sm text-[#121212]">
                  สำหรับทีม DEV เท่านั้น (ตรวจสอบบัญชีลูกค้า &amp; รหัสพนักงานทั้งหมด)
                </span>
              </div>
              <p className="text-xs text-[#68645E] mt-1">
                * แยกจากหน้าพนักงานทั่วไป เข้าสู่ระบบด้วย ID และรหัสผ่านสำหรับผู้ดูแลระบบระดับโค้ดเท่านั้น
              </p>
            </div>

            <form onSubmit={handleQuickDevLogin} className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="DEV ID"
                value={devId}
                onChange={(e) => setDevId(e.target.value)}
                className="px-3.5 py-2.5 bg-[#F7F5F0] hairline-all text-xs text-[#121212] focus:border-[#121212] focus:outline-none w-full sm:w-44"
                required
              />
              <input
                type="password"
                placeholder="DEV Password"
                value={devPass}
                onChange={(e) => setDevPass(e.target.value)}
                className="px-3.5 py-2.5 bg-[#F7F5F0] hairline-all text-xs text-[#121212] focus:border-[#121212] focus:outline-none w-full sm:w-44"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#121212] hover:bg-[#D9381E] text-[#F7F5F0] font-tech text-xs uppercase tracking-wider editorial-transition"
              >
                LOGIN DEV →
              </button>
            </form>
          </div>
          {devError && (
            <p className="mt-2 text-xs text-[#D9381E] font-medium">{devError}</p>
          )}
        </div>

        {/* Bottom Oversized Full-Width Wordmark: MOOD.KARAOKE */}
        <div className="py-8 hairline-t flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="font-display text-4xl sm:text-7xl lg:text-8xl tracking-tight leading-none select-none text-[#121212]">
            MOOD<span className="text-[#D9381E]">.</span>KARAOKE
          </div>
          <div className="font-tech text-[11px] text-[#68645E] uppercase tracking-wider">
            © {new Date().getFullYear()} MOOD.KARAOKE ROI ET 1. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
}
