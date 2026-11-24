'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatBaht, getStatusBadge } from '@/lib/utils';
import { Booking, BookingStatus } from '@/types';
import {
  MemberProfile,
  DevAccount,
  StaffAccount,
  AccountRole,
  CloudSyncState,
  getAllMembers,
  getAllRegisteredStaff,
  toggleMemberStaffRole,
  registerMember,
  getAllBookings,
  updateBookingStatusInStore,
  getSiteUsageCount,
  verifyDevLogin,
  getCloudSyncStatus,
  syncFromCloudDatabase,
} from '@/lib/member-store';

const DEV_SESSION_KEY = 'mood_karaoke_dev_session_v1';

export default function DevConsolePage() {
  const [devSession, setDevSession] = useState<DevAccount | null>(null);
  const [devId, setDevId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // System Data States
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [siteVisits, setSiteVisits] = useState<number>(0);
  const [searchAccount, setSearchAccount] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string>('');
  const [cloudState, setCloudState] = useState<CloudSyncState>({ ok: false });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Quick Add Account Form in DEV
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<AccountRole>('STAFF');

  const refreshAllData = () => {
    setMembers(getAllMembers());
    setStaffList(getAllRegisteredStaff());
    setBookings(getAllBookings());
    setSiteVisits(getSiteUsageCount());
    setCloudState(getCloudSyncStatus());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const st = await syncFromCloudDatabase();
    setCloudState(st);
    refreshAllData();
    setIsSyncing(false);
  };

  useEffect(() => {
    handleManualSync();
    const pollTimer = setInterval(() => {
      syncFromCloudDatabase().then(() => refreshAllData());
    }, 6000);
    try {
      const saved = sessionStorage.getItem(DEV_SESSION_KEY);
      if (saved) {
        setDevSession(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    window.addEventListener('mood-auth-change', refreshAllData);
    window.addEventListener('mood-bookings-change', refreshAllData);
    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('mood-auth-change', refreshAllData);
      window.removeEventListener('mood-bookings-change', refreshAllData);
    };
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
    syncFromCloudDatabase().then(() => refreshAllData());
  };

  const handleDevLogout = () => {
    setDevSession(null);
    sessionStorage.removeItem(DEV_SESSION_KEY);
    setDevId('');
    setPassword('');
  };

  const handlePromoteToggle = (member: MemberProfile) => {
    const willBeStaff = member.role !== 'STAFF';
    const updated = toggleMemberStaffRole(
      member.phone,
      willBeStaff,
      willBeStaff ? 'พนักงานร้าน (อนุมัติจาก DEV)' : undefined
    );
    setMembers(updated);
    setStaffList(getAllRegisteredStaff());
    setToastMsg(
      willBeStaff
        ? `✓ โปรโมทบัญชี "${member.name}" (${member.phone}) เป็นบัญชีพนักงานร้านเรียบร้อย! (ใช้ไอดี ${member.phone} + PIN ${member.pin} เข้าหน้า /admin ได้ทันที)`
        : `ปรับสถานะ "${member.name}" (${member.phone}) กลับเป็นบัญชีลูกค้าทั่วไปเรียบร้อย`
    );
    setTimeout(() => setToastMsg(''), 5000);
  };

  const handleQuickAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerMember(newPhone, newName, newPin, newRole);
    if (!res.success) {
      setToastMsg(`❌ ${res.message}`);
      return;
    }
    setNewPhone('');
    setNewName('');
    setNewPin('');
    refreshAllData();
    setToastMsg(
      `✓ เพิ่มบัญชี "${newName}" (${newPhone}) สถานะ ${
        newRole === 'STAFF' ? 'พนักงานร้าน (STAFF)' : 'ลูกค้าทั่วไป'
      } เรียบร้อยแล้ว!`
    );
    setTimeout(() => setToastMsg(''), 5000);
  };

  const handleBookingStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    const updated = updateBookingStatusInStore(bookingId, newStatus);
    setBookings(updated);
  };

  if (!devSession) {
    return (
      <div className="max-w-lg mx-auto px-5 py-16 sm:py-24">
        <div className="hairline-all bg-[#F7F5F0] p-8 sm:p-10">
          <span className="font-tech text-[11px] uppercase tracking-widest text-[#D9381E] block">
            CODE-LOCKED TERMINAL — DEV TEAM ONLY
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-[#121212] mt-1">
            DEV System Console
          </h1>
          <p className="text-xs text-[#68645E] mt-2 mb-6 leading-relaxed">
            ศูนย์ควบคุมหลักสำหรับทีมพัฒนาและเจ้าของระบบ ตรวจสอบข้อมูลบัญชีทั้งหมด สถิติการใช้งาน ยอดจอง และโปรโมทบัญชีพนักงานร้าน
          </p>

          <form onSubmit={handleDevLogin} className="space-y-4">
            <div>
              <label className="block font-tech text-[11px] uppercase tracking-wider text-[#68645E] mb-1.5">
                DEV ID
              </label>
              <input
                type="text"
                placeholder="กรอก DEV ID"
                value={devId}
                onChange={(e) => setDevId(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#F7F5F0] hairline-all font-tech text-sm text-[#121212] focus:border-[#121212] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-tech text-[11px] uppercase tracking-wider text-[#68645E] mb-1.5">
                DEV PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#F7F5F0] hairline-all font-tech text-sm text-[#121212] focus:border-[#121212] focus:outline-none"
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
              ACCESS DEV CONSOLE →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Computed Analytics Metrics
  const totalAccounts = members.length;
  const staffAccountsCount = members.filter((m) => m.role === 'STAFF').length;
  const customerAccountsCount = totalAccounts - staffAccountsCount;

  const totalBookingsCount = bookings.length;
  const confirmedOrCompletedBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
  );
  const completedUsageCount = confirmedOrCompletedBookings.length;
  const rejectedBookings = bookings.filter(
    (b) => b.status === 'REJECTED' || b.status === 'CANCELLED'
  );
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');

  const totalRevenue = confirmedOrCompletedBookings.reduce(
    (sum, b) => sum + b.totalAmount,
    0
  );
  const rejectedAmount = rejectedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const filteredMembers = members.filter(
    (m) =>
      m.phone.includes(searchAccount.trim()) ||
      m.name.toLowerCase().includes(searchAccount.trim().toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-16 space-y-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 hairline-b">
        <div>
          <span className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
            DEV ROOT CONSOLE — ID: {devSession.devId} ({devSession.role})
          </span>
          <h1 className="font-display text-3xl sm:text-5xl text-[#121212] mt-2">
            ศูนย์ควบคุมระบบ &amp; จัดการสิทธิ์พนักงาน
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2.5 hairline-all bg-[#EFECE6] text-xs font-bold hover:bg-[#121212] hover:text-[#F7F5F0] editorial-transition"
          >
            เปิดหน้าพนักงาน (/admin) →
          </Link>
          <button
            type="button"
            onClick={handleDevLogout}
            className="px-4 py-2.5 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] text-xs font-bold uppercase tracking-wider editorial-transition"
          >
            ออกจากระบบ DEV
          </button>
        </div>
      </div>

      {/* Database Connection Mode Notice */}
      <div className="p-4 sm:p-5 hairline-all bg-[#EFECE6]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                cloudState.ok ? 'bg-emerald-600' : 'bg-[#D9381E]'
              }`}
            />
            <span className="text-xs sm:text-sm font-bold text-[#121212]">
              {cloudState.ok
                ? `🟢 เชื่อมต่อฐานข้อมูลกลาง (Supabase Cloud) สำเร็จแล้ว · ซิงค์ล่าสุด ${cloudState.lastSyncedAt || ''}`
                : `⚠️ รอปลดล็อกสิทธิ์ตารางใน Supabase (${cloudState.error || 'Permission Required'})`}
            </span>
          </div>
          {!cloudState.ok && (
            <p className="text-xs text-[#68645E] mt-1 leading-relaxed">
              * กรุณารันคำสั่ง SQL <code>GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;</code> ในหน้า SQL Editor ของ Supabase เพื่อให้มือถือทุกเครื่องส่งข้อมูลเข้าตารางได้
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-[#121212] hover:bg-[#D9381E] text-[#F7F5F0] text-xs font-bold whitespace-nowrap self-start sm:self-center editorial-transition"
        >
          {isSyncing ? 'กำลังซิงค์...' : '🔄 ดึงข้อมูลล่าสุดจาก Cloud'}
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 hairline-all bg-[#121212] text-[#F7F5F0] text-xs sm:text-sm font-semibold flex items-center justify-between">
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg('')}
            className="text-[#D9381E] font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* =====================================================================
          PART 1: 6 กล่องสถิติภาพรวมทั้งหมด (System Overview Metrics)
         ===================================================================== */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl sm:text-2xl text-[#121212]">
            1. สถิติภาพรวมทั้งระบบ (System Metrics)
          </h2>
          <span className="text-xs text-[#68645E]">ข้อมูลอัปเดตแบบเรียลไทม์</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 hairline-t hairline-l bg-[#EFECE6]/60">
          <div className="p-6 hairline-r hairline-b">
            <span className="text-xs font-bold text-[#68645E] block mb-2">
              01 / บัญชีที่สมัครทั้งหมดในระบบ
            </span>
            <div className="font-display text-4xl text-[#121212]">
              {totalAccounts} <span className="text-sm font-normal text-[#68645E]">บัญชี</span>
            </div>
            <p className="text-xs text-[#68645E] mt-2">
              ลูกค้าทั่วไป <strong>{customerAccountsCount}</strong> คน · พนักงานร้าน <strong className="text-[#D9381E]">{staffAccountsCount}</strong> คน
            </p>
          </div>

          <div className="p-6 hairline-r hairline-b">
            <span className="text-xs font-bold text-[#68645E] block mb-2">
              02 / ยอดเข้าใช้งานระบบ &amp; เข้าใช้บริการ
            </span>
            <div className="font-display text-4xl text-[#121212]">
              {completedUsageCount} <span className="text-sm font-normal text-[#68645E]">รอบเข้าห้อง</span>
            </div>
            <p className="text-xs text-[#68645E] mt-2">
              ยอดล็อกอินและเข้าใช้งานเว็บสะสมรวม <strong>{siteVisits}</strong> ครั้ง
            </p>
          </div>

          <div className="p-6 hairline-r hairline-b">
            <span className="text-xs font-bold text-[#68645E] block mb-2">
              03 / ยอดจองทั้งหมด (Total Bookings)
            </span>
            <div className="font-display text-4xl text-[#121212]">
              {totalBookingsCount} <span className="text-sm font-normal text-[#68645E]">รายการจอง</span>
            </div>
            <p className="text-xs text-[#68645E] mt-2">
              รอตรวจสอบสลิป <strong>{pendingBookings.length}</strong> รายการ
            </p>
          </div>

          <div className="p-6 hairline-r hairline-b">
            <span className="text-xs font-bold text-[#D9381E] block mb-2">
              04 / ยอดปฏิเสธการจอง (Rejected)
            </span>
            <div className="font-display text-4xl text-[#D9381E]">
              {rejectedBookings.length} <span className="text-sm font-normal text-[#68645E]">รายการ</span>
            </div>
            <p className="text-xs text-[#68645E] mt-2">
              มูลค่าที่ถูกปฏิเสธรวม {formatBaht(rejectedAmount)}
            </p>
          </div>

          <div className="p-6 hairline-r hairline-b">
            <span className="text-xs font-bold text-[#68645E] block mb-2">
              05 / ยอดรายได้จากการจองที่อนุมัติแล้ว
            </span>
            <div className="font-display text-4xl text-[#121212]">
              {formatBaht(totalRevenue)}
            </div>
            <p className="text-xs text-[#68645E] mt-2">
              คำนวณจากรายการที่ยืนยันและเข้าใช้บริการแล้ว ({completedUsageCount} รายการ)
            </p>
          </div>

          <div className="p-6 hairline-r hairline-b">
            <span className="text-xs font-bold text-[#68645E] block mb-2">
              06 / รหัสพนักงานที่เข้าหน้า /admin ได้
            </span>
            <div className="font-display text-4xl text-[#121212]">
              {staffList.length} <span className="text-sm font-normal text-[#68645E]">รหัส</span>
            </div>
            <p className="text-xs text-[#68645E] mt-2">
              โปรโมทจากบัญชีสมาชิกทั้งหมด <strong>{staffAccountsCount}</strong> คน
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PART 2: ข้อมูลบัญชีที่สมัครทั้งหมดในระบบ & ปุ่มโปรโมทเป็นพนักงานร้าน
         ===================================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-[#121212]">
              2. ข้อมูลบัญชีที่สมัครทั้งหมดในระบบ &amp; โปรโมทเป็นพนักงานร้าน ({members.length} บัญชี)
            </h2>
            <p className="text-xs text-[#68645E] mt-1">
              * กดปุ่ม <strong>&ldquo;⬆️ โปรโมทเป็นพนักงานร้าน&rdquo;</strong> เพื่อให้เบอร์นั้นใช้ล็อกอินเข้าหน้าจัดการร้าน (/admin) ได้ทันที
            </p>
          </div>

          <input
            type="text"
            placeholder="ค้นหาเบอร์โทร หรือ ชื่อเล่น..."
            value={searchAccount}
            onChange={(e) => setSearchAccount(e.target.value)}
            className="px-4 py-2.5 bg-[#F7F5F0] hairline-all text-xs text-[#121212] focus:outline-none w-full sm:w-64"
          />
        </div>

        {/* Quick Add Account Form inside DEV Console */}
        <form
          onSubmit={handleQuickAddAccount}
          className="p-5 hairline-all bg-[#EFECE6]/50 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-[#121212] mb-1">
              + เพิ่มบัญชีใหม่ (เบอร์โทร 10 หลัก)
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="เช่น 08XXXXXXXX"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3.5 py-2.5 bg-[#F7F5F0] hairline-all text-xs font-bold"
              required
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-[#121212] mb-1">
              ชื่อเล่น
            </label>
            <input
              type="text"
              placeholder="เช่น บีม"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F5F0] hairline-all text-xs"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-[#121212] mb-1">
              รหัส PIN (6 หลัก)
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="เช่น 123456"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3.5 py-2.5 bg-[#F7F5F0] hairline-all text-xs font-bold"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-[#121212] mb-1">
              สิทธิ์เริ่มต้น
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as AccountRole)}
              className="w-full px-3 py-2.5 bg-[#F7F5F0] hairline-all text-xs font-bold"
            >
              <option value="STAFF">★ พนักงานร้าน (STAFF)</option>
              <option value="CUSTOMER">ลูกค้าทั่วไป (CUSTOMER)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#121212] hover:bg-[#D9381E] text-[#F7F5F0] text-xs font-bold editorial-transition"
            >
              + เพิ่มเข้าสู่ระบบ
            </button>
          </div>
        </form>

        <div className="hairline-all overflow-x-auto bg-[#F7F5F0]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="hairline-b bg-[#EFECE6] text-xs font-bold text-[#68645E]">
                <th className="py-3.5 px-4 hairline-r">#</th>
                <th className="py-3.5 px-4 hairline-r">เบอร์โทรศัพท์ (ID)</th>
                <th className="py-3.5 px-4 hairline-r">ชื่อบัญชี</th>
                <th className="py-3.5 px-4 hairline-r">รหัส PIN 6 หลัก</th>
                <th className="py-3.5 px-4 hairline-r">สถานะบัญชี (Role)</th>
                <th className="py-3.5 px-4 hairline-r">ชั่วโมงสะสม / เข้าใช้</th>
                <th className="py-3.5 px-4">จัดการสิทธิ์ (Promote / Demote)</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m, idx) => {
                const isStaff = m.role === 'STAFF';
                return (
                  <tr
                    key={m.phone}
                    className={`hairline-b transition-colors ${
                      isStaff ? 'bg-[#EFECE6]/70' : 'hover:bg-[#EFECE6]/35'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold hairline-r">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-[#121212] hairline-r">
                      {m.phone}
                    </td>
                    <td className="py-3.5 px-4 font-semibold hairline-r">
                      {m.name}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#D9381E] hairline-r">
                      {m.pin || '••••••'}
                    </td>
                    <td className="py-3.5 px-4 hairline-r">
                      {isStaff ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121212] text-[#F7F5F0] text-xs font-bold">
                          ★ พนักงานร้าน (STAFF)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 hairline-all bg-[#F7F5F0] text-[#68645E] text-xs font-semibold">
                          ลูกค้าทั่วไป (CUSTOMER)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 hairline-r text-xs">
                      สะสม <strong>{m.totalHoursAccumulated} ชม.</strong> (ล็อกอิน {m.loginCount || 1} ครั้ง)
                    </td>
                    <td className="py-3.5 px-4">
                      {isStaff ? (
                        <button
                          type="button"
                          onClick={() => handlePromoteToggle(m)}
                          className="px-3.5 py-2 hairline-all bg-[#F7F5F0] hover:bg-[#D9381E] hover:text-[#F7F5F0] text-xs font-bold editorial-transition"
                        >
                          ⬇️ ถอนสิทธิ์กลับเป็นลูกค้า
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePromoteToggle(m)}
                          className="px-3.5 py-2 bg-[#D9381E] hover:bg-[#121212] text-[#F7F5F0] text-xs font-bold editorial-transition"
                        >
                          ⬆️ โปรโมทเป็นพนักงานร้าน
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          PART 3: ตารางบัญชีพนักงานร้านที่เข้าหน้า /admin ได้ตอนนี้
         ===================================================================== */}
      <div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="font-display text-xl sm:text-2xl text-[#121212]">
            3. รายชื่อพนักงานร้านที่มีสิทธิ์เข้าหน้าจัดการร้าน (/admin) ทั้งหมด ({staffList.length} รหัส)
          </h2>
          <span className="text-xs text-[#68645E]">
            พนักงานใช้ไอดีเบอร์โทร + รหัส PIN 6 หลักของตนเองกดเข้าหน้า /admin ได้ทันที
          </span>
        </div>

        <div className="hairline-all overflow-x-auto bg-[#F7F5F0]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="hairline-b bg-[#EFECE6] text-xs font-bold text-[#68645E]">
                <th className="py-3.5 px-5 hairline-r">รหัสพนักงาน</th>
                <th className="py-3.5 px-5 hairline-r">ไอดี (เบอร์โทรศัพท์)</th>
                <th className="py-3.5 px-5 hairline-r">ชื่อพนักงาน</th>
                <th className="py-3.5 px-5 hairline-r">รหัส PIN เข้าหน้า /admin</th>
                <th className="py-3.5 px-5">ที่มาของสิทธิ์</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((st) => (
                <tr key={st.staffId} className="hairline-b hover:bg-[#EFECE6]/40">
                  <td className="py-3.5 px-5 font-bold hairline-r">{st.staffId}</td>
                  <td className="py-3.5 px-5 font-bold text-[#121212] hairline-r">
                    {st.phone}
                  </td>
                  <td className="py-3.5 px-5 font-semibold hairline-r">{st.name}</td>
                  <td className="py-3.5 px-5 font-bold text-base text-[#D9381E] hairline-r">
                    {st.pinCode}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#68645E]">
                    ✓ โปรโมทจากบัญชีสมาชิกผ่านหน้า DEV
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          PART 4: ข้อมูลรายการจองทั้งหมด (ยอดจอง / ยอดเข้าใช้งาน / ยอดปฏิเสธ)
         ===================================================================== */}
      <div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="font-display text-xl sm:text-2xl text-[#121212]">
            4. ประวัติรายการจองทั้งหมดในระบบ ({bookings.length} รายการ)
          </h2>
          <span className="text-xs text-[#68645E]">
            แสดงทั้งรายการที่รอตรวจ ยืนยันแล้ว เข้าใช้งานแล้ว และถูกปฏิเสธ
          </span>
        </div>

        <div className="hairline-all overflow-x-auto bg-[#F7F5F0]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="hairline-b bg-[#EFECE6] text-xs font-bold text-[#68645E]">
                <th className="py-3.5 px-4 hairline-r">รหัสการจอง</th>
                <th className="py-3.5 px-4 hairline-r">ห้อง</th>
                <th className="py-3.5 px-4 hairline-r">ผู้จอง &amp; เบอร์โทร</th>
                <th className="py-3.5 px-4 hairline-r">วันที่ &amp; เวลา</th>
                <th className="py-3.5 px-4 hairline-r">ยอดเงิน</th>
                <th className="py-3.5 px-4 hairline-r">สถานะ</th>
                <th className="py-3.5 px-4">เปลี่ยนสถานะ (DEV Override)</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const badge = getStatusBadge(b.status);
                return (
                  <tr key={b.id} className="hairline-b hover:bg-[#EFECE6]/40">
                    <td className="py-3.5 px-4 font-bold hairline-r">{b.bookingCode}</td>
                    <td className="py-3.5 px-4 font-bold text-[#D9381E] hairline-r">
                      ห้อง {b.roomId}
                    </td>
                    <td className="py-3.5 px-4 hairline-r">
                      <strong>{b.customerName}</strong> ({b.customerPhone})
                    </td>
                    <td className="py-3.5 px-4 hairline-r">
                      {b.bookingDate} · {b.startTime}–{b.endTime} ({b.totalHours} ชม.)
                    </td>
                    <td className="py-3.5 px-4 font-bold hairline-r">
                      {formatBaht(b.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 hairline-r">
                      <span className={`text-[11px] font-bold px-2.5 py-1 border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleBookingStatusChange(b.id, 'CONFIRMED')}
                        className="px-2.5 py-1 bg-[#121212] text-[#F7F5F0] text-[11px] font-bold hover:bg-[#D9381E]"
                      >
                        อนุมัติ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookingStatusChange(b.id, 'COMPLETED')}
                        className="px-2.5 py-1 hairline-all bg-[#EFECE6] text-[#121212] text-[11px] font-bold hover:bg-[#121212] hover:text-[#F7F5F0]"
                      >
                        เข้าใช้แล้ว
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookingStatusChange(b.id, 'REJECTED')}
                        className="px-2.5 py-1 hairline-all text-[#D9381E] text-[11px] font-bold hover:bg-[#D9381E] hover:text-[#F7F5F0]"
                      >
                        ปฏิเสธ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
