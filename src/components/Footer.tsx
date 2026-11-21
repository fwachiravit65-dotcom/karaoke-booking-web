import { Mic2, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/60 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mic2 className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white text-base">NEON BEAT KARAOKE</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            สัมผัสประสบการณ์ร้องคาราโอเกะระดับพรีเมียม ระบบเสียง Hi-End แสงสีจัดเต็ม พร้อมเมนูอาหารและเครื่องดื่มบริการครบวงจร
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-white text-sm">ข้อมูลติดต่อ</h4>
          <div className="flex items-center gap-2 text-xs">
            <Phone className="w-4 h-4 text-purple-400" />
            <span>02-123-4567 หรือ LINE: @neonbeatkaraoke</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-pink-400" />
            <span>123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>เปิดบริการทุกวัน: 14:00 น. - 02:00 น.</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white text-sm mb-2">ระบบจองห้องออนไลน์</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            จองสะดวกตลอด 24 ชั่วโมง การันตีห้องว่างด้วยระบบอัตโนมัติ ไม่ต้องกังวลเรื่องการจองชนกัน
          </p>
          <span className="inline-block px-3 py-1 bg-purple-950/60 border border-purple-500/30 rounded-full text-[11px] text-purple-300">
            Powered by Next.js & Supabase
          </span>
        </div>
      </div>
      <div className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} NEON BEAT Karaoke Club. All rights reserved.
      </div>
    </footer>
  );
}
