import { Booking, BookingStatus } from '@/types';

export type AccountRole = 'CUSTOMER' | 'STAFF';

export interface MemberProfile {
  phone: string;
  name: string;
  pin: string;
  pinHash: string;
  role: AccountRole;
  promotedAt?: string;
  staffTitle?: string;
  totalHoursAccumulated: number;
  freeHoursAvailable: number;
  createdAt: string;
  loginCount?: number;
}

export interface StaffAccount {
  staffId: string;
  phone: string;
  name: string;
  pinCode: string;
  branch: string;
  role: string;
  isPromotedMember?: boolean;
}

export interface DevAccount {
  devId: string;
  password: string;
  role: string;
}

// ============================================================================
// HARDCODED DEV CREDENTIALS (แก้ไขหรือเพิ่มไอดีทีม DEV ได้ในโค้ดส่วนนี้เท่านั้น)
// ============================================================================
export const DEV_ACCOUNTS: DevAccount[] = [
  {
    devId: '0956602420',
    password: '0956602420A',
    role: 'Lead DEV & System Owner',
  },
];

// Default master staff PINs (in addition to any member promoted to STAFF via DEV page)
export const MASTER_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    staffId: 'STF-MASTER',
    phone: '0956602420',
    name: 'รหัสกลางเคาน์เตอร์หน้าร้าน (Master Counter)',
    pinCode: '888888',
    branch: 'สาขาร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทยาลัย)',
    role: 'Master Counter PIN',
  },
];

const MEMBERS_STORAGE_KEY = 'mood_karaoke_members_v2';
const SESSION_STORAGE_KEY = 'mood_karaoke_active_session_v2';
const LOCKOUT_STORAGE_KEY = 'mood_karaoke_pin_lockout_v2';
const BOOKINGS_STORAGE_KEY = 'mood_karaoke_bookings_v2';
const VISITS_STORAGE_KEY = 'mood_karaoke_site_visits_v2';

export function verifyDevLogin(
  devId: string,
  password: string
): { success: boolean; account?: DevAccount } {
  const match = DEV_ACCOUNTS.find(
    (d) => d.devId === devId.trim() && d.password === password.trim()
  );
  if (!match) return { success: false };
  return { success: true, account: match };
}

