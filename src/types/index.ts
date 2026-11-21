export type RoomType = 'STANDARD_S' | 'STANDARD_M' | 'PARTY_L' | 'VIP_LUXURY';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED' | 'COMPLETED';

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: RoomType;
  capacityMin: number;
  capacityMax: number;
  pricePerHour: number;
  description: string;
  features: string[];
  imageUrl: string;
  isActive: boolean;
}

export interface PackageAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string;
  roomId: string;
  room?: Room;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  totalHours: number;
  roomCharge: number;
  packageCharge: number;
  totalAmount: number;
  depositAmount: number;
  status: BookingStatus;
  slipImageUrl?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface BookingFormData {
  roomId: string;
  bookingDate: string;
  startTime: string;
  totalHours: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  selectedPackageIds: string[];
  slipImageUrl?: string;
}
