// app/login/page.tsx
'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) window.alert("❌ 登入失敗: " + error.message);
                else router.push('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                });
                if (error) window.alert("❌ 註冊失敗: " + error.message);
                else window.alert("✅ 註冊成功！請檢查信箱驗證。");
            }
        } catch (err) {
            window.alert("💥 發生非預期錯誤");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-screen bg-[#FFD300] flex flex-col items-center justify-center p-10 font-archivo italic font-black relative overflow-hidden">

            {/* 返回按鈕：調整為 top-[11.5vw] 以對齊標題高度，left 往右移至 [10vw] */}
            <div className="absolute top-[11.5vw] left-[10vw] z-50">
                <Link href="/" className="group flex items-center no-underline">
                    <div className="w-[9vw] h-[3.5vw] bg-[#FFD300] text-black border-2 border-black flex items-center justify-center text-[0.9vw] tracking-[0.1em] font-bold hover:scale-110 active:scale-95 transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none">
                        ← Exit
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-[50vw] flex flex-col items-center text-black">
                <h1 className="text-[5vw] leading-none mb-16 tracking-tighter whitespace-nowrap">
                    {isLogin ? "User Login" : "Join the tifosi club"}
                </h1>

                <form onSubmit={handleAuth} className="space-y-16 relative w-[35vw]">

                    {/* Email 欄位 */}
                    <div className="flex flex-col space-y-4">
                        <label className="text-[0.9vw] tracking-[0.2em] opacity-60">Email Address</label>
                        <input
                            type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-b-4 border-black py-3 outline-none text-[2vw] font-black placeholder:text-black/10"
                            placeholder="driver@maranello.it"
                        />
                    </div>

                    {/* Password 欄位 */}
                    <div className="flex flex-col space-y-4">
                        <label className="text-[0.9vw] tracking-[0.2em] opacity-60">Password</label>
                        <input
                            type="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-b-4 border-black py-3 outline-none text-[2vw] font-black placeholder:text-black/10"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* 登入按鈕區塊 - 縮小寬度並與左側對齊 */}
                    <div className="flex flex-col space-y-4">
                        <label className="text-[0.9vw]">&nbsp;</label>
                        <button
                            type="submit"
                            disabled={loading}
                            /* 縮小寬度至 w-[12vw]，移除背景與厚邊框，統一為底部邊框 */
                            className="w-[12vw] bg-transparent border-b-4 border-black py-3 text-left text-[2vw] font-black tracking-[0.2em] transition-opacity hover:opacity-50 disabled:opacity-30"
                        >
                            {loading ? '...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </div>

                    {/* 註冊切換區塊 */}
                    <div className="flex flex-col space-y-4">
                        <label className="text-[0.9vw]">&nbsp;</label>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[0.85vw] font-black tracking-widest border-b-2 border-black hover:opacity-50 transition-all lowercase italic text-black"
                            >
                                {isLogin ? "need an account? register →" : "already a member? login →"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}