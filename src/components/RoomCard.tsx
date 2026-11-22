import Link from 'next/link';
import { Room } from '@/types';
import { formatBaht } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="bg-[#F7F5F0] hairline-all p-6 flex flex-col justify-between editorial-transition hover:bg-[#EFECE6]/50">
      <div>
        <div className="flex justify-between items-baseline font-tech text-xs text-[#68645E] mb-3">
          <span>{room.roomNumber}</span>
          <span>{room.capacityMin}–{room.capacityMax} PERSONS</span>
        </div>

        <div className="image-zoom-frame aspect-[4/3] w-full hairline-all mb-4 bg-[#EFECE6]">
          <img
            src={room.imageUrl}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="font-display text-3xl text-[#121212] mb-2">{room.name}</h3>
        <p className="text-xs text-[#68645E] leading-relaxed mb-4">{room.description}</p>
      </div>

      <div className="pt-4 hairline-t flex items-center justify-between">
        <span className="font-tech text-sm font-semibold text-[#121212]">
          {formatBaht(room.pricePerHour)} / HR
        </span>
        <Link
          href={`/booking?roomId=${room.id}`}
          className="font-tech text-xs uppercase tracking-wider text-[#D9381E] link-editorial"
        >
          RESERVE →
        </Link>
      </div>
    </div>
  );
}
