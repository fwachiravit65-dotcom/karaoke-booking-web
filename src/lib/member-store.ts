import { Booking, BookingStatus } from '@/types';
import { supabase } from '@/lib/supabase';

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

export interface CloudSyncState {
  ok: boolean;
  error?: string;
  lastSyncedAt?: string;
}

// ============================================================================
// HARDCODED DEV CREDENTIALS
// ============================================================================
export const DEV_ACCOUNTS: DevAccount[] = [
  {
    devId: '0956602420',
    password: '0956602420A',
    role: 'Lead DEV & System Owner',
  },
];

const MEMBERS_STORAGE_KEY = 'mood_karaoke_members_v2';
const SESSION_STORAGE_KEY = 'mood_karaoke_active_session_v2';
const LOCKOUT_STORAGE_KEY = 'mood_karaoke_pin_lockout_v2';
const BOOKINGS_STORAGE_KEY = 'mood_karaoke_bookings_v2';
const VISITS_STORAGE_KEY = 'mood_karaoke_site_visits_v2';

let latestCloudStatus: CloudSyncState = { ok: false };

export function getCloudSyncStatus(): CloudSyncState {
  return latestCloudStatus;
}

export function isCloudDatabaseConnected(): boolean {
  return Boolean(supabase) && latestCloudStatus.ok;
}

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

// Fetch latest members from Supabase Cloud and merge with local cache
export async function syncFromCloudDatabase(): Promise<CloudSyncState> {
  if (!supabase || typeof window === 'undefined') {
    latestCloudStatus = { ok: false, error: 'No Supabase client' };
    return latestCloudStatus;
  }
  try {
    const { data: cloudMembers, error: mErr } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (mErr) {
      latestCloudStatus = {
        ok: false,
        error: `${mErr.code || ''} ${mErr.message}`,
      };
      return latestCloudStatus;
    }

    latestCloudStatus = {
      ok: true,
      lastSyncedAt: new Date().toLocaleTimeString('th-TH'),
    };

    if (cloudMembers) {
      const localMembers = getAllMembers();

      if (cloudMembers.length === 0 && localMembers.length > 0) {
        const rowsToSeed = localMembers.map((m) => ({
          phone: m.phone,
          name: m.name,
          pin: m.pin,
          pin_hash: m.pinHash,
          role: m.role,
          staff_title: m.staffTitle || null,
          promoted_at: m.promotedAt || null,
          total_hours_accumulated: m.totalHoursAccumulated || 1,
          free_hours_available: m.freeHoursAvailable || 0,
          login_count: m.loginCount || 1,
        }));
        await supabase.from('members').upsert(rowsToSeed, { onConflict: 'phone' });
      } else if (cloudMembers.length > 0) {
        const mappedCloud: MemberProfile[] = cloudMembers.map((row: any) => ({
          phone: row.phone,
          name: row.name,
          pin: row.pin,
          pinHash: row.pin_hash,
          role: (row.role === 'STAFF' ? 'STAFF' : 'CUSTOMER') as AccountRole,
          staffTitle: row.staff_title || undefined,
          promotedAt: row.promoted_at || undefined,
          totalHoursAccumulated: row.total_hours_accumulated || 0,
          freeHoursAvailable: row.free_hours_available || 0,
          loginCount: row.login_count || 1,
          createdAt: row.created_at,
        }));

        const cloudPhones = new Set(mappedCloud.map((c) => c.phone));
        const unsyncedLocal = localMembers.filter((l) => !cloudPhones.has(l.phone));
        if (unsyncedLocal.length > 0) {
          await supabase.from('members').upsert(
            unsyncedLocal.map((m) => ({
              phone: m.phone,
              name: m.name,
              pin: m.pin,
              pin_hash: m.pinHash,
              role: m.role,
              staff_title: m.staffTitle || null,
              promoted_at: m.promotedAt || null,
              total_hours_accumulated: m.totalHoursAccumulated || 1,
              free_hours_available: m.freeHoursAvailable || 0,
              login_count: m.loginCount || 1,
            })),
            { onConflict: 'phone' }
          );
        }

        const merged = [...mappedCloud, ...unsyncedLocal];
        localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event('mood-auth-change'));
      }
    }

    const { data: cloudBookings, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!bErr && cloudBookings && cloudBookings.length > 0) {
      const mappedB: Booking[] = cloudBookings.map((row: any) => ({
        id: row.id,
        bookingCode: row.booking_code,
        roomId: row.room_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        bookingDate: row.booking_date,
        startTime: row.start_time,
        endTime: row.end_time,
        totalHours: row.total_hours,
        roomCharge: Number(row.room_charge),
        packageCharge: Number(row.package_charge || 0),
        totalAmount: Number(row.total_amount),
        depositAmount: Number(row.deposit_amount),
        status: row.status as BookingStatus,
        slipImageUrl: row.slip_image_url || undefined,
        createdAt: row.created_at,
      }));
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(mappedB));
      window.dispatchEvent(new Event('mood-bookings-change'));
    }

    return latestCloudStatus;
  } catch (err: any) {
    latestCloudStatus = { ok: false, error: err?.message || 'Network error' };
    return latestCloudStatus;
  }
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

