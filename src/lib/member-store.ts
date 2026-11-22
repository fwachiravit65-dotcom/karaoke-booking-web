export interface MemberProfile {
  phone: string;
  name: string;
  pin: string; // Stored for DEV inspection in demo mode along with hash
  pinHash: string;
  totalHoursAccumulated: number;
  freeHoursAvailable: number;
  createdAt: string;
}

export interface StaffAccount {
  staffId: string;
  name: string;
  pinCode: string;
  branch: string;
  role: string;
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
    devId: 'mood-dev',
    password: 'MOOD-DEV-2026',
    role: 'Lead System Developer',
  },
  {
    devId: 'owner-roiet',
    password: 'MOOD-ROIET-01',
    role: 'Branch Owner (ร้อยเอ็ด 1)',
  },
];

// ============================================================================
// REGISTERED STAFF ACCOUNTS (รหัสพนักงานที่ลงทะเบียนไว้ทั้งหมดในระบบ)
// ============================================================================
export const REGISTERED_STAFF: StaffAccount[] = [
  {
    staffId: 'STF-001',
    name: 'พนักงานเคาน์เตอร์หลัก (กะบ่าย 15:00-23:00)',
    pinCode: '888888',
    branch: 'สาขาร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทยาลัย)',
    role: 'Front Counter Staff',
  },
  {
    staffId: 'STF-002',
    name: 'บาริสต้า & ดูแลโซนคาเฟ่',
    pinCode: '777777',
    branch: 'สาขาร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทยาลัย)',
    role: 'Cafe & Drink Bar',
  },
  {
    staffId: 'STF-003',
    name: 'ผู้จัดการร้าน (Store Manager)',
    pinCode: '999999',
    branch: 'สาขาร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทยาลัย)',
    role: 'Branch Manager',
  },
];

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

export function verifyStaffPin(pin: string): StaffAccount | null {
  return REGISTERED_STAFF.find((s) => s.pinCode === pin.trim()) || null;
}

const MEMBERS_STORAGE_KEY = 'mood_karaoke_members_v1';
const SESSION_STORAGE_KEY = 'mood_karaoke_active_session_v1';
const LOCKOUT_STORAGE_KEY = 'mood_karaoke_pin_lockout_v1';

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
      phone: '0812345678',
      name: 'มิ้นท์ (แก๊ง ม.6/2)',
      pin: '123456',
      pinHash: hashPin('0812345678', '123456'),
      totalHoursAccumulated: 6,
      freeHoursAvailable: 0,
      createdAt: '2026-11-20T15:30:00Z',
    },
    {
      phone: '0899887766',
      name: 'เจเจ (ชมรมดนตรี ร.ว.)',
      pin: '654321',
      pinHash: hashPin('0899887766', '654321'),
      totalHoursAccumulated: 11,
      freeHoursAvailable: 1,
      createdAt: '2026-11-21T16:10:00Z',
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
    return JSON.parse(raw);
  } catch {
    return getDefaultSeedMembers();
  }
}

function saveAllMembers(members: MemberProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
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
    totalHoursAccumulated: 1,
    freeHoursAvailable: 0,
    createdAt: new Date().toISOString(),
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
