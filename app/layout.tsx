import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ModelBench — AI 项目能力评测',
  description: '从逻辑推演、编程能力和前端审美三个维度，为大模型生成的项目提供 300 分制评测报告。',
  openGraph: {
    title: 'ModelBench — 看见每一个 AI 项目的实力',
    description: '上传项目文件，获得逻辑推演、编程能力和前端审美三项评分。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'ModelBench AI 项目能力评测' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModelBench — 看见每一个 AI 项目的实力',
    description: '三维度、300 分制的 AI 项目能力评测平台。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