export function toggleMemberStaffRole(
  phone: string,
  makeStaff: boolean,
  staffTitle = 'พนักงานหน้าร้าน (Promoted via DEV)'
): MemberProfile[] {
  const normalized = normalizePhone(phone);
  const members = getAllMembers();
  const newRole: AccountRole = makeStaff ? 'STAFF' : 'CUSTOMER';
  const promotedAt = makeStaff ? new Date().toISOString() : undefined;

  const updated = members.map((m) => {
    if (m.phone !== normalized) return m;
    return {
      ...m,
      role: newRole,
      promotedAt,
      staffTitle: makeStaff ? staffTitle : undefined,
    };
  });
  saveAllMembers(updated);

  if (supabase) {
    supabase
      .from('members')
      .update({
        role: newRole,
        staff_title: makeStaff ? staffTitle : null,
        promoted_at: promotedAt || null,
      })
      .eq('phone', normalized)
      .then(() => {});
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mood-auth-change'));
  }
  return updated;
}

export function getAllRegisteredStaff(): StaffAccount[] {
  const members = getAllMembers();
  return members
    .filter((m) => m.role === 'STAFF')
    .map((m, idx) => ({
      staffId: `STF-${String(idx + 1).padStart(3, '0')}`,
      phone: m.phone,
      name: m.name,
      pinCode: m.pin || '••••••',
      branch: 'สาขาร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทยาลัย)',
      role: m.staffTitle || 'พนักงานร้าน (อนุมัติจาก DEV)',
      isPromotedMember: true,
    }));
}

