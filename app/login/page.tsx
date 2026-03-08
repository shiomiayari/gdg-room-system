// app/login/page.tsx
"use client";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // ログインできたらトップ（振り分け係）に戻る
      router.push("/");
    } catch (error) {
      alert("ログインに失敗しました");
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>部室 入退室システム</h1>
      <div style={{ marginTop: "50px" }}>
        <p>利用するにはログインしてください</p>
        <button 
          onClick={handleLogin}
          style={{ padding: "20px 40px", fontSize: "18px", background: "#4285F4", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
}