import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBaht(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateEndTime(startTime: string, hours: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const endHour = (h + hours) % 24;
  return `${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'CONFIRMED · ยืนยันห้องแล้ว', color: 'bg-[#121212] text-[#F7F5F0] border-[#121212]' };
    case 'PENDING':
      return { label: 'PENDING · รอตรวจสลิป', color: 'bg-[#EFECE6] text-[#121212] border-[#121212]/30' };
    case 'REJECTED':
      return { label: 'REJECTED · สลิปไม่ถูกต้อง', color: 'bg-[#D9381E]/10 text-[#D9381E] border-[#D9381E]/40' };
    case 'CANCELLED':
      return { label: 'CANCELLED · ยกเลิก', color: 'bg-transparent text-[#68645E] border-[#68645E]/30' };
    case 'COMPLETED':
      return { label: 'COMPLETED · เข้าใช้บริการแล้ว', color: 'bg-transparent text-[#121212] border-[#121212]' };
    default:
      return { label: status, color: 'bg-transparent text-[#68645E] border-[#68645E]/30' };
  }
}