export function verifyStaffCredentials(
  phoneInput: string,
  pinInput: string
): { success: boolean; message: string; staff?: StaffAccount } {
  const cleanPhone = normalizePhone(phoneInput);
  const cleanPin = pinInput.trim();

  if (!cleanPhone || cleanPhone.length < 9) {
    return {
      success: false,
      message: 'กรุณากรอกไอดีพนักงาน (เบอร์โทรศัพท์ 10 หลัก) ให้ครบถ้วนก่อนกดรหัส PIN',
    };
  }

  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      success: false,
      message: 'กรุณากดรหัส PIN ให้ครบ 6 หลัก',
    };
  }

  const members = getAllMembers();
  const found = members.find((m) => m.phone === cleanPhone);

  if (!found) {
    return {
      success: false,
      message: 'ไม่พบไอดีเบอร์โทรศัพท์นี้ในระบบ (พนักงานต้องสมัครสมาชิกบนเว็บก่อน)',
    };
  }

  const expectedHash = hashPin(cleanPhone, cleanPin);
  if (found.pinHash !== expectedHash && found.pin !== cleanPin) {
    return {
      success: false,
      message: 'รหัส PIN 6 หลักไม่ถูกต้องสำหรับไอดีนี้',
    };
  }

  if (found.role !== 'STAFF') {
    return {
      success: false,
      message:
        'ไอดีนี้เป็นบัญชีลูกค้าทั่วไป ยังไม่ได้รับการโปรโมทเป็นพนักงานจากหน้า DEV',
    };
  }

  return {
    success: true,
    message: 'เข้าสู่ระบบพนักงานสำเร็จ',
    staff: {
      staffId: `STF-${found.phone.slice(-4)}`,
      phone: found.phone,
      name: found.name,
      pinCode: found.pin,
      branch: 'สาขาร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทยาลัย)',
      role: found.staffTitle || 'พนักงานร้าน (อนุมัติจาก DEV)',
      isPromotedMember: true,
    },
  };
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
  pin: string,
  initialRole: AccountRole = 'CUSTOMER'
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
    role: initialRole,
    totalHoursAccumulated: 1,
    freeHoursAvailable: 0,
    createdAt: new Date().toISOString(),
    loginCount: 1,
  };

  const updated = [newMember, ...members];
  saveAllMembers(updated);

  if (supabase) {
    supabase
      .from('members')
      .upsert(
        {
          phone: newMember.phone,
          name: newMember.name,
          pin: newMember.pin,
          pin_hash: newMember.pinHash,
          role: newMember.role,
          total_hours_accumulated: 1,
          free_hours_available: 0,
          login_count: 1,
        },
        { onConflict: 'phone' }
      )
      .then(() => {
        syncFromCloudDatabase();
      });
  }

  if (typeof window !== 'undefined' && initialRole === 'CUSTOMER') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ phone: newMember.phone }));
    window.dispatchEvent(new Event('mood-auth-change'));
  }

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
  if (found.pinHash !== expectedHash && found.pin !== pin) {
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

  const nextLoginCount = (found.loginCount || 1) + 1;
  const updated = members.map((m) =>
    m.phone === found.phone ? { ...m, loginCount: nextLoginCount } : m
  );
  saveAllMembers(updated);

  if (supabase) {
    supabase
      .from('members')
      .update({ login_count: nextLoginCount })
      .eq('phone', found.phone)
      .then(() => {});
  }

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
  let newTotal = 0;
  let newFree = 0;
  const updated = members.map((m) => {
    if (m.phone !== phone) return m;
    newTotal = m.totalHoursAccumulated + hoursToAdd;
    newFree = Math.floor(newTotal / 10);
    return {
      ...m,
      totalHoursAccumulated: newTotal,
      freeHoursAvailable: newFree,
    };
  });
  saveAllMembers(updated);

  if (supabase && newTotal > 0) {
    supabase
      .from('members')
      .update({
        total_hours_accumulated: newTotal,
        free_hours_available: newFree,
      })
      .eq('phone', phone)
      .then(() => {});
  }

  window.dispatchEvent(new Event('mood-auth-change'));
}

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

  if (supabase) {
    supabase
      .from('bookings')
      .upsert(
        {
          booking_code: newBooking.bookingCode,
          room_id: newBooking.roomId,
          customer_name: newBooking.customerName,
          customer_phone: newBooking.customerPhone,
          booking_date: newBooking.bookingDate,
          start_time: newBooking.startTime,
          end_time: newBooking.endTime,
          total_hours: newBooking.totalHours,
          room_charge: newBooking.roomCharge,
          package_charge: newBooking.packageCharge,
          total_amount: newBooking.totalAmount,
          deposit_amount: newBooking.depositAmount,
          status: newBooking.status,
          slip_image_url: newBooking.slipImageUrl || null,
        },
        { onConflict: 'booking_code' }
      )
      .then(() => {});
  }

  return updated;
}

export function updateBookingStatusInStore(
  bookingId: string,
  newStatus: BookingStatus
): Booking[] {
  const current = getAllBookings();
  let targetCode = '';
  const updated = current.map((b) => {
    if (b.id === bookingId) {
      targetCode = b.bookingCode;
      return { ...b, status: newStatus };
    }
    return b;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('mood-bookings-change'));
  }

  if (supabase && targetCode) {
    supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('booking_code', targetCode)
      .then(() => {});
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
