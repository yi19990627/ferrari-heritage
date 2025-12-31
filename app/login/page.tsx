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
                else {
                    // 登入成功，跳回到主頁面
                    router.push('/');
                }
            } else {
                // --- 註冊邏輯 ---
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                });
                if (error) {
                    window.alert("❌ 註冊失敗: " + error.message);
                } else {
                    window.alert("✅ 註冊成功！請檢查信箱驗證。");
                }
            }
        } catch (err) {
            window.alert("💥 發生非預期錯誤");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-screen bg-[#FFD300] flex flex-col items-center justify-center p-10 font-archivo italic font-black">

            {/* 調整後的返回按鈕 */}
            <div className="absolute top-10 left-10 z-50">
                <Link
                    href="/"
                    className="group flex items-center gap-4 no-underline"
                >
                    <div className="w-[8vw] h-[3vw] bg-black text-[#FFD300] border-2 border-black flex items-center justify-center text-[0.8vw] tracking-[0.2em] uppercase font-bold hover:bg-transparent hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none">
                        ← Exit
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-[40vw]">
                <h1 className="text-[8vw] leading-[0.85] text-black uppercase mb-10 tracking-tighter">
                    {isLogin ? "Driver \n Login" : "Join the \n Scuderia"}
                </h1>

                <form onSubmit={handleAuth} className="space-y-8 relative">
                    <div className="flex flex-col space-y-2 text-black">
                        <label className="text-[0.8vw] uppercase tracking-[0.3em] opacity-60">Email Address</label>
                        <input
                            type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-b-4 border-black py-4 outline-none text-[2.5vw] font-black placeholder:text-black/10"
                            placeholder="driver@maranello.it"
                        />
                    </div>

                    <div className="flex flex-col space-y-2 text-black">
                        <label className="text-[0.8vw] uppercase tracking-[0.3em] opacity-60">Password</label>
                        <input
                            type="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-b-4 border-black py-4 outline-none text-[2.5vw] font-black placeholder:text-black/10"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="relative pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-[#FFD300] py-8 text-[1.5vw] font-black tracking-[1em] hover:bg-white hover:text-black transition-all uppercase"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                        </button>

                        <div className="absolute -bottom-12 right-0">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[0.8vw] font-black tracking-widest border-b border-black hover:opacity-50 transition-all lowercase italic"
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