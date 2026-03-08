// app/home/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "../../lib/firebase"; 
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [myTotalTime, setMyTotalTime] = useState("計算中...");
  
  // 日付設定
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/login");
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  // データ取得・計算ロジック（ランキング・時間・履歴）
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const q = query(collection(db, "attendances"), orderBy("timestamp", "desc"), limit(500));
      const snapshot = await getDocs(q);
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      // 今月分に絞る
      const thisMonthData = allData.filter(item => {
        if (!item.timestamp) return false;
        const d = item.timestamp.toDate();
        return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
      });

      // 自分の履歴
      setMyHistory(thisMonthData.filter(item => item.uid === user.uid));

      // ランキング計算
      const userLogsMap: any = {};
      thisMonthData.forEach(log => {
        if (!userLogsMap[log.uid]) userLogsMap[log.uid] = { name: log.name, logs: [] };
        userLogsMap[log.uid].logs.push(log);
      });
      
      const rankArray = Object.keys(userLogsMap).map(uid => {
        const { ms, display } = calculateTime(userLogsMap[uid].logs);
        if (uid === user.uid) setMyTotalTime(display); // 自分の時間
        return { uid, name: userLogsMap[uid].name, ms, display };
      });
      
      rankArray.sort((a, b) => b.ms - a.ms);
      setRanking(rankArray);
    };
    fetchData();
  }, [user]);

  // 時間計算関数(18hルール)
  const calculateTime = (logs: any[]) => {
    const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    let totalMs = 0;
    let entryTime: number | null = null;
    const LIMIT = 18 * 3600 * 1000;
    const FIX = 2 * 3600 * 1000;

    sorted.forEach(log => {
      const t = log.timestamp.toDate().getTime();
      if (log.type === "in") {
        if (entryTime && (t - entryTime > LIMIT)) totalMs += FIX;
        else if (entryTime) totalMs += FIX; 
        entryTime = t;
      } else if (log.type === "out") {
        if (entryTime) {
          const d = t - entryTime;
          totalMs += (d > LIMIT) ? FIX : d;
          entryTime = null;
        }
      }
    });
    if (entryTime) {
      if (new Date().getTime() - entryTime > LIMIT) totalMs += FIX;
    }

    const m = Math.floor(totalMs / 60000);
    return { ms: totalMs, display: `${Math.floor(m/60)}時間${m%60}分` };
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const formatTime = (ts: any) => {
    if(!ts) return "";
    const d = ts.toDate();
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
        <h2>📊 {currentMonth}月の活動状況</h2>
        <button onClick={handleLogout} style={{fontSize:"12px", background:"#ddd", border:"none", padding:"5px 10px", borderRadius:"4px", cursor:"pointer"}}>ログアウト</button>
      </div>

      {/* 自分の時間 */}
      <div style={{ background: "linear-gradient(135deg, #2196F3, #21CBF3)", padding: "20px", borderRadius: "10px", color: "white", marginBottom: "30px", textAlign:"center" }}>
        <p style={{margin:0}}>あなたの累計時間</p>
        <p style={{fontSize:"40px", fontWeight:"bold", margin:"10px 0"}}>{myTotalTime}</p>
        <Link href="/">
          <button style={{background:"white", color:"#2196F3", border:"none", padding:"10px 20px", borderRadius:"20px", fontWeight:"bold", cursor:"pointer"}}>入退室画面に戻る</button>
        </Link>
      </div>

      {/* ランキング */}
      <h3>🏆 ランキング</h3>
      <div style={{marginBottom:"30px"}}>
        {ranking.map((r, i) => (
          <div key={r.uid} style={{display:"flex", padding:"10px", borderBottom:"1px solid #eee", background: r.uid === user?.uid ? "#e3f2fd" : "white"}}>
            <span style={{width:"30px", fontWeight:"bold"}}>{i+1}</span>
            <span style={{flex:1}}>{r.name}</span>
            <span style={{fontWeight:"bold"}}>{r.display}</span>
          </div>
        ))}
      </div>

      {/* 履歴 */}
      <h3>📖 あなたの履歴</h3>
      <div>
        {myHistory.map(h => (
          <div key={h.id} style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #eee", fontSize:"14px"}}>
            <span>{formatTime(h.timestamp)}</span>
            <span style={{color: h.type==="in"?"green":"red", fontWeight:"bold"}}>{h.type==="in"?"入室":"退室"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}