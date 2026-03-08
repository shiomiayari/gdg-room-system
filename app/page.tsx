// app/page.tsx (青い菱形：振り分け係)
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // ログインしてない → ログインページへ
        router.push("/login");
      } else {
        // ログインしてる → 状態チェック
        const q = query(
          collection(db, "attendances"),
          where("uid", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty && snapshot.docs[0].data().type === "in") {
          // 入室中 → 退室ページへ
          router.push("/exit");
        } else {
          // 未入室（または退室済） → 入室ページへ
          router.push("/enter");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 判定中は読み込み画面を出す
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <h2>状態を確認しています... 🚀</h2>
    </div>
  );
}