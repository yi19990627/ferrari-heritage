'use client';
import * as THREE from 'three';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { createBrowserClient } from '@supabase/ssr'; // 確保 Vercel 通過的正確引用
import {
  OrbitControls,
  PerspectiveCamera,
  Environment
} from '@react-three/drei';
import Link from 'next/link';

// --- 初始化 Supabase ---
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CAR_DATA = {
  F40: {
    fullName: "Ferrari F40",
    year: "1987 - 1992",
    modelPath: '/ferrari_f40.glb',
    description: "Enzo Ferrari 生前最後親自監督的作品。採用碳纖維與克維拉纖維打造，不帶任何電子輔助。",
    specs: { Engine: '2.9L V8 TT', Power: '478 CV', '0-100': '4.1s', 'Top': '324 km/h' },
    bodyParts: ['Object_9', 'Object_10', 'Object_11', 'Object_8'],
    fixedScale: 3
  },
  F50: {
    fullName: "Ferrari F50",
    year: "1995 - 1997",
    modelPath: '/ferrari_f50.glb',
    description: "核心技術源自 90 年代 F1 賽車，採用 4.7 升 V12 自然進氣引擎，真正實現公路上的 F1 體驗。",
    specs: { Engine: '4.7L V12', Power: '520 CV', '0-100': '3.8s', 'Top': '325 km/h' },
    bodyId: '58',
    fixedScale: 300
  }
};

const FFERRARI_COLORS = [
  { name: 'ROSSO CORSA', hex: '#ff2800' },
  { name: 'GIALLO MODENA', hex: '#FFD300' },
  { name: 'BIANCO AVUS', hex: '#ffffff' },
  { name: 'NERO DS', hex: '#111111' }
];


// --- 模型渲染邏輯 ---
function FerrariModel({ modelType, color }: { modelType: 'F40' | 'F50'; color: string }) {
  const config = CAR_DATA[modelType];
  const gltf = useLoader(GLTFLoader, config.modelPath);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone();
    cloned.scale.set(config.fixedScale, config.fixedScale, config.fixedScale);
    return cloned;
  }, [gltf, config.fixedScale]);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        let isBody = false;
        if (modelType === 'F40') isBody = (CAR_DATA.F40 as any).bodyParts.includes(child.name);
        else isBody = child.name.includes((CAR_DATA.F50 as any).bodyId);

        if (isBody) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(color),
            metalness: 0.2,
            roughness: 0.1,
            clearcoat: 1.0
          });
        }
      }
    });
  }, [scene, color, modelType]);

  return <primitive object={scene} />;
}

// --- 主頁面組件 ---
// ... 前方 import 與 CAR_DATA 保持不變 ...

export default function Home() {
  const [currentModel, setCurrentModel] = useState<'F40' | 'F50'>('F40');
  const [selectedColor, setSelectedColor] = useState(FFERRARI_COLORS[1]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <main className="flex h-screen w-screen bg-black overflow-hidden font-archivo italic font-black text-[#FFD300]">
      {/* 左側 展示區 (72vw) */}
      <div className="relative w-[72vw] h-full bg-black">

        {/* --- 修正：登入狀態下的按鈕與登出連結 --- */}
        <div className="absolute top-[4vh] right-[4vw] z-[100] flex flex-col items-end gap-2">
          <Link href={session ? "/dashboard" : "/login"}>
            <button className="px-8 py-3 bg-[#FFD300] text-black text-[0.8vw] font-black tracking-widest transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,211,0,0.3)]">
              {session ? "driver profile" : "login / join"}
            </button>
          </Link>

          {/* 如果已登入，顯示小寫的登出按鈕 */}
          {session && (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload(); // 登出後重新整理頁面以更新狀態
              }}
              className="text-[0.7vw] text-[#FFD300] opacity-60 hover:opacity-100 transition-all lowercase italic border-b border-[#FFD300]/30"
            >
              sign out →
            </button>
          )}
        </div>

        {/* 左上 Logo (保持不變) */}
        <div className="absolute top-[4vh] left-[4vw] z-50">
          <div className="w-[3.5vw] h-[5vw] bg-[#FFD300] flex items-center justify-center mb-1">
            <span className="text-black text-[2.5vw] not-italic">🐎</span>
          </div>
          <span className="tracking-tighter leading-none text-[1.4vw] block">Tifosi club</span>
        </div>

        {/* --- 3D 渲染區域 --- */}
        <Canvas shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[30, 15, 30]} fov={15} />
            <Environment preset="night" />
            <FerrariModel modelType={currentModel} color={selectedColor.hex} />
            <OrbitControls enablePan={false} target={[0, 1, 0]} />
          </Suspense>
        </Canvas>

        {/* 頂部型號切換 */}
        <div className="absolute top-[4vh] left-1/2 -translate-x-1/2 z-50 flex border border-[#FFD300]/30 bg-black/20 backdrop-blur-md">
          {(['F40', 'F50'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setCurrentModel(m)}
              className={`px-12 py-3 text-[0.9vw] tracking-[0.2em] font-black transition-all ${currentModel === m
                ? 'bg-[#FFD300] text-black' // 選中時：背景黃色，文字絕對黑色
                : 'text-black hover:bg-[#FFD300]/20' // 未選中時：文字黃色
                }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 右側 資訊欄 (保持原樣) */}
      <aside className="w-[28vw] h-full bg-black flex flex-col p-[2.5vw] border-l border-[#FFD300]/10 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col space-y-[4vh]">
          <div>
            <span className="text-[1.1vw] border-b border-[#FFD300] pb-0.5 inline-block">{CAR_DATA[currentModel].year}</span>
            <h2 className="text-[5.5vw] leading-none tracking-tighter uppercase">{currentModel}</h2>
            <p className="text-[0.95vw] opacity-80 pt-1 not-italic font-medium text-white">{CAR_DATA[currentModel].description}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-[0.65vw] tracking-[0.4em] opacity-40 uppercase">Technical Data</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(CAR_DATA[currentModel].specs).map(([k, v]) => (
                <div key={k} className="border-b border-[#FFD300]/10 pb-1">
                  <p className="text-[0.6vw] opacity-40 uppercase">{k}</p>
                  <p className="text-[1.6vw]">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[0.65vw] tracking-[0.3em] opacity-40 uppercase">Paint Selection</p>
            <div className="flex gap-6">
              {FFERRARI_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-[2.5vw] h-[2.5vw] rounded-full border-[3px] transition-all ${selectedColor.name === c.name ? 'border-[#FFD300] scale-110' : 'border-[#FFD300]/40 opacity-60'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}