// app/exit/page.tsx
"use client";
import { useState } from "react";
import { db, auth } from "../../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ExitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleExit = async () => {
    if (!auth.currentUser) return;
    const isConfirmed = window.confirm("【確認】退室しますか？");
    if (!isConfirmed) return;

    try {
      setLoading(true);
      await addDoc(collection(db, "attendances"), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        email: auth.currentUser.email,
        type: "out",
        timestamp: serverTimestamp(),
      });
      // 成功したら HOME へ移動
      router.push("/home");
    } catch (error) {
      alert("エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <h1>現在の状態：入室中</h1>
      <div style={{ marginTop: "30px" }}>
        {loading ? <p>処理中...</p> : (
          <button 
            onClick={handleExit}
            style={{ padding: "40px 80px", fontSize: "30px", background: "#f44336", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", boxShadow: "0 10px 20px rgba(244, 67, 54, 0.3)" }}
          >
            退室する 👋
          </button>
        )}
      </div>
      <p style={{marginTop: "20px", color: "#666"}}>※18時間を超えると自動で補正されます</p>
      <p style={{marginTop: "20px", color: "#888"}}>
        <a href="/home" style={{color: "#2196F3"}}>活動記録だけ見る場合はこちら</a>
      </p>
    </div>
  );
}