import Link from 'next/link';
import { Calendar, Mic2, Sparkles, Volume2, ShieldCheck, UtensilsCrossed, ArrowRight } from 'lucide-react';
import RoomCard from '@/components/RoomCard';
import { Room } from '@/types';

// Fallback demo rooms for initial testing before connecting live Supabase
const DEMO_ROOMS: Room[] = [
  {
    id: 'room-1',
    roomNumber: 'R101',
    name: 'Room Neon Cozy',
    type: 'STANDARD_S',
    capacityMin: 2,
    capacityMax: 4,
    pricePerHour: 250,
    description: 'ห้องขนาดกะทัดรัด บรรยากาศอบอุ่น เหมาะสำหรับคู่รักหรือเพื่อนสนิท 2-4 คน ระบบเสียง JBL ชัดใส',
    features: ['Smart TV 55 นิ้ว คมชัด 4K', 'ไมโครโฟนไร้สาย 2 ตัว', 'ไฟนีออนปรับสีตามจังหวะเพลง'],
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'room-2',
    roomNumber: 'R102',
    name: 'Room Retro Pop',
    type: 'STANDARD_M',
    capacityMin: 5,
    capacityMax: 8,
    pricePerHour: 400,
    description: 'ห้องขนาดกลาง สไตล์เรโทร ยอดนิยมสำหรับการฉลองวันเกิดและปาร์ตี้เพื่อนสนิท ร้องเพลงเต้นมันส์ๆ',
    features: ['Smart TV 65 นิ้ว', 'ไมค์ไร้สาย 4 ตัว ตัดเสียงรบกวน', 'ระบบเสียง Soundbar + ซับวูฟเฟอร์', 'โต๊ะวางอาหารขนาดใหญ่'],
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'room-3',
    roomNumber: 'R201',
    name: 'Room Party Glow',
    type: 'PARTY_L',
    capacityMin: 9,
    capacityMax: 15,
    pricePerHour: 650,
    description: 'ห้องปาร์ตี้ขนาดใหญ่ พร้อมเวทีมินิ แสงเลเซอร์ และคลังเพลงอัปเดตสากล/ไทย/เกาหลีครบครัน',
    features: ['หน้าจอโปรเจกเตอร์ 100 นิ้ว', 'ไมค์ 6 ตัว ร้องพร้อมกันสะใจ', 'ไฟเลเซอร์ปาร์ตี้ Disco Effect', 'โซฟารูปตัว U รองรับกลุ่มใหญ่'],
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'room-4',
    roomNumber: 'R301',
    name: 'Penthouse VIP Club',
    type: 'VIP_LUXURY',
    capacityMin: 15,
    capacityMax: 25,
    pricePerHour: 1200,
    description: 'ห้องวีไอพีสุดหรู ห้องน้ำในตัว เคาน์เตอร์บาร์ส่วนตัว และระบบเครื่องเสียงระดับคอนเสิร์ต',
    features: ['จอ LED Wall ขนาดยักษ์ 150 นิ้ว', 'ห้องน้ำส่วนตัวภายในห้อง', 'เคาน์เตอร์บาร์พร้อมตู้แช่ไวน์', 'โซนรับประทานอาหารแยกเป็นสัดส่วน'],
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop',
    isActive: true,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Neon Glow Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/20 blur-[130px] -z-10 rounded-full" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-pink-600/20 blur-[120px] -z-10 rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>ระบบจองห้องออนไลน์แบบเรียลไทม์ ปลอดภัย ไม่มีการจองซ้ำ</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          ปลดปล่อยเสียงเพลงในตัวคุณที่{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
            NEON BEAT
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          สัมผัสประสบการณ์คาราโอเกะระดับพรีเมียม ระบบเสียงกระหึ่ม แสงสีอลังการ
          เลือกวัน เวลา และขนาดห้องที่ต้องการ แล้วจองผ่านออนไลน์ได้ทันทีตลอด 24 ชั่วโมง
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/booking"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:scale-105 transition flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span>เริ่มต้นจองห้องตอนนี้</span>
          </Link>
          <Link
            href="/status"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-base transition flex items-center justify-center gap-2"
          >
            <span>ตรวจสอบสถานะการจอง</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Quick Highlights */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Volume2 className="w-6 h-6 text-purple-400 mb-2" />
            <div className="font-bold text-white text-sm">ระบบเสียง Hi-End</div>
            <div className="text-xs text-slate-400">ลำโพง JBL & ไมค์ไร้สายความไวสูง</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
            <div className="font-bold text-white text-sm">การันตีห้อง 100%</div>
            <div className="text-xs text-slate-400">ระบบคลาวด์ล็อกห้องอัตโนมัติ</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Mic2 className="w-6 h-6 text-pink-400 mb-2" />
            <div className="font-bold text-white text-sm">เพลงอัปเดตทุกสัปดาห์</div>
            <div className="text-xs text-slate-400">ไทย, สากล, K-POP, J-POP กว่าแสนเพลง</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <UtensilsCrossed className="w-6 h-6 text-amber-400 mb-2" />
            <div className="font-bold text-white text-sm">อาหาร & เครื่องดื่ม</div>
            <div className="text-xs text-slate-400">สั่งผ่านแท็บเล็ต เสิร์ฟไวถึงห้อง</div>
          </div>
        </div>
      </section>

      {/* Room Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white">เลือกห้องคาราโอเกะที่ตรงใจคุณ</h2>
          <p className="mt-2 text-sm text-slate-400">
            ห้องหลากหลายขนาดตั้งแต่ 2 ท่าน จนถึงงานเลี้ยง 25 ท่าน พร้อมสิ่งอำนวยความสะดวกครบครัน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* 4 Steps Booking Guide */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">จองง่ายๆ เพียง 4 ขั้นตอน</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-10">สะดวกรวดเร็ว ได้รับการยืนยันทันใจ</p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-left">
            <div className="relative p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-2xl font-black text-purple-400 mb-2 block">01</span>
              <h4 className="font-semibold text-white text-sm mb-1">เลือกประเภทห้อง</h4>
              <p className="text-xs text-slate-400">เลือกขนาดห้องที่เหมาะกับจำนวนเพื่อนของคุณ</p>
            </div>
            <div className="relative p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-2xl font-black text-pink-400 mb-2 block">02</span>
              <h4 className="font-semibold text-white text-sm mb-1">เลือกวันและเวลา</h4>
              <p className="text-xs text-slate-400">ระบุวันที่ เวลาเริ่มต้น และจำนวนชั่วโมงที่ต้องการ</p>
            </div>
            <div className="relative p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-2xl font-black text-amber-400 mb-2 block">03</span>
              <h4 className="font-semibold text-white text-sm mb-1">โอนมัดจำ & แนบสลิป</h4>
              <p className="text-xs text-slate-400">ชำระมัดจำเพื่อล็อคห้องทันที อัปโหลดสลิปในระบบ</p>
            </div>
            <div className="relative p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-2xl font-black text-emerald-400 mb-2 block">04</span>
              <h4 className="font-semibold text-white text-sm mb-1">รับรหัสการจอง</h4>
              <p className="text-xs text-slate-400">รับรหัสเพื่อยื่นให้พนักงานหน้าร้านเมื่อมาถึง</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
