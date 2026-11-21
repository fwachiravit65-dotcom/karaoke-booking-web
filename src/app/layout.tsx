import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'NEON BEAT | ระบบจองห้องคาราโอเกะออนไลน์ระดับพรีเมียม',
  description: 'จองห้องคาราโอเกะออนไลน์แบบเรียลไทม์ หลากหลายขนาดห้อง ระบบเสียง Hi-End แสงสีเต็มพิกัด สะดวกรวดเร็ว การันตีห้องว่าง',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
