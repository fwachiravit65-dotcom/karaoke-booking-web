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
      return { label: 'ยืนยันแล้ว', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    case 'PENDING':
      return { label: 'รอตรวจสอบสลิป', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    case 'REJECTED':
      return { label: 'สลิปไม่ถูกต้อง', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    case 'CANCELLED':
      return { label: 'ยกเลิกแล้ว', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    case 'COMPLETED':
      return { label: 'เสร็จสิ้นบริการ', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    default:
      return { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  }
}
