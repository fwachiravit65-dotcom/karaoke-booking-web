import Link from 'next/link';
import { Mic2, Calendar, Search, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              NEON BEAT
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-medium tracking-widest uppercase">
              Karaoke Club & Lounge
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-300 hover:text-white transition hidden sm:inline"
          >
            ประเภทห้อง
          </Link>
          <Link
            href="/status"
            className="text-sm font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-purple-400" />
            <span>เช็คสถานะการจอง</span>
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">สำหรับแอดมิน</span>
          </Link>
          <Link
            href="/booking"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold shadow-md shadow-purple-500/20 hover:opacity-95 hover:shadow-purple-500/40 transition flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>จองห้องทันที</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
