import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 👇 追加：先ほど作ったスプラッシュスクリーン（表紙）を読み込む
import SplashScreen from "./components/SplashScreen"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 👇 ついでにブラウザのタブに表示される名前と説明をアプリ用に変更しました！
export const metadata: Metadata = {
  title: "GDG Room System",
  description: "入退室管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 👇 langを"en"から"ja"（日本語）に変更しました
    <html lang="ja"> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 👇 追加：全画面の一番上に表紙を被せる */}
        <SplashScreen /> 
        {children}
      </body>
    </html>
  );
}
