import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ansaem.vercel.app"),
  title: "안샘 | 새는 구독비를 막아주는 구독 관리 서비스",
  description:
    "이용 중인 구독 서비스를 선택하면 월 구독비, 절약 가능 금액, 결제 일정과 무료체험 종료일을 한눈에 정리해드립니다.",
  openGraph: {
    title: "안샘 | 매달 새는 구독비, 이제 막아보세요.",
    description:
      "OTT, AI툴, 멤버십, 작업툴 등 이용 중인 구독 서비스를 선택하고 월 구독비와 절약 가능 금액을 확인해보세요.",
    url: "https://ansaem.vercel.app",
    siteName: "안샘",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "안샘 | 매달 새는 구독비, 이제 막아보세요.",
    description:
      "내 구독비와 절약 가능 금액을 무료로 진단하고 베타 혜택도 받아보세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      {children}
      <Analytics />
      </body>
    </html>
  );
}