export function hashPin(phone: string, pin: string): string {
  const raw = `MOOD_SALT_${phone.trim()}_${pin.trim()}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return `PINHASH_${(hash >>> 0).toString(16)}`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

function getDefaultSeedMembers(): MemberProfile[] {
  return [
    {
      phone: '0956602420',
      name: 'flook',
      pin: '123456',
      pinHash: hashPin('0956602420', '123456'),
      role: 'STAFF',
      promotedAt: '2026-11-22T10:00:00Z',
      staffTitle: 'ผู้ดูแลร้าน & พนักงานหลัก',
      totalHoursAccumulated: 3,
      freeHoursAvailable: 0,
      createdAt: '2026-11-22T09:00:00Z',
      loginCount: 5,
    },
    {
      phone: '0812345678',
      name: 'มิ้นท์ (แก๊ง ม.6/2)',
      pin: '123456',
      pinHash: hashPin('0812345678', '123456'),
      role: 'CUSTOMER',
      totalHoursAccumulated: 6,
      freeHoursAvailable: 0,
      createdAt: '2026-11-20T15:30:00Z',
      loginCount: 4,
    },
    {
      phone: '0899887766',
      name: 'เจเจ (ชมรมดนตรี ร.ว.)',
      pin: '654321',
      pinHash: hashPin('0899887766', '654321'),
      role: 'CUSTOMER',
      totalHoursAccumulated: 11,
      freeHoursAvailable: 1,
      createdAt: '2026-11-21T16:10:00Z',
      loginCount: 7,
    },
    {
      phone: '0823334444',
      name: 'ปอนด์ (ม.5/4)',
      pin: '111222',
      pinHash: hashPin('0823334444', '111222'),
      role: 'CUSTOMER',
      totalHoursAccumulated: 2,
      freeHoursAvailable: 0,
      createdAt: '2026-11-22T14:20:00Z',
      loginCount: 2,
    },
  ];
}

export function getAllMembers(): MemberProfile[] {
  if (typeof window === 'undefined') return getDefaultSeedMembers();
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) {
      const seed = getDefaultSeedMembers();
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed: MemberProfile[] = JSON.parse(raw);
    return parsed.map((m) => ({
      ...m,
      role: m.role || 'CUSTOMER',
      loginCount: m.loginCount || 1,
    }));
  } catch {
    return getDefaultSeedMembers();
  }
}

function saveAllMembers(members: MemberProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
}

// ============================================================================
// PROMOTE / DEMOTE MEMBER TO STAFF VIA DEV CONSOLE
// ============================================================================
export function toggleMemberStaffRole(
  phone: string,
  makeStaff: boolean,
  staffTitle = 'พนักงานหน้าร้าน (Promoted Staff)'
): MemberProfile[] {
  const normalized = normalizePhone(phone);
  const members = getAllMembers();
  const updated = members.map((m) => {
    if (m.phone !== normalized) return m;
    return {
      ...m,
      role: (makeStaff ? 'STAFF' : 'CUSTOMER') as AccountRole,
      promotedAt: makeStaff ? new Date().toISOString() : undefined,
      staffTitle: makeStaff ? staffTitle : undefined,
    };
  });
  saveAllMembers(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mood-auth-change'));
  }
  return updated;
}

// Get all active staff (Master Staff + Members promoted to STAFF via DEV Console)
export function getAllRegisteredStaff(): StaffAccount[] {
  const members = getAllMembers();
  const promotedMembers: StaffAccount[] = members
    .filter((m) => m.role === 'STAFF')
    .map((m, idx) => ({
      staffId: `STF-${String(idx + 1).padStart(3, '0')}`,
      phone: m.phone,
      name: m.name,
      pinCode: m.pin || '••••••',
      branch: 'สาขาร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทยาลัย)',
      role: m.staffTitle || 'พนักงานร้าน (Promoted via DEV)',
      isPromotedMember: true,
    }));

  return [...promotedMembers, ...MASTER_STAFF_ACCOUNTS];
}

// Verify Staff Login on /admin: accepts either a promoted staff member's PIN (or phone+PIN) OR master PIN 888888
export function verifyStaffPin(pinInput: string, phoneInput?: string): StaffAccount | null {
  const cleanPin = pinInput.trim();
  const cleanPhone = phoneInput ? normalizePhone(phoneInput) : '';

  const allStaff = getAllRegisteredStaff();

  if (cleanPhone) {
    const exactMatch = allStaff.find(
      (s) => s.phone === cleanPhone && s.pinCode === cleanPin
    );
    if (exactMatch) return exactMatch;
  }

  return allStaff.find((s) => s.pinCode === cleanPin) || null;
}

export function getCurrentMember(): MemberProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const sessionPhone = JSON.parse(raw).phone;
    const members = getAllMembers();
    return members.find((m) => m.phone === sessionPhone) || null;
  } catch {
    return null;
  }
}

export function logoutMember() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event('mood-auth-change'));
}

export function registerMember(
  rawPhone: string,
  name: string,
  pin: string
): { success: boolean; message: string; member?: MemberProfile } {
  const phone = normalizePhone(rawPhone);
  if (phone.length < 9 || phone.length > 10) {
    return { success: false, message: 'กรุณากรอกเบอร์โทรศัพท์ 10 หลักให้ถูกต้อง' };
  }
  if (!/^\d{6}$/.test(pin)) {
    return { success: false, message: 'รหัส PIN ต้องเป็นตัวเลข 6 หลักเท่านั้น' };
  }
  if (!name.trim()) {
    return { success: false, message: 'กรุณาระบุชื่อเล่นของคุณ' };
  }

  const members = getAllMembers();
  if (members.some((m) => m.phone === phone)) {
    return {
      success: false,
      message: 'เบอร์โทรศัพท์นี้เป็นสมาชิกอยู่แล้ว กรุณาเลือกเมนูเข้าสู่ระบบ',
    };
  }

  const newMember: MemberProfile = {
    phone,
    name: name.trim(),
    pin,
    pinHash: hashPin(phone, pin),
    role: 'CUSTOMER',
    totalHoursAccumulated: 1,
    freeHoursAvailable: 0,
    createdAt: new Date().toISOString(),
    loginCount: 1,
  };

  const updated = [...members, newMember];
  saveAllMembers(updated);
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ phone: newMember.phone }));
  window.dispatchEvent(new Event('mood-auth-change'));

  return {
    success: true,
    message: 'สมัครสมาชิกสำเร็จ! รับฟรีแสตมป์สะสม 1 ชั่วโมงแรกทันที',
    member: newMember,
  };
}

export function loginMember(
  rawPhone: string,
  pin: string
): { success: boolean; message: string; member?: MemberProfile } {
  const phone = normalizePhone(rawPhone);
  if (phone.length < 9 || phone.length > 10) {
    return { success: false, message: 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก' };
  }
  if (!/^\d{6}$/.test(pin)) {
    return { success: false, message: 'กรุณากดรหัส PIN ให้ครบ 6 หลัก' };
  }

  if (typeof window !== 'undefined') {
    const lockRaw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (lockRaw) {
      const lockData = JSON.parse(lockRaw);
      if (lockData.until && Date.now() < lockData.until) {
        const minsLeft = Math.ceil((lockData.until - Date.now()) / 60000);
        return {
          success: false,
          message: `กดรหัสผิดเกินกำหนด ระบบล็อกชั่วคราว กรุณารออีก ${minsLeft} นาที`,
        };
      }
    }
  }

  const members = getAllMembers();
  const found = members.find((m) => m.phone === phone);

  if (!found) {
    return {
      success: false,
      message: 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ กรุณากดแท็บ "สมัครใหม่"',
    };
  }

  const expectedHash = hashPin(phone, pin);
  if (found.pinHash !== expectedHash) {
    if (typeof window !== 'undefined') {
      const lockRaw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
      const count = lockRaw ? (JSON.parse(lockRaw).count || 0) + 1 : 1;
      const until = count >= 5 ? Date.now() + 5 * 60 * 1000 : null;
      localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify({ count, until }));
      const remaining = Math.max(0, 5 - count);
      return {
        success: false,
        message:
          remaining > 0
            ? `รหัส PIN 6 หลักไม่ถูกต้อง (เหลือโอกาสลองอีก ${remaining} ครั้ง)`
            : 'กดรหัสผิดครบ 5 ครั้ง ระบบล็อกชั่วคราว 5 นาทีเพื่อความปลอดภัย',
      };
    }
    return { success: false, message: 'รหัส PIN 6 หลักไม่ถูกต้อง' };
  }

  // Increment loginCount
  const updated = members.map((m) =>
    m.phone === found.phone ? { ...m, loginCount: (m.loginCount || 1) + 1 } : m
  );
  saveAllMembers(updated);

  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCKOUT_STORAGE_KEY);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ phone: found.phone }));
    window.dispatchEvent(new Event('mood-auth-change'));
  }

  return {
    success: true,
    message: 'เข้าสู่ระบบสำเร็จ',
    member: found,
  };
}

export function addMemberHours(rawPhone: string, hoursToAdd: number) {
  if (typeof window === 'undefined') return;
  const phone = normalizePhone(rawPhone);
  const members = getAllMembers();
  const updated = members.map((m) => {
    if (m.phone !== phone) return m;
    const total = m.totalHoursAccumulated + hoursToAdd;
    const newlyEarnedFree = Math.floor(total / 10);
    return {
      ...m,
      totalHoursAccumulated: total,
      freeHoursAvailable: newlyEarnedFree,
    };
  });
  saveAllMembers(updated);
  window.dispatchEvent(new Event('mood-auth-change'));
}

// ============================================================================
// UNIFIED BOOKINGS & SITE METRICS STORE (FOR /booking, /status, /admin, /dev)
// ============================================================================
function getDefaultSeedBookings(): Booking[] {
  return [
    {
      id: 'b-101',
      bookingCode: 'MD-20261122-R2-8F2',
      roomId: 'R2',
      customerName: 'มิ้นท์ (แก๊ง ม.6/2)',
      customerPhone: '0812345678',
      customerEmail: 'mint@student.ac.th',
      bookingDate: '2026-11-22',
      startTime: '16:00',
      endTime: '18:00',
      totalHours: 2,
      roomCharge: 280,
      packageCharge: 0,
      totalAmount: 280,
      depositAmount: 280,
      status: 'PENDING',
      slipImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
      createdAt: '2026-11-22T10:00:00Z',
    },
    {
      id: 'b-102',
      bookingCode: 'MD-20261122-R7-311',
      roomId: 'R7',
      customerName: 'เจเจ (ชมรมดนตรี ร.ว.)',
      customerPhone: '0899887766',
      bookingDate: '2026-11-22',
      startTime: '18:00',
      endTime: '21:00',
      totalHours: 3,
      roomCharge: 840,
      packageCharge: 0,
      totalAmount: 840,
      depositAmount: 840,
      status: 'CONFIRMED',
      slipImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
      createdAt: '2026-11-22T08:15:00Z',
    },
    {
      id: 'b-103',
      bookingCode: 'MD-20261122-R1-948',
      roomId: 'R1',
      customerName: 'ปอนด์ (ม.5/4)',
      customerPhone: '0823334444',
      bookingDate: '2026-11-22',
      startTime: '15:00',
      endTime: '17:00',
      totalHours: 2,
      roomCharge: 280,
      packageCharge: 0,
      totalAmount: 280,
      depositAmount: 280,
      status: 'COMPLETED',
      createdAt: '2026-11-22T06:00:00Z',
    },
    {
      id: 'b-104',
      bookingCode: 'MD-20261121-R5-409',
      roomId: 'R5',
      customerName: 'บีม & เพื่อน',
      customerPhone: '0865554321',
      bookingDate: '2026-11-21',
      startTime: '19:00',
      endTime: '21:00',
      totalHours: 2,
      roomCharge: 400,
      packageCharge: 0,
      totalAmount: 400,
      depositAmount: 400,
      status: 'REJECTED',
      createdAt: '2026-11-21T12:00:00Z',
    },
  ];
}

export function getAllBookings(): Booking[] {
  if (typeof window === 'undefined') return getDefaultSeedBookings();
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      const seed = getDefaultSeedBookings();
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultSeedBookings();
  }
}

export function saveNewBooking(newBooking: Booking): Booking[] {
  const current = getAllBookings();
  const updated = [newBooking, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('mood-bookings-change'));
  }
  return updated;
}

export function updateBookingStatusInStore(
  bookingId: string,
  newStatus: BookingStatus
): Booking[] {
  const current = getAllBookings();
  const updated = current.map((b) =>
    b.id === bookingId ? { ...b, status: newStatus } : b
  );
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('mood-bookings-change'));
  }
  return updated;
}

export function getSiteUsageCount(): number {
  const members = getAllMembers();
  const totalMemberLogins = members.reduce((sum, m) => sum + (m.loginCount || 1), 0);
  if (typeof window === 'undefined') return 128 + totalMemberLogins;
  try {
    const raw = localStorage.getItem(VISITS_STORAGE_KEY);
    const base = raw ? parseInt(raw, 10) : 128;
    return base + totalMemberLogins;
  } catch {
    return 128 + totalMemberLogins;
  }
}
