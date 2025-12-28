'use client';
import * as THREE from 'three';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment
} from '@react-three/drei';

// --- 資料庫設定 ---
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
    exclusion: ['wheel', 'tire', 'rim', 'hub'],
    fixedScale: 300
  }
};

const FFERRARI_COLORS = [
  { name: 'ROSSO CORSA', hex: '#ff2800' },
  { name: 'GIALLO MODENA', hex: '#FFD300' },
  { name: 'BIANCO AVUS', hex: '#ffffff' },
  { name: 'NERO DS', hex: '#111111' }
];

// --- 註冊彈窗 ---
function RegisterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex bg-black/40 backdrop-blur-sm transition-all">
      {/* 左側完整側邊欄 - 佔據 40% 寬度 */}
      <div className="w-[40vw] h-full bg-[#FFD300] p-[5vw] flex flex-col justify-center relative shadow-[20px_0_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-left duration-500">

        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-black text-[2vw] font-light hover:rotate-90 transition-transform duration-300"
        >
          ✕
        </button>

        {/* 標題區：字體大幅度放大 */}
        <div className="mb-[4vh]">
          <h2 className="text-[5vw] font-black italic tracking-tighter text-black leading-[0.9] uppercase">
            Join the <br /> Scuderia
          </h2>
          <p className="text-[1vw] text-black font-bold tracking-[0.3em] uppercase mt-4 opacity-70">
            Create your profile to save configurations
          </p>
        </div>

        {/* 表單區：放大 Input 與 Label */}
        <form className="space-y-[3vh]" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col space-y-2">
            <label className="text-[0.8vw] font-black uppercase text-black">Username</label>
            <input
              type="text"
              className="bg-transparent border-b-4 border-black py-4 outline-none text-[1.8vw] text-black font-black placeholder:text-black/10"
              placeholder="ENZO_1987"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[0.8vw] font-black uppercase text-black">Email Address</label>
            <input
              type="email"
              className="bg-transparent border-b-4 border-black py-4 outline-none text-[1.8vw] text-black font-black placeholder:text-black/10"
              placeholder="DRIVER@MARANELLO.IT"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[0.8vw] font-black uppercase text-black">Password</label>
            <input
              type="password"
              className="bg-transparent border-b-4 border-black py-4 outline-none text-[1.8vw] text-black font-black placeholder:text-black/10"
              placeholder="••••••••"
            />
          </div>

          {/* 註冊按鈕：更粗更寬 */}
          <button className="w-full bg-black text-[#FFD300] py-6 text-[1.2vw] font-black tracking-[0.8em] mt-10 hover:bg-white hover:text-black transition-all uppercase shadow-xl active:scale-95">
            Register Now
          </button>
        </form>

        <p className="mt-[5vh] text-[0.9vw] text-black font-black">
          ALREADY A MEMBER? <span className="underline cursor-pointer hover:opacity-60 transition-opacity">LOG IN TO YOUR GARAGE</span>
        </p>
      </div>

      {/* 右側空白區：點擊也可關閉 */}
      <div className="flex-grow h-full" onClick={onClose}></div>
    </div>
  );
}

// --- 模型渲染 ---
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
        // --- 修正後的邏輯：分開處理 F40 與 F50 的顏色套用 ---
        let isBody = false;
        if (modelType === 'F40') {
          // 這裡強制告訴 TS 這是 F40 的資料結構
          const f40Config = CAR_DATA.F40;
          isBody = f40Config.bodyParts.includes(child.name);
        } else {
          // 這裡處理 F50
          const f50Config = CAR_DATA.F50;
          isBody = child.name.includes(f50Config.bodyId);
        }

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

// --- 主頁面 ---
export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<'F40' | 'F50'>('F40');
  const [selectedColor, setSelectedColor] = useState(FFERRARI_COLORS[1]);

  return (
    <main className="flex h-screen w-screen bg-black overflow-hidden font-archivo italic font-black text-[#FFD300]">
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

      {/* 左側 展示區 */}
      <div className="relative w-[72vw] h-screen bg-black">
        {/* 右上角唯一按鈕 */}
        <div className="absolute top-[4vh] right-[4vw] z-50">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-8 py-3 bg-[#FFD300] text-black text-[0.7vw] font-black tracking-widest uppercase transition-all hover:bg-white active:scale-95"
          >
            Join Scuderia
          </button>
        </div>


        {/* --- 網頁名稱標題 (確保這裡存在) --- */}
        <div className="absolute top-[4vh] left-[4vw] z-50">
          <div className="w-[3.5vw] h-[5vw] bg-[#FFD300] flex items-center justify-center mb-1">
            <span className="text-black text-[2.5vw] not-italic">🐎</span>
          </div>
          <span className="tracking-tighter leading-none text-[1.4vw] block">ICONA EXHIBIT</span>
        </div>

        <Canvas shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[30, 15, 30]} fov={15} />
            <Environment preset="night" />
            <FerrariModel modelType={currentModel} color={selectedColor.hex} />
            <OrbitControls enablePan={false} target={[0, 1, 0]} />
          </Suspense>
        </Canvas>

        {/* 車型切換 */}
        <div className="absolute top-[4vh] left-1/2 -translate-x-1/2 z-50 flex border border-[#FFD300]/30 bg-black/20 backdrop-blur-md">
          {(['F40', 'F50'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setCurrentModel(m)}
              className={`px-12 py-3 text-[0.9vw] tracking-[0.2em] font-black text-black transition-all ${currentModel === m ? 'bg-[#FFD300]' : 'bg-[#FFD300]/40 hover:bg-[#FFD300]/60'
                }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 右側 資訊欄 */}
      <aside className="w-[28vw] h-screen bg-black flex flex-col p-[2.5vw] justify-start space-y-[3.5vh]">
        <div className="space-y-0.5">
          <span className="text-[1.1vw] border-b border-[#FFD300] pb-0.5 inline-block">{CAR_DATA[currentModel].year}</span>
          <h2 className="text-[5.5vw] leading-none tracking-tighter">{currentModel}</h2>
          <p className="text-[0.95vw] opacity-80 pt-1">{CAR_DATA[currentModel].description}</p>
        </div>

        <div className="space-y-3">
          {/* 移除 border-l 消除那一豎 */}
          <h3 className="text-[0.65vw] tracking-[0.4em] opacity-40 uppercase">Technical Data</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(CAR_DATA[currentModel].specs).map(([k, v]) => (
              <div key={k} className="border-b border-[#FFD300]/10 pb-0.5 text-black">
                <p className="text-[0.6vw] opacity-40 uppercase text-[#FFD300]">{k}</p>
                <p className="text-[1.6vw] text-[#FFD300]">{v}</p>
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
                className={`w-[2.5vw] h-[2.5vw] rounded-full border-[3px] transition-all ${selectedColor.name === c.name ? 'border-[#FFD300] scale-110' : 'border-[#FFD300]/40 opacity-60'
                  }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        <div className="flex-grow" />

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="w-full py-5 bg-[#FFD300] text-black text-[0.9vw] font-black tracking-[1em] hover:bg-white transition-all"
        >
          Register to Inquire
        </button>
      </aside>
    </main>
  );
}