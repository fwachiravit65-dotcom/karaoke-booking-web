'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatBaht } from '@/lib/utils';

interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  imageUrl: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    tag: '01 / CAFE & SIGNATURE DRINKS',
    title: 'เครื่องดื่มคาเฟ่เข้มข้น เติมพลังหลังเลิกเรียน',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'slide-2',
    tag: '02 / REFRESHING SOFT DRINKS & SODA',
    title: 'น้ำอัดลมและคราฟต์โซดาเย็นซ่า ชื่นใจตลอดการร้อง',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'slide-3',
    tag: '03 / STUDIO VOCAL MICROPHONE',
    title: 'ไมโครโฟนไร้สายเสียงใส ร้องมันส์ไม่มีสะดุด',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1000&auto=format&fit=crop&q=80',
  },
];

interface StudioSpace {
  id: string;
  index: string;
  code: string;
  name: string;
  thaiSubtitle: string;
  capacity: string;
  headcountForSplit: number;
  dimensions: string;
  areaSqm: string;
  ratePerHour: number;
  story: string;
  acoustics: string;
  lighting: string;
  specs: string[];
  imageUrl: string;
}

const STUDIOS: StudioSpace[] = [
  {
    id: 'room-1',
    index: '01',
    code: 'ST-101',
    name: 'Catch-Up(S)',
    thaiSubtitle: 'ห้องขนาด S (3x3 ตร.ม.) สำหรับคู่ซี้ หรือแก๊ง 2–4 คน',
    capacity: '2 — 4 คน',
    headcountForSplit: 4,
    dimensions: '3 × 3 ม.',
    areaSqm: '9 ตร.ม.',
    ratePerHour: 140,
    story:
      'พื้นที่ขนาด 3x3 ตร.ม. กะทัดรัดอบอุ่น เก็บเสียงสนิท เหมาะสำหรับนัดเพื่อนสนิท 2–4 คนมาอัปเดตชีวิตและปล่อยพลังเสียงหลังเลิกเรียนโดยไม่ต้องเขินใคร',
    acoustics: 'JBL Studio Speaker + ไมโครโฟนไร้สาย 2 ตัว',
    lighting: 'Warm Minimal Light 2700K ปรับระดับแสงได้',
    specs: [
      'ขนาดห้องมาตรฐาน 3 x 3 ตารางเมตร (9 ตร.ม.)',
      'หน้าจอ Smart TV คมชัด 4K + iPad กดคิวเพลง',
      'ไมโครโฟนไร้สาย 2 ตัว พร้อมปลั๊กชาร์จมือถือประจำโต๊ะ',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'room-2',
    index: '02',
    code: 'ST-102',
    name: 'Get-together(M)',
    thaiSubtitle: 'ห้องขนาด M (4x3 ตร.ม.) สำหรับแก๊งเพื่อนห้องเรียน 5–8 คน',
    capacity: '5 — 8 คน',
    headcountForSplit: 6,
    dimensions: '4 × 3 ม.',
    areaSqm: '12 ตร.ม.',
    ratePerHour: 200,
    story:
      'ห้องขนาดกลาง 4x3 ตร.ม. กว้างขวางขึ้นพร้อมโซฟานั่งสบายและโต๊ะกลางสำหรับวางเครื่องดื่มคาเฟ่และขนมทานเล่น เหมาะกับแก๊งเพื่อน 5–8 คนมารวมตัวกันหลังเลิกเรียน',
    acoustics: 'Dual Surround Speaker + ไมโครโฟนไร้สาย 4 ตัว',
    lighting: '3000K Warm Ambient + โคมไฟตั้งพื้นถ่ายรูปสวย',
    specs: [
      'ขนาดห้อง 4 x 3 ตารางเมตร (12 ตร.ม.)',
      'หน้าจอใหญ่ 65 นิ้ว + ระบบสั่งคิวเพลงผ่าน iPad & มือถือ',
      'ไมโครโฟนไร้สาย 4 ตัว ร้องประสานเสียงได้ทั้งแก๊ง',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'room-3',
    index: '03',
    code: 'ST-201',
    name: 'Reunion(L)',
    thaiSubtitle: 'ห้องขนาด L (4x4 ตร.ม.) สำหรับปาร์ตี้แก๊งใหญ่ 9–14 คน',
    capacity: '9 — 14 คน',
    headcountForSplit: 10,
    dimensions: '4 × 4 ม.',
    areaSqm: '16 ตร.ม.',
    ratePerHour: 280,
    story:
      'สเปซขนาดใหญ่ 4x4 ตร.ม. รองรับกลุ่มเพื่อน 9–14 คน มีพื้นที่ตรงกลางให้ลุกเต้นและระบายความสนุกได้เต็มที่ จะฉลองวันเกิด ปิดโปรเจกต์ หรือนัดรวมแก๊งชมรมก็เอาอยู่',
    acoustics: 'Full-Range Party Sound System + Subwoofer + ไมค์ 4–6 ตัว',
    lighting: 'Warm Daylight Diffuser + มุมกระจกถ่ายรูปกรุ๊ปช็อต',
    specs: [
      'ขนาดห้องใหญ่ 4 x 4 ตารางเมตร (16 ตร.ม.)',
      'โซฟายาวรอบห้อง รองรับ 9–14 คนแบบไม่อึดอัด',
      'ระบบเสียงจัดเต็ม + กระจกเต็มตัวสำหรับถ่ายรูปแก๊ง',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
  },
];

export default function HomePage() {
  const [activeStudioIndex, setActiveStudioIndex] = useState<number>(0);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const activeStudio = STUDIOS[activeStudioIndex];

  // Auto-slide Hero right images every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#F7F5F0] text-[#121212]">
      {/* Part 2.1 — แถบข่าวสารบนสุด (Top Ticker) */}
      <div className="hairline-b bg-[#EFECE6]/70">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 font-tech text-xs text-[#121212]">
          <span>สาขา : ร้อยเอ็ด 1 (หน้าโรงเรียนร้อยเอ็ดวิทย์)</span>
          <span className="text-[#D9381E] font-bold">
            RATE: เริ่มต้นชั่วโมงละ ฿140 / ชั่วโมง
          </span>
        </div>
      </div>

      {/* Part 2.2 — พาร์ทต้อนรับ (Hero Section - แบ่งซ้าย 7 ส่วน / ขวา 5 ส่วน) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 hairline-b">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column (7/12): Headline, Description, Booking Button, Acoustic Specs */}
          <div className="lg:col-span-7 py-12 sm:py-20 lg:pr-12 lg:hairline-r flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="font-tech text-xs px-3 py-1 rounded-full bg-[#121212] text-[#F7F5F0]">
                  MOOD. KARAOKE ROOM
                </span>
                <span className="font-tech text-xs text-[#68645E]">
                  ROI ET BRANCH 01
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl xl:text-[64px] leading-[1.08] text-[#121212] tracking-tight">
                Quiet rooms <br />
                <span className="text-[#D9381E]">for loud friends.</span>
              </h1>

              <h2 className="mt-5 text-xl sm:text-2xl font-bold text-[#121212] leading-snug">
                พื้นที่ปล่อยจอยหลังเลิกเรียน ในห้องเก็บเสียงที่พร้อมให้คุณระบายมันออกมาให้มากที่สุด
              </h2>

              <p className="mt-4 text-sm sm:text-base text-[#68645E] max-w-xl leading-relaxed">
                ห้องคาราโอเกะสไตล์มินิมอลหน้าโรงเรียนร้อยเอ็ดวิทย์ ออกแบบให้โปร่ง สะอาด แสงสวยถ่ายรูปขึ้นทุกมุม เก็บเสียงสนิทให้คุณและแก๊งเพื่อนร้องเพลงโปรดได้สุดเสียง พร้อมเครื่องดื่มคาเฟ่และน้ำอัดลมเย็นๆ ในราคาสบายกระเป๋าเริ่มต้นเพียงชั่วโมงละ 140 บาท
              </p>
            </div>

            {/* Hero Bottom Action & Acoustic Specs */}
            <div className="mt-10 pt-8 hairline-t grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
              <div className="sm:col-span-7 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/booking"
                  className="px-7 py-4 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] text-sm font-semibold tracking-tight editorial-transition inline-flex items-center gap-3"
                >
                  <span>จองคิวห้องออนไลน์</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/status"
                  className="px-5 py-4 hairline-all hover:border-[#121212] text-sm font-medium text-[#121212] editorial-transition"
                >
                  เช็คสถานะคิวจอง
                </Link>
              </div>

              <div className="sm:col-span-5 sm:hairline-l sm:pl-6 space-y-1.5 text-xs text-[#68645E]">
                <div className="flex justify-between">
                  <span>ราคาเริ่มต้น:</span>
                  <span className="text-[#121212] font-bold">฿140 / ชั่วโมง (หาร 4 ตกคนละ ฿35)</span>
                </div>
                <div className="flex justify-between">
                  <span>ระบบเก็บเสียง:</span>
                  <span className="text-[#121212] font-semibold">STC-52 Acoustic Wall</span>
                </div>
                <div className="flex justify-between">
                  <span>ขนาดห้อง:</span>
                  <span className="text-[#D9381E] font-semibold">3x3 / 4x3 / 4x4 ตร.ม.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5/12): Auto-sliding Carousel (Cafe Drinks, Soft Drinks, Microphone) + Overlap Box */}
          <div className="lg:col-span-5 py-10 lg:py-16 lg:pl-12 flex flex-col justify-between">
            <div className="relative">
              {/* Slide Indicator Bar */}
              <div className="flex justify-between items-center text-xs text-[#68645E] mb-3">
                <span className="font-tech text-[11px] text-[#121212]">
                  {HERO_SLIDES[currentSlide].tag}
                </span>
                <div className="flex items-center gap-1.5">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide
                          ? 'w-6 bg-[#D9381E]'
                          : 'w-2 bg-[#121212]/25'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Auto-Sliding Image Frame */}
              <div className="relative aspect-[4/5] w-full bg-[#EFECE6] hairline-all overflow-hidden">
                {HERO_SLIDES.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      idx === currentSlide
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-[#121212]/80 backdrop-blur-sm text-[#F7F5F0] px-3 py-1 text-xs font-medium">
                      {slide.title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlapping Happy Hour Box */}
              <div className="mt-4 sm:-mt-16 sm:-ml-6 relative z-20 bg-[#F7F5F0] hairline-all p-5 max-w-xs shadow-sm">
                <div className="font-tech text-xs text-[#D9381E] mb-1">
                  After-School Happy Hour (15:00–23:00)
                </div>
                <p className="text-xs text-[#121212] font-medium leading-relaxed">
                  เปิดต้อนรับหลังเลิกเรียนทุกวันตั้งแต่ 15:00–23:00 น. พร้อมเมนูเครื่องดื่มคาเฟ่ น้ำอัดลม และห้องเก็บเสียงคุณภาพสูง
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Part 2.3 — พาร์ทเลือกดูห้องทั้ง 3 ขนาด (01 / 03 — The Three Venting space) */}
      <section id="spaces" className="max-w-[1400px] mx-auto px-4 sm:px-8 py-20 sm:py-24 hairline-b">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10 hairline-b items-end">
          <div className="lg:col-span-5">
            <p className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
              01 / 03 — THE THREE VENTING SPACE
            </p>
            <h2 className="font-display text-3xl sm:text-5xl mt-2 leading-tight">
              The Three Venting Space
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-sm text-[#68645E] leading-relaxed">
              เลือกขนาดห้องที่เหมาะกับแก๊งของคุณ แบ่งเป็นขนาด 3×3, 4×3 และ 4×4 ตร.ม. คลิกที่แต่ละแถวเพื่อสไลด์ดูรายละเอียดห้องแบบสมูท
            </p>
          </div>
          <div className="lg:col-span-3 lg:text-right font-tech text-xs text-[#121212]">
            คลิกแต่ละแถวเพื่อกางดูสเปกห้อง ↓
          </div>
        </div>

        {/* Interactive Split Showcase: Left 3-Row Smooth Slide Accordion (7 cols) + Right Room Preview (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left 7 Columns: 3 Smooth Sliding Accordion Rows */}
          <div className="lg:col-span-7 lg:hairline-r">
            {STUDIOS.map((studio, idx) => {
              const isOpen = idx === activeStudioIndex;
              const perPerson = Math.round(studio.ratePerHour / studio.headcountForSplit);

              return (
                <div
                  key={studio.id}
                  onClick={() => setActiveStudioIndex(idx)}
                  className={`hairline-b cursor-pointer editorial-transition ${
                    isOpen ? 'bg-[#EFECE6]/80' : 'hover:bg-[#EFECE6]/35'
                  }`}
                >
                  {/* Row Header */}
                  <div className="p-6 sm:p-8 flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-4 sm:gap-6">
                      <span
                        className={`font-tech text-xs ${
                          isOpen ? 'text-[#D9381E] font-bold' : 'text-[#68645E]'
                        }`}
                      >
                        {studio.index} / {studio.code}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-display text-2xl sm:text-3xl text-[#121212] leading-none">
                            {studio.name}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#121212]/10 text-[#121212] font-semibold">
                            {studio.capacity}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 hairline-all bg-[#F7F5F0] text-[#68645E]">
                            ขนาด {studio.dimensions}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#68645E] mt-1.5">
                          {studio.thaiSubtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-display text-lg sm:text-xl text-[#121212]">
                        {formatBaht(studio.ratePerHour)}
                        <span className="text-xs font-normal text-[#68645E]">/ชม.</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#D9381E]">
                        ~คนละ ฿{perPerson}/ชม.
                      </div>
                    </div>
                  </div>

                  {/* Smooth Sliding Accordion Drawer */}
                  <div className={`accordion-grid ${isOpen ? 'is-open' : ''}`}>
                    <div className="accordion-inner">
                      <div className="px-6 sm:px-8 pb-8 pt-1 space-y-6">
                        <p className="text-sm text-[#121212]/90 leading-relaxed max-w-2xl">
                          {studio.story}
                        </p>

                        {/* Technical Spec Bar */}
                        <div className="grid grid-cols-3 hairline-t hairline-b py-3.5 gap-4 text-xs">
                          <div>
                            <span className="text-[11px] text-[#68645E] block">จำนวนคนแนะนำ</span>
                            <span className="text-[#121212] font-semibold">{studio.capacity}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#68645E] block">สัดส่วนห้อง</span>
                            <span className="text-[#D9381E] font-bold">
                              {studio.dimensions} ({studio.areaSqm})
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#68645E] block">บรรยากาศแสง</span>
                            <span className="text-[#121212] font-semibold">{studio.lighting}</span>
                          </div>
                        </div>

                        {/* Equipment & Direct Booking Trigger */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                          <ul className="space-y-1.5 text-xs text-[#68645E]">
                            {studio.specs.map((spec, sIdx) => (
                              <li key={sIdx} className="flex items-center gap-2">
                                <span className="text-[#D9381E] font-bold">•</span>
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>

                          <Link
                            href={`/booking?roomId=${studio.id}`}
                            className="px-6 py-3 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] text-xs font-semibold editorial-transition inline-flex items-center gap-2 self-start sm:self-end"
                          >
                            <span>จองห้อง {studio.name}</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 5 Columns: Generated Preview Frame for 3x3, 4x3, 4x4 sqm Room */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-[#EFECE6]/40">
            <div>
              <div className="flex items-center justify-between text-xs text-[#68645E] mb-3">
                <span className="font-semibold text-[#121212]">
                  ตัวอย่างห้อง: {activeStudio.name} ({activeStudio.code})
                </span>
                <span className="px-2.5 py-0.5 bg-[#121212] text-[#F7F5F0] font-semibold">
                  ขนาด {activeStudio.dimensions} ({activeStudio.areaSqm})
                </span>
              </div>

              {/* Room Visual Preview with Architectural Dimension Overlay */}
              <div className="image-zoom-frame relative aspect-[4/3] w-full hairline-all bg-[#EFECE6]">
                <img
                  src={activeStudio.imageUrl}
                  alt={activeStudio.name}
                  className="w-full h-full object-cover"
                />
                {/* Dimension Blueprint Tag (Placeholder marker for real shop photo later) */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#F7F5F0]/95 backdrop-blur-sm hairline-all p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#D9381E] block uppercase">
                      ROOM SCALE PREVIEW (เตรียมใส่ภาพห้องจริง)
                    </span>
                    <span className="text-xs font-bold text-[#121212]">
                      {activeStudio.name} — พื้นที่ {activeStudio.dimensions} ({activeStudio.areaSqm})
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-[#EFECE6] hairline-all">
                    {activeStudio.capacity}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="text-xs font-bold text-[#68645E]">
                  ชุดเครื่องเสียงและไมโครโฟนประจำห้อง
                </div>
                <p className="text-sm font-semibold text-[#121212]">
                  {activeStudio.acoustics}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 hairline-t flex items-center justify-between">
              <div>
                <span className="text-xs text-[#68645E] block">
                  ราคาห้อง ({activeStudio.name})
                </span>
                <span className="font-display text-2xl sm:text-3xl text-[#121212]">
                  ฿{activeStudio.ratePerHour}{' '}
                  <span className="text-xs text-[#68645E] font-normal">
                    / ชั่วโมง (หาร {activeStudio.headcountForSplit} คน ตกคนละ ~฿
                    {Math.round(activeStudio.ratePerHour / activeStudio.headcountForSplit)})
                  </span>
                </span>
              </div>
              <Link
                href={`/booking?roomId=${activeStudio.id}`}
                className="link-editorial text-xs font-bold text-[#D9381E]"
              >
                เลือกห้องนี้ →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Part 2.4 — พาร์ทจุดเด่นร้าน (02 / 03 — Why We Built MOOD) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 py-20 sm:py-24 hairline-b">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Sticky Column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-5">
              <p className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
                02 / 03 — WHY WE BUILT MOOD
              </p>
              <h2 className="font-display text-3xl sm:text-5xl leading-[1.12] text-[#121212]">
                Leave your shyness behind and pour your heart into the music.
              </h2>
              <p className="text-sm sm:text-base text-[#68645E] leading-relaxed">
                ทิ้งความเขินอายไว้หน้าประตู แล้วปลดปล่อยหัวใจไปกับเสียงเพลงในสเปซมินิมอลที่เราตั้งใจสร้างให้เป็นพื้นที่เซฟโซนหลังเลิกเรียนของคุณและกลุ่มเพื่อน
              </p>
              <div className="pt-3">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-3 text-xs font-bold px-5 py-3.5 hairline-all hover:bg-[#121212] hover:text-[#F7F5F0] editorial-transition"
                >
                  <span>เช็คคิวห้องว่างวันนี้</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right 3 Chapters */}
          <div className="lg:col-span-7 lg:pl-12 lg:hairline-l space-y-12">
            {/* Chapter A */}
            <div className="hairline-b pb-10 grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-3 font-tech text-xs text-[#D9381E]">
                CHAPTER A
              </div>
              <div className="sm:col-span-9 space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#121212]">
                  แสงสวย บรรยากาศได้ พร้อมให้คุณได้ขับร้อง
                </h3>
                <p className="text-sm text-[#68645E] leading-relaxed">
                  จัดแสงไฟโทนอุ่นสบายตา บรรยากาศเหมือนห้องนั่งเล่นคาเฟ่ที่ถ่ายรูปและวิดีโอสตอรี่ลงโซเชียลได้สวยทุกมุม พร้อมห้องเก็บเสียงที่ให้คุณร้องได้สุดเสียงแบบไม่ต้องกั๊ก
                </p>
              </div>
            </div>

            {/* Chapter B */}
            <div className="hairline-b pb-10 grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-3 font-tech text-xs text-[#D9381E]">
                CHAPTER B
              </div>
              <div className="sm:col-span-9 space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#121212]">
                  เพลงครบทุกเทสต์ (T-Pop, Indie, K-Pop) กดคิวผ่าน iPad หรือสแกนจากมือถือ
                </h3>
                <p className="text-sm text-[#68645E] leading-relaxed">
                  อัปเดตเพลงฮิตติดชาร์ตทั้งเพลงไทย T-Pop, เพลงอินดี้, K-Pop และสากล เลือกกดคิวเพลงผ่านหน้าจอ iPad ประจำโต๊ะ หรือสแกนจากมือถือของเพื่อนแต่ละคนส่งเพลงเข้าคิวได้ทันที
                </p>
              </div>
            </div>

            {/* Chapter C */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-3 font-tech text-xs text-[#D9381E]">
                CHAPTER C
              </div>
              <div className="sm:col-span-9 space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#121212]">
                  ไม่มีบังคับสั่งอาหารขั้นต่ำ ไม่มีเซอร์วิสชาร์จแอบแฝง
                </h3>
                <p className="text-sm text-[#68645E] leading-relaxed">
                  คิดค่าห้องตามชั่วโมงจริงแบบตรงไปตรงมา เข้าใจงบนักเรียน 100% จะมานั่งร้องเพลงอย่างเดียวหรือสั่งเครื่องดื่มคาเฟ่และน้ำอัดลมมาดื่มเพิ่มก็เลือกได้ตามใจ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Part 2.5 — พาร์ทตารางเทียบราคา & 4 ขั้นตอนการจอง (03 / 03 — Rates & Reservation) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-20 sm:pt-24">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-tech text-xs uppercase tracking-widest text-[#D9381E]">
              03 / 03 — RATES &amp; RESERVATION
            </p>
            <h2 className="font-display text-3xl sm:text-5xl mt-2 leading-tight">
              Rates &amp; Reservation
            </h2>
          </div>
          <p className="font-tech text-xs text-[#68645E]">
            เวลาเปิดให้บริการ 15:00–23:00 น. · ราคาเดียวไม่มีบวกเพิ่ม
          </p>
        </div>

        {/* Single-Rate Clean Table (15:00 - 23:00) */}
        <div className="hairline-all overflow-x-auto bg-[#F7F5F0]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="hairline-b bg-[#EFECE6] font-tech text-xs text-[#68645E]">
                <th className="py-4 px-6 hairline-r">รหัสห้อง</th>
                <th className="py-4 px-6 hairline-r">ชื่อห้อง (Venting Space)</th>
                <th className="py-4 px-6 hairline-r">ขนาดพื้นที่</th>
                <th className="py-4 px-6 hairline-r">จำนวนคน</th>
                <th className="py-4 px-6 hairline-r text-[#D9381E]">
                  อัตราค่าบริการ (รอบ 15:00–23:00 น.)
                </th>
                <th className="py-4 px-6">หารเฉลี่ยต่อคน</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm">
              {STUDIOS.map((st) => (
                <tr key={st.id} className="hairline-b hover:bg-[#EFECE6]/50 editorial-transition">
                  <td className="py-4 px-6 font-tech font-bold hairline-r">{st.code}</td>
                  <td className="py-4 px-6 font-bold hairline-r">{st.name}</td>
                  <td className="py-4 px-6 hairline-r">
                    {st.dimensions} ({st.areaSqm})
                  </td>
                  <td className="py-4 px-6 text-[#68645E] hairline-r">{st.capacity}</td>
                  <td className="py-4 px-6 font-bold text-[#D9381E] hairline-r">
                    ฿{st.ratePerHour} / ชั่วโมง
                  </td>
                  <td className="py-4 px-6 text-xs text-[#68645E]">
                    ~฿{Math.round(st.ratePerHour / st.headcountForSplit)} / คน / ชม.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4 Steps Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 hairline-all">
          <div className="p-6 sm:p-8 hairline-b lg:border-b-0 sm:hairline-r">
            <span className="font-tech text-xs text-[#D9381E] block mb-3">Step 01</span>
            <h4 className="font-bold text-base mb-1.5">เลือกห้อง</h4>
            <p className="text-xs text-[#68645E] leading-relaxed">
              เลือกขนาดห้อง Catch-Up(S), Get-together(M) หรือ Reunion(L) ตามจำนวนเพื่อน
            </p>
          </div>
          <div className="p-6 sm:p-8 hairline-b lg:border-b-0 lg:hairline-r">
            <span className="font-tech text-xs text-[#D9381E] block mb-3">Step 02</span>
            <h4 className="font-bold text-base mb-1.5">ล็อกคิวอัตโนมัติ</h4>
            <p className="text-xs text-[#68645E] leading-relaxed">
              เลือกรอบเวลาที่ต้องการ ระบบล็อกคิวห้องให้ทันทีป้องกันการจองซ้ำ
            </p>
          </div>
          <div className="p-6 sm:p-8 hairline-b sm:border-b-0 sm:hairline-r">
            <span className="font-tech text-xs text-[#D9381E] block mb-3">Step 03</span>
            <h4 className="font-bold text-base mb-1.5">ชำระค่าเข้าบริการ</h4>
            <p className="text-xs text-[#68645E] leading-relaxed">
              สแกนชำระผ่าน QR Code PromptPay และกดยืนยันการจองในระบบ
            </p>
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#EFECE6]/50">
            <div>
              <span className="font-tech text-xs text-[#D9381E] block mb-3">Step 04</span>
              <h4 className="font-bold text-base mb-1.5">รับรหัสเข้าห้อง</h4>
              <p className="text-xs text-[#68645E] leading-relaxed mb-4">
                รับรหัสการจองเพื่อนำมาแจ้งพนักงานหน้าร้านและเข้าห้องร้องเพลงได้ทันที
              </p>
            </div>
            <Link
              href="/booking"
              className="font-tech text-xs text-[#D9381E] font-bold link-editorial self-start"
            >
              เริ่มจองห้องตอนนี้ →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
