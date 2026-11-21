import Link from 'next/link';
import { Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { Room } from '@/types';
import { formatBaht } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition group flex flex-col">
      {/* Room Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={room.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30 text-xs font-semibold text-purple-300">
          ห้อง {room.roomNumber}
        </div>
        <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow">
          {formatBaht(room.pricePerHour)} / ชม.
        </div>
      </div>

      {/* Room Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
              {room.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>{room.capacityMin} - {room.capacityMax} ท่าน</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
            {room.description}
          </p>

          {/* Features */}
          <div className="space-y-1.5 mb-5">
            {room.features?.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={`/booking?roomId=${room.id}`}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
        >
          <span>เลือกจองห้องนี้</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
