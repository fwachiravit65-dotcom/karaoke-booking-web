# 🎤 NEON BEAT Karaoke - Web & Online Booking System

เว็บไซต์ร้านคาราโอเกะระดับพรีเมียม พร้อมระบบจองห้องออนไลน์แบบเรียลไทม์ และระบบจัดการสำหรับแอดมินหน้าร้าน

---

## 🌟 ฟีเจอร์หลัก (Core Features)

1. **หน้าสำหรับลูกค้า (Customer Portal)**
   * **หน้าหลัก (Homepage):** แสดงบรรยากาศร้าน, จุดเด่น, ราคา และประเภทห้อง
   * **ระบบจองห้องออนไลน์ (`/booking`):**
     * เลือกประเภทห้อง (S, M, L, VIP) ตามจำนวนคน
     * เลือกวัน เวลาเริ่มต้น และจำนวนชั่วโมง
     * เลือกแพ็กเกจเสริม (Buffet เครื่องดื่ม, ของทานเล่น, เซ็ตปาร์ตี้วันเกิด)
     * คำนวณราคาทั้งหมดและยอดมัดจำ 50% อัตโนมัติ
     * สแกน QR Code PromptPay ชำระมัดจำ และแนบสลิป
     * ป้องกันการจองซ้ำในเวลาเดียวกัน (Atomic Double-Booking Prevention)
   * **ตรวจสอบสถานะการจอง (`/status`):** เช็คด้วยเบอร์โทรศัพท์หรือรหัสการจอง
2. **หน้าสำหรับพนักงานร้าน (`/admin`)**
   * ตรวจสอบสลิปการโอนมัดจำ
   * อนุมัติ / ปฏิเสธ / เช็คเอาท์ห้องคาราโอเกะ
   * สรุปสถิติยอดการจองและรายได้ประจำวัน

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
karaoke-booking-web/
├── prisma/
│   └── schema.prisma         # โครงสร้างฐานข้อมูลสำหรับ Prisma ORM
├── supabase/
│   └── schema.sql            # สคริปต์ SQL พร้อมรันใน Supabase (สร้างตาราง + ฟังก์ชันป้องกันจองซ้ำ)
├── src/
│   ├── app/
│   │   ├── layout.tsx        # โครงสร้างหลัก (Navbar + Footer)
│   │   ├── globals.css       # Tailwind CSS & ธีม Neon Dark
│   │   ├── page.tsx          # หน้าแรกของร้านคาราโอเกะ
│   │   ├── booking/page.tsx  # หน้าจองห้องและคำนวณราคา
│   │   ├── status/page.tsx   # หน้าเช็คสถานะการจอง
│   │   ├── admin/page.tsx    # หน้าจัดการของแอดมินหน้าร้าน
│   │   └── api/
│   │       ├── rooms/route.ts
│   │       └── bookings/route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── RoomCard.tsx
│   ├── lib/
│   │   ├── supabase.ts       # ไคลเอนต์เชื่อมต่อ Supabase
│   │   ├── prisma.ts         # ไคลเอนต์ Prisma Singleton
│   │   └── utils.ts          # ตัวช่วยจัดฟอร์แมตเงินบาทและเวลา
│   └── types/
│       └── index.ts          # Data Types & Interfaces
├── .env.example              # ตัวอย่างไฟล์ Environment Variables
├── package.json
└── tailwind.config.ts
```

---

## 🚀 วิธีเริ่มต้นรันโปรเจกต์ (Local Development)

### 1. ติดตั้ง Node.js (หากยังไม่มีในเครื่อง)
ติดตั้งผ่าน Windows Terminal (Run as Administrator):
```bash
winget install OpenJS.NodeJS.LTS
```
*(หลังจากติดตั้งเสร็จ ให้ปิดและเปิด Terminal ใหม่อีกครั้ง)*

### 2. ติดตั้ง Dependencies และรันเว็บ
```bash
# ติดตั้ง Library ทั้งหมด
npm install

# รันเซิร์ฟเวอร์สำหรับทดสอบ
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

---

## 🗄️ การเชื่อมต่อฐานข้อมูล Supabase (ฟรี)

1. สมัครบัญชีฟรีที่ [supabase.com](https://supabase.com) แล้วสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor** ใน Supabase
3. คัดลอกโค้ดทั้งหมดจากไฟล์ `supabase/schema.sql` ในโปรเจกต์นี้ไปวางแล้วกด **Run**
4. ไปที่ **Project Settings -> API** แล้วคัดลอก `URL` และ `Anon Key` มาใส่ในไฟล์ `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
```

---

## 👥 ข้อตกลงสำหรับทีมเพื่อไม่ให้เกิด Error (Team Guidelines)

1. **ไม่แก้โค้ดบน Branch `main` โดยตรง:**
   * แตก Branch ใหม่เสมอ เช่น `git checkout -b feature/my-feature`
2. **รันคำสั่งเช็คโค้ดก่อนส่งงาน:**
   ```bash
   npm run lint
   ```
3. **ป้องกัน Merge Conflict:**
   * ทำงานแยกโฟลเดอร์/ไฟล์ตามหน้าที่
   * ดึงโค้ดล่าสุดจากกิ่งหลักมาอัปเดตเสมอ (`git pull origin main`)
