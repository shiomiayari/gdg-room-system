// app/enter/page.tsx
"use client";
import { useState } from "react";
import { db, auth } from "../../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

// 緯度・経度から2点間の距離（メートル）を計算する関数
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // 地球の半径 (m)
  const toRadian = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRadian;
  const dLon = (lon2 - lon1) * toRadian;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRadian) * Math.cos(lat2 * toRadian) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function EnterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1つにまとめた入室ボタン処理
  const handleEnter = async () => {
    // ログインチェックと確認ダイアログ
    if (!auth.currentUser) {
      alert("ログインが必要です");
      return;
    }
    const isConfirmed = window.confirm("【確認】入室しますか？");
    if (!isConfirmed) return;

    //  Firebaseに書き込む処理を「小さな関数」としてまとめる
    const executeFirebaseEnter = async () => {
      try {
        setLoading(true);
        await addDoc(collection(db, "attendances"), {
          uid: auth.currentUser?.uid,
          name: auth.currentUser?.displayName,
          email: auth.currentUser?.email,
          type: "in",
          timestamp: serverTimestamp(),
        });
        // 成功したら HOME へ移動
        router.push("/home");
      } catch (error) {
        alert("エラーが発生しました");
        setLoading(false);
      }
    };

    // ① 開発モード（localhost）ならGPSをスキップ
    if (process.env.NODE_ENV === 'development') {
      alert("【開発モード】GPS判定をスキップして入室処理を実行します！");
      await executeFirebaseEnter();
      return;
    }

    // ② 本番環境（Vercel）でのみ、実際のGPS判定を行う
    if (!navigator.geolocation) {
      alert("端末の位置情報機能がオンになっていません。");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLon = position.coords.longitude;
        
        // 吹田キャンパスの正確な座標
        const roomLat = 34.8235406568409; 
        const roomLon = 135.5242074692715; 

        const distance = getDistance(currentLat, currentLon, roomLat, roomLon);

        // ③ 部室から「半径150メートル以内」なら入室Ok
        if (distance <= 150) {
          await executeFirebaseEnter(); 
        } else {
          // 距離が遠い場合はkmに直して表示
          alert(`キャンパスから遠すぎます！（現在約${Math.round(distance / 1000)}km離れています）\n部室の近くで押してください。`);
        }
      },
      (error) => {
        alert("位置情報を取得できませんでした。ブラウザの許可設定を確認してください。");
      }
    );
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <h1>現在の状態：未入室</h1>
      <div style={{ marginTop: "30px" }}>
        {loading ? <p>処理中...</p> : (
          <button 
            onClick={handleEnter}
            style={{ padding: "40px 80px", fontSize: "30px", background: "#4CAF50", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", boxShadow: "0 10px 20px rgba(76, 175, 80, 0.3)" }}
          >
            入室する 🚪
          </button>
        )}
      </div>
      <p style={{marginTop: "20px", color: "#888"}}>
        <a href="/home" style={{color: "#2196F3"}}>活動記録だけ見る場合はこちら</a>
      </p>
    </div>
  );
}