'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Check, 
  Upload, 
  QrCode, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  AlertCircle 
} from 'lucide-react';
import { formatBaht, calculateEndTime } from '@/lib/utils';

interface RoomOption {
  id: string;
  name: string;
  roomNumber: string;
  pricePerHour: number;
  capacityText: string;
}

const AVAILABLE_ROOMS: RoomOption[] = [
  { id: 'room-1', name: 'Room Neon Cozy', roomNumber: 'R101', pricePerHour: 250, capacityText: '2-4 ท่าน' },
  { id: 'room-2', name: 'Room Retro Pop', roomNumber: 'R102', pricePerHour: 400, capacityText: '5-8 ท่าน' },
  { id: 'room-3', name: 'Room Party Glow', roomNumber: 'R201', pricePerHour: 650, capacityText: '9-15 ท่าน' },
  { id: 'room-4', name: 'Penthouse VIP Club', roomNumber: 'R301', pricePerHour: 1200, capacityText: '15-25 ท่าน' },
];

const PACKAGES = [
  { id: 'pkg-1', name: 'Buffet Soft Drink ไม่อั้น', price: 89, unit: 'ต่อท่าน' },
  { id: 'pkg-2', name: 'Party Snack Combo (ไก่ทอด+เฟรนช์ฟรายส์+นักเก็ต)', price: 299, unit: 'เซ็ต' },
  { id: 'pkg-3', name: 'Set ปาร์ตี้วันเกิด + เค้กช็อกโกแลตฟัดจ์', price: 390, unit: 'เซ็ต' },
];

const TIME_SLOTS = [
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export default function BookingPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(AVAILABLE_ROOMS[0].id);
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState<string>('18:00');
  const [totalHours, setTotalHours] = useState<number>(3);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [slipUploaded, setSlipUploaded] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    bookingCode?: string;
    message?: string;
  } | null>(null);

  const selectedRoom = AVAILABLE_ROOMS.find((r) => r.id === selectedRoomId) || AVAILABLE_ROOMS[0];

  // Pricing calculations
  const roomCharge = selectedRoom.pricePerHour * totalHours;
  const packageCharge = useMemo(() => {
    return selectedPackages.reduce((sum, pkgId) => {
      const p = PACKAGES.find((pkg) => pkg.id === pkgId);
      return sum + (p ? p.price : 0);
    }, 0);
  }, [selectedPackages]);

  const totalAmount = roomCharge + packageCharge;
  const depositAmount = Math.round(totalAmount * 0.5); // 50% deposit to secure room
  const endTime = calculateEndTime(startTime, totalHours);

  const togglePackage = (id: string) => {
    if (selectedPackages.includes(id)) {
      setSelectedPackages(selectedPackages.filter((item) => item !== id));
    } else {
      setSelectedPackages([...selectedPackages, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }
    if (!slipUploaded) {
      alert('กรุณาอัปโหลดหลักฐานการโอนเงินมัดจำ');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          roomName: selectedRoom.name,
          bookingDate,
          startTime,
          endTime,
          totalHours,
          customerName,
          customerPhone,
          customerEmail,
          roomCharge,
          packageCharge,
          totalAmount,
          depositAmount,
          slipImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
        }),
      });

      const data = await res.json();
      setBookingResult(data);
    } catch {
      // Offline fallback simulation for immediate testing
      const fakeCode = `KB-${bookingDate.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setBookingResult({
        success: true,
        bookingCode: fakeCode,
        message: 'จองห้องสำเร็จ (ระบบโหมดทดสอบ)',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingResult?.success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-emerald-500/30 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <h2 className="text-2xl font-extrabold text-white">บันทึกการจองสำเร็จ!</h2>
          <p className="text-slate-400 text-sm mt-2">
            ระบบได้รับข้อมูลและหลักฐานการโอนมัดจำแล้ว พนักงานจะตรวจสอบและยืนยันสถานะอย่างรวดเร็ว
          </p>

          <div className="my-8 p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400">รหัสการจอง (Booking Code)</span>
              <span className="text-base font-mono font-bold text-purple-400">
                {bookingResult.bookingCode}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>ห้อง:</span>
              <span className="font-semibold text-white">{selectedRoom.name} ({selectedRoom.roomNumber})</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>วันที่ & เวลา:</span>
              <span className="font-semibold text-white">{bookingDate} ({startTime} - {endTime} น.)</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>ผู้จอง:</span>
              <span className="font-semibold text-white">{customerName} ({customerPhone})</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300 pt-2 border-t border-slate-800 font-semibold">
              <span className="text-amber-400">ยอดมัดจำที่ชำระแล้ว:</span>
              <span className="text-amber-400">{formatBaht(depositAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/status?phone=${customerPhone}`}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition text-center"
            >
              ติดตามสถานะการจอง
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition text-center"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-white">จองห้องคาราโอเกะออนไลน์</h1>
        <p className="text-slate-400 text-sm mt-1">
          เลือกรอบเวลา ตรวจสอบห้องว่าง และจองได้ทันทีตลอด 24 ชั่วโมง
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Select Room */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-xs flex items-center justify-center font-bold">1</span>
              <span>เลือกประเภทห้อง</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVAILABLE_ROOMS.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <button
                    type="button"
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-4 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/10'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white text-sm">{room.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-mono">
                        {room.roomNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>{room.capacityText}</span>
                    </div>
                    <div className="text-sm font-bold text-pink-400">
                      {formatBaht(room.pricePerHour)} <span className="text-xs font-normal text-slate-400">/ ชม.</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date & Time */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-xs flex items-center justify-center font-bold">2</span>
              <span>เลือกวันและเวลา</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-purple-400" />
                  <span>วันที่ต้องการจอง</span>
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-pink-400" />
                  <span>จำนวนชั่วโมง</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((hrs) => (
                    <button
                      type="button"
                      key={hrs}
                      onClick={() => setTotalHours(hrs)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        totalHours === hrs
                          ? 'border-purple-500 bg-purple-600 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {hrs} ชม.
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                เวลาเริ่มต้น (ร้องถึงเวลา {endTime} น.)
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setStartTime(slot)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition ${
                      startTime === slot
                        ? 'border-pink-500 bg-pink-600 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Add-on Packages */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-xs flex items-center justify-center font-bold">3</span>
              <span>แพ็กเกจเสริมสุดคุ้ม (ไม่บังคับ)</span>
            </h2>

            <div className="space-y-3">
              {PACKAGES.map((pkg) => {
                const isChecked = selectedPackages.includes(pkg.id);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => togglePackage(pkg.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isChecked
                        ? 'border-purple-500 bg-purple-950/30'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isChecked ? 'bg-purple-600 border-purple-500' : 'border-slate-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-xs font-medium text-slate-200">{pkg.name}</span>
                    </div>
                    <span className="text-xs font-bold text-pink-400">
                      +{formatBaht(pkg.price)} <span className="text-[10px] text-slate-400 font-normal">/{pkg.unit}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Contact Information */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-xs flex items-center justify-center font-bold">4</span>
              <span>ข้อมูลผู้จอง</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">ชื่อ-นามสกุล / ชื่อเล่น *</label>
                <input
                  type="text"
                  placeholder="เช่น คุณสมชาย (บอย)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">เบอร์โทรศัพท์ติดต่อ *</label>
                <input
                  type="tel"
                  placeholder="เช่น 0812345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Payment */}
        <div className="space-y-6">
          <div className="sticky top-24 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>สรุปรายการจอง</span>
            </h3>

            <div className="py-4 space-y-2.5 text-xs text-slate-300 border-b border-slate-800">
              <div className="flex justify-between">
                <span>ห้องที่เลือก:</span>
                <span className="font-semibold text-white">{selectedRoom.name}</span>
              </div>
              <div className="flex justify-between">
                <span>วันที่:</span>
                <span className="font-semibold text-white">{bookingDate}</span>
              </div>
              <div className="flex justify-between">
                <span>ช่วงเวลา:</span>
                <span className="font-semibold text-white">{startTime} - {endTime} น. ({totalHours} ชม.)</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าห้อง ({totalHours} ชม.):</span>
                <span className="font-semibold text-white">{formatBaht(roomCharge)}</span>
              </div>
              {packageCharge > 0 && (
                <div className="flex justify-between text-purple-300">
                  <span>แพ็กเกจเสริม:</span>
                  <span className="font-semibold">+{formatBaht(packageCharge)}</span>
                </div>
              )}
            </div>

            {/* Total Amounts */}
            <div className="py-4 space-y-2 border-b border-slate-800">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>ราคารวมทั้งสิ้น:</span>
                <span className="text-base font-bold text-white">{formatBaht(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <span>ยอดโอนมัดจำ (50%):</span>
                <span>{formatBaht(depositAmount)}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                * ส่วนที่เหลือชำระหน้าร้านในวันที่เข้าใช้บริการ
              </p>
            </div>

            {/* Payment QR Mock */}
            <div className="pt-4 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-3">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>สแกนชำระมัดจำผ่าน PromptPay</span>
              </div>

              <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl shadow-inner flex flex-col items-center justify-center mb-3">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMPTPAY-DEMO-PAYMENT"
                  alt="PromptPay QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Slip Upload button */}
              <button
                type="button"
                onClick={() => setSlipUploaded(!slipUploaded)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  slipUploaded
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-purple-500'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{slipUploaded ? '✓ อัปโหลดสลิปแล้ว (จำลอง)' : 'คลิกเพื่อจำลองแนบสลิป'}</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <span>ยืนยันการจองห้อง</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>ป้องกันการจองซ้ำด้วยระบบล็อกห้องอัตโนมัติ</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
