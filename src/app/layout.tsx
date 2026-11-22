import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MOOD — ร้านคาราโอเกะสไตล์มินิมอล | Acoustic Karaoke & Social Space',
  description: 'พื้นที่ปล่อยจอยหลังเลิกเรียน ห้องคาราโอเกะเก็บเสียงดีไซน์มินิมอล แสงสวย ถ่ายรูปขึ้นทุกมุม ราคานักเรียนหารกันเริ่มต้นชม.ละ 45 บาท จองคิวออนไลน์ได้ทันที',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen flex flex-col justify-between bg-[#F7F5F0] text-[#121212]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
