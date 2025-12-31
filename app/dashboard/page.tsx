// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [selectedCar, setSelectedCar] = useState('Ferrari F80');
    const [isOpen, setIsOpen] = useState(false);
    const [ownedCars, setOwnedCars] = useState<string[]>([]);

    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const CAR_DATA: Record<string, { id: string; desc: string; year: number }> = {
        'LaFerrari': { id: 'iRsV6YpLsKA', year: 2013, desc: 'Ferrari 首款採用混合動力技術的頂尖超跑，象徵著品牌的技術巔峰。' },
        'LaFerrari Aperta': { id: 'OmLlfGJ2Vww', year: 2016, desc: 'LaFerrari 的敞篷版本，完美結合極致性能與開篷駕駛的純粹感。' },
        'Ferrari F80': { id: 'tYSo0LsHhvo', year: 2024, desc: '新世代旗艦超跑，搭載 V6 油電系統與賽道級空氣動力學技術。' },
        '812 Superfast': { id: '_fgOFAPtWRI', year: 2017, desc: '搭載 6.5 升 V12 自然進氣引擎，提供無與倫比的加速力與聲浪。' },
        'Portofino': { id: 'SiPiAMZwmkw', year: 2017, desc: '優雅的 2+ 硬頂敞篷跑車，兼具日常實用性與經典的 GT 風格。' },
        '488 Pista': { id: 'DS6Qe0tiIq8', year: 2018, desc: '賽道競技導向的極限車型，承襲了 Ferrari 488 GTE 的賽車基因。' },
        '488 Pista Spider': { id: 'PaB6BhMunX8', year: 2018, desc: '全球性能最強悍的 Ferrari 敞篷跑車之一，讓賽道科技走入公路。' },
        'Monza SP1 / SP2': { id: 'l9c6gYsgoME', year: 2018, desc: 'Icona 系列首作，向 1950 年代經典的 Barchetta 賽車致敬。' },
        'F8 Tributo': { id: 'y12f7NxFgkw', year: 2019, desc: '向 Ferrari 史上最強 V8 引擎致敬，展現極致的空氣動力效率。' },
        'F8 Spider': { id: '6LihAJmSg_4', year: 2019, desc: '結合獲獎無數的 V8 引擎與電動硬頂，在陽光下釋放速度。' },
        'SF90 Stradale': { id: 'BfiNHTj1wsI', year: 2019, desc: '首款量產插電式油電混合動力跑車，開啟了 Ferrari 的新時代。' },
        'Roma': { id: 'qM_CJ8vuzyw', year: 2019, desc: '以 1950、60 年代羅馬生活方式為靈感，呈現極簡優雅的視覺語言。' },
        '812 GTS': { id: 'I4q3USGa7sA', year: 2019, desc: '闊別 50 年後再度回歸的 V12 前置引擎量產敞篷車型。' },
        'Portofino M': { id: 'OEO1huPvSzU', year: 2020, desc: 'Modificata 車型，動力與性能經過全面進化，更具運動氣息。' },
        'SF90 Spider': { id: 'ioqgCQBUDaY', year: 2020, desc: 'SF90 的敞篷版本，在 1000 匹馬力下享受無極限的駕駛樂趣。' },
        '296 GTB': { id: 'D7Zv2kSBagc', year: 2021, desc: '重新定義「駕駛樂趣」，展現 120 度 V6 引擎與電動馬達的完美融合。' },
        '812 Competizione': { id: '6VOg_ghFTJM', year: 2021, desc: 'V12 系列的終極性能版，專為尋求最純粹賽車靈魂的藏家打造。' },
        'Daytona SP3': { id: 'MLUEcoyXvjE', year: 2021, desc: 'Icona 系列新作，融合 60 年代賽車美學與當代尖端動力。' },
        'Purosangue': { id: 'Y0CPrFtwb4g', year: 2022, desc: 'Ferrari 史上首款四門四座車型，打破界限並保留品牌熱血靈魂。' },
        'Roma Spider': { id: '9HAJwfq_jVY', year: 2023, desc: '經典織物軟頂回歸，以現代科技詮釋意式美好生活。' },
        'SF90 XX Stradale': { id: '2xbg44TCiww', year: 2023, desc: '首款公路版 XX 車型，將法拉利賽道實驗計畫帶入一般街道。' },
        '12Cilindri': { id: 'DdflxSmUD00', year: 2024, desc: '向傳奇 V12 引擎致敬，融合復古元素與前衛設計的新時代旗艦。' },
        '12Cilindri Spider': { id: '-JBXESNtZqw', year: 2024, desc: '12Cilindri 的開篷版本，讓 V12 引擎的咆嘯聲響徹天際。' }
    };

    const sortedCarNames = Object.keys(CAR_DATA).sort((a, b) => CAR_DATA[b].year - CAR_DATA[a].year);

    // 1. 初始化收藏資料
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data: cars } = await supabase
                .from('cars')
                .select('model_name')
                .eq('owner_id', user.id);

            if (cars) setOwnedCars(cars.map(c => c.model_name));
        };
        fetchUserData();
    }, [router, supabase]);

    // 2. [核心修正] 監聽全域點擊，若點擊選單外部則關閉
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const container = document.getElementById('car-menu-container');
            // 如果選單開啟中，且點擊的目標不包含在選單容器內，則關閉
            if (isOpen && container && !container.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const addToCollection = async () => {
        if (!user || ownedCars.includes(selectedCar)) return;

        const { error } = await supabase
            .from('cars')
            .insert([{ 
                owner_id: user.id, 
                model_name: selectedCar, 
                is_public: true 
            }]);

        if (!error) {
            setOwnedCars(prev => [...prev, selectedCar]);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (!user) return <div className="bg-black h-screen w-screen" />;

    return (
        <main className="flex h-screen w-screen bg-black overflow-hidden font-archivo italic font-black text-[#FFD300]">
            
            {/* 左側 展示區 */}
            <div className="relative w-[72vw] h-full bg-black flex flex-col pt-[3vw] px-[4vw]">
                <h1 className="text-[1.1vw] font-black leading-none tracking-[0.5em] opacity-60 uppercase">Personal Profile</h1>
                <div className="flex-1 flex flex-col justify-center">
                    <div className="w-full max-w-[50vw] mx-auto">
                        <div className="relative w-full aspect-[16/9] bg-black overflow-hidden hover:-translate-y-2 transition-transform duration-700 ease-out border border-[#FFD300]/10 shadow-[0_0_50px_rgba(255,211,0,0.05)]">
                            <iframe
                                key={selectedCar}
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${CAR_DATA[selectedCar].id}?autoplay=1&mute=1&rel=0`}
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full border-0"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>

            {/* 右側 資訊欄 */}
            <aside className="w-[28vw] h-full bg-black flex flex-col p-[2.5vw] border-l border-[#FFD300]/10">
                
                <div className="flex justify-between items-start mb-16 w-full">
                    <Link 
                        href="/" 
                        className="w-[10vw] h-[3.5vw] bg-transparent border-2 border-[#FFD300] text-[#FFD300] no-underline hover:no-underline text-[0.85vw] tracking-[0.2em] uppercase font-bold hover:bg-[#FFD300] hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center text-center"
                    >
                        回到主選單
                    </Link>

                    <div className="flex flex-col items-end gap-3">
                        <button 
                            onClick={handleLogout} 
                            className="w-[10vw] h-[3.5vw] bg-transparent border-2 border-[#FFD300] text-[#FFD300] text-[0.85vw] tracking-[0.2em] uppercase font-bold hover:bg-[#FFD300] hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
                        >
                            登出
                        </button>
                        <p className="text-[0.6vw] text-white/20 lowercase tracking-[0.3em] italic pr-1">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-8 flex-1 flex flex-col">
                    <div>
                        <span className="text-[0.8vw] border-b border-[#FFD300] pb-0.5 opacity-60 uppercase">Current Selection</span>
                        <h2 className="text-[3vw] leading-none tracking-tighter mt-4 whitespace-nowrap overflow-hidden text-ellipsis uppercase">
                            {selectedCar}
                        </h2>

                        <div className="mt-6 h-[4vw] flex items-center">
                            {ownedCars.includes(selectedCar) ? (
                                <span className="text-[0.7vw] text-[#FFD300]/50 italic tracking-widest flex items-center gap-2">
                                    <span className="text-[1.2vw]">✓</span> IN YOUR COLLECTION
                                </span>
                            ) : (
                                <button
                                    onClick={addToCollection}
                                    className="px-8 py-3 bg-transparent border-2 border-[#FFD300] text-[#FFD300] text-[0.85vw] tracking-[0.2em] uppercase font-bold hover:bg-[#FFD300] hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 italic"
                                >
                                    + 新增車輛
                                </button>
                            )}
                        </div>

                        <div className="mt-8 pr-4">
                            <p className="text-[0.85vw] leading-relaxed text-[#FFD300]/70 font-medium italic">
                                {CAR_DATA[selectedCar].desc}
                            </p>
                        </div>
                    </div>

                    {/* 下拉選單容器：需對應 useEffect 中的 id */}
                    <div className="relative pt-10 border-t border-[#FFD300]/10" id="car-menu-container">
                        <p className="text-[0.65vw] tracking-[0.4em] opacity-40 mb-4 uppercase">Select Model</p>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`w-full border-2 p-4 flex justify-between items-center transition-all duration-300 ${
                                isOpen ? 'bg-[#FFD300] text-black border-[#FFD300]' : 'bg-black text-[#FFD300] border-[#FFD300]/30'
                            }`}
                        >
                            <span className="text-[1vw] tracking-wider font-bold">{selectedCar}</span>
                            <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {isOpen && (
                            <div className="absolute top-full left-0 w-full bg-black border border-[#FFD300]/30 mt-2 z-50 max-h-[40vh] overflow-y-auto custom-scrollbar shadow-2xl">
                                {sortedCarNames.map((car, index) => {
                                    const currentYear = CAR_DATA[car].year;
                                    const prevYear = index > 0 ? CAR_DATA[sortedCarNames[index - 1]].year : null;
                                    const showYearDivider = currentYear !== prevYear;

                                    return (
                                        <div key={car}>
                                            {showYearDivider && (
                                                <div className="bg-[#FFD300]/10 px-4 py-2 text-[0.6vw] tracking-[0.3em] text-[#FFD300] border-y border-[#FFD300]/10 font-bold uppercase">
                                                    {currentYear} SERIES
                                                </div>
                                            )}
                                            <div
                                                onClick={() => { setSelectedCar(car); setIsOpen(false); }}
                                                className="p-4 text-[0.9vw] text-[#FFD300] bg-black cursor-pointer hover:bg-[#FFD300] hover:text-black border-b border-[#FFD300]/10 last:border-0 transition-colors flex justify-between items-center group"
                                            >
                                                <span>{car}</span>
                                                <div className="flex items-center gap-3">
                                                    {ownedCars.includes(car) && <span className="text-[0.6vw] opacity-40 italic">OWNED</span>}
                                                    <span className="text-[0.6vw] opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase">Select →</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-10 border-t border-[#FFD300]/10">
                    <a 
                        href={`https://www.youtube.com/watch?v=${CAR_DATA[selectedCar].id}`} 
                        target="_blank" 
                        className="text-[0.7vw] border-b border-[#FFD300] pb-1 hover:text-white hover:border-white transition-all"
                    >
                        Extended media content →
                    </a>
                </div>
            </aside>
        </main>
    );
}