"use client";
import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 2秒後にフワッと消え始める
    const fadeTimer = setTimeout(() => setIsFading(true), 2000);
    // 2.5秒後に完全に裏側に隠れる
    const hideTimer = setTimeout(() => setIsVisible(false), 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 4色のバウンドアニメーション */}
      <div className="flex space-x-4 mb-6">
        <div className="w-5 h-5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0s" }}></div>
        <div className="w-5 h-5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-5 h-5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-5 h-5 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "0.3s" }}></div>
      </div>
      
      {/* GDGっぽいスタイリッシュなテキスト */}
      <h1 className="text-2xl font-bold tracking-widest text-gray-800">
        GDG SYSTEM
      </h1>
    </div>
  );
}