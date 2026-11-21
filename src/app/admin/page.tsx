'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  Phone, 
  FileText, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';
import { formatBaht, getStatusBadge } from '@/lib/utils';
import { Booking, BookingStatus } from '@/types';

const INITIAL_ADMIN_BOOKINGS: Booking[] = [
  {
    id: 'b-101',
    bookingCode: 'KB-20261122-A8F29',
    roomId: 'room-2',
    customerName: 'คุณสมชาย ใจดี',
    customerPhone: '0812345678',
    customerEmail: 'somchai@example.com',
    bookingDate: '2026-11-22',
    startTime: '19:00',
    endTime: '22:00',
    totalHours: 3,
    roomCharge: 1200,
    packageCharge: 299,
    totalAmount: 1499,
    depositAmount: 750,
    status: 'PENDING',
    slipImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
    createdAt: '2026-11-22T10:00:00Z',
  },
  {
    id: 'b-102',
    bookingCode: 'KB-20261122-C3112',
    roomId: 'room-3',
    customerName: 'คุณณิชา ศิริพร',
    customerPhone: '0899887766',
    bookingDate: '2026-11-22',
    startTime: '20:00',
    endTime: '23:00',
    totalHours: 3,
    roomCharge: 1950,
    packageCharge: 390,
    totalAmount: 2340,
    depositAmount: 1170,
    status: 'CONFIRMED',
    slipImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
    createdAt: '2026-11-22T08:15:00Z',
  },
  {
    id: 'b-103',
    bookingCode: 'KB-20261122-D9481',
    roomId: 'room-1',
    customerName: 'คุณเกรียงไกร มีสุข',
    customerPhone: '0823334444',
    bookingDate: '2026-11-22',
    startTime: '15:00',
    endTime: '17:00',
    totalHours: 2,
    roomCharge: 500,
    packageCharge: 0,
    totalAmount: 500,
    depositAmount: 250,
    status: 'COMPLETED',
    createdAt: '2026-11-22T06:00:00Z',
  },
];

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_ADMIN_BOOKINGS);
  const [filter, setFilter] = useState<'ALL' | BookingStatus>('ALL');

  const updateStatus = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-white">ระบบจัดการหน้าร้าน (Admin Portal)</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            ตรวจสอบหลักฐานการโอนเงิน ยืนยันคิวห้องคาราโอเกะ และดูสถิติการจอง
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ระบบออนไลน์ปกติ
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-2">
            <span>รอตรวจสลิปโอนมัดจำ</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{pendingCount} รายการ</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-2">
            <span>ยืนยันห้องแล้ว (Active)</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{confirmedCount} รายการ</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-2">
            <span>ยอดขายที่ยืนยันแล้ว</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{formatBaht(totalRevenue)}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab === 'ALL' && 'ทั้งหมด'}
            {tab === 'PENDING' && `รอตรวจสลิป (${pendingCount})`}
            {tab === 'CONFIRMED' && 'ยืนยันแล้ว'}
            {tab === 'COMPLETED' && 'เสร็จสิ้น'}
            {tab === 'REJECTED' && 'สลิปไม่ผ่าน'}
          </button>
        ))}
      </div>

      {/* Bookings Table / Cards */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const badge = getStatusBadge(item.status);
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-purple-400">
                    {item.bookingCode}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{item.customerName}</span>
                  <span className="text-xs font-normal text-slate-400">({item.customerPhone})</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {item.bookingDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                    {item.startTime} - {item.endTime} น. ({item.totalHours} ชม.)
                  </span>
                  <span className="text-amber-400 font-semibold">
                    มัดจำ: {formatBaht(item.depositAmount)} / ยอดเต็ม: {formatBaht(item.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Actions & Slip Preview */}
              <div className="flex items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                {item.slipImageUrl && (
                  <a
                    href={item.slipImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>ดูสลิปโอน</span>
                  </a>
                )}

                {item.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateStatus(item.id, 'CONFIRMED')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติห้อง</span>
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, 'REJECTED')}
                      className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ปฏิเสธสลิป</span>
                    </button>
                  </>
                )}

                {item.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateStatus(item.id, 'COMPLETED')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>เช็คเอาท์ (เสร็จสิ้น)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
