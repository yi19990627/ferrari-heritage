'use client';
import * as THREE from 'three';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { createBrowserClient } from '@supabase/ssr';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment
} from '@react-three/drei';

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
    description: "核心技術源自 90 年代 F1 賽車，採用 4.7 升 V12 自然進氣引擎。",
    specs: { Engine: '4.7L V12', Power: '520 CV', '0-100': '3.8s', 'Top': '325 km/h' },
    bodyParts: ['body_red_0', 'wing_red_0'],
    fixedScale: 3
  },
  ENZO: {
    fullName: "Enzo Ferrari",
    year: "2002 - 2004",
    modelPath: '/ferrari_enzo.glb',
    description: "以創辦人之名命名，展現了當時法拉利在 F1 的統治性技術成果。",
    specs: { Engine: '6.0L V12', Power: '660 CV', '0-100': '3.6s', 'Top': '350 km/h' },
    bodyParts: ['Object_4', 'Object_5', 'Object_31', 'Object_32'],
    fixedScale: 0.05
  },
  LAFERRARI: {
    fullName: "LaFerrari",
    year: "2013 - 2016",
    modelPath: '/laferrari.glb',
    description: "首款搭載 HY-KERS 混合動力系統的旗艦跑車，開啟了電氣化新紀元。",
    specs: { Engine: '6.3L V12 Hybrid', Power: '963 CV', '0-100': '< 3s', 'Top': '> 350 km/h' },
    bodyParts: ['body_ext_0', 'door_l_ext_0', 'door_r_ext_0'],
    fixedScale: 3
  }
};

const FFERRARI_COLORS = [
  { name: 'ROSSO CORSA', hex: '#FF0000' },
  { name: 'GIALLO MODENA', hex: '#FFD300' },
  { name: 'BIANCO AVUS', hex: '#FFFFFF' },
  { name: 'NERO DS', hex: '#000000' }
];

// --- 註冊 Modal (恢復精緻黑底樣式) ---
function RegisterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    window.alert("偵測到註冊點擊！");
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) window.alert("❌ 註冊失敗: " + error.message);
      else {
        window.alert("✅ 註冊成功！請查看 Supabase Users。");
        onClose();
      }
    } catch (err) {
      window.alert("💥 系統錯誤: " + err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="w-[35vw] border border-[#FFD300]/20 bg-black p-12 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-[#FFD300] hover:scale-125 transition-all text-xl">✕</button>
        <h2 className="text-[2.5vw] font-black italic tracking-tighter mb-10 text-[#FFD300] leading-none">JOIN THE SCUDERIA</h2>
        <form onSubmit={handleSignUp} className="space-y-8">
          <div className="space-y-2">
            <p className="text-[0.6vw] tracking-[0.3em] opacity-40 uppercase">Email Address</p>
            <input
              type="email"
              className="w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-[#FFD300] transition-colors uppercase text-[1vw]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <p className="text-[0.6vw] tracking-[0.3em] opacity-40 uppercase">Password (Min 6 characters)</p>
            <input
              type="password"
              className="w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-[#FFD300] transition-colors text-[1vw]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full py-5 bg-[#FFD300] text-black font-black text-[0.8vw] tracking-[0.5em] hover:bg-white transition-all uppercase mt-4">
            CONFIRM REGISTRATION
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 3D 模型渲染 ---
function FerrariModel({ modelPath, color, bodyParts, scale }: { modelPath: string; color: string; bodyParts: string[]; scale: number }) {
  const gltf = useLoader(GLTFLoader, modelPath);
  const scene = useMemo(() => gltf.scene.clone(), [gltf]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && bodyParts.includes(child.name)) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          metalness: 0.9,
          roughness: 0.1,
        });
      }
    });
  }, [scene, color, bodyParts]);

  return <primitive object={scene} scale={scale} position={[0, -1, 0]} />;
}

// --- 主頁面 ---
export default function Home() {
  const [currentModel, setCurrentModel] = useState<keyof typeof CAR_DATA>('F40');
  const [selectedColor, setSelectedColor] = useState(FFERRARI_COLORS[0]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <main className="h-screen w-screen bg-black text-white font-inter flex overflow-hidden relative">
      {/* 左側資訊區 */}
      <section className="w-[35vw] p-16 flex flex-col justify-between z-10 bg-gradient-to-r from-black via-black/80 to-transparent relative">
        <div>
          <div className="w-12 h-1 bg-[#FFD300] mb-8" />
          <h1 className="text-[5.5vw] font-black leading-[0.85] italic tracking-tighter mb-4">
            {CAR_DATA[currentModel].fullName}
          </h1>
          <p className="text-[#FFD300] text-[1.2vw] font-archivo mb-8 tracking-[0.3em]">
            {CAR_DATA[currentModel].year}
          </p>
          <p className="text-[1.1vw] leading-relaxed opacity-60 font-light max-w-[22vw]">
            {CAR_DATA[currentModel].description}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {Object.keys(CAR_DATA).map((key) => (
            <button
              key={key}
              onClick={() => setCurrentModel(key as keyof typeof CAR_DATA)}
              className={`text-left text-[1.8vw] font-black italic transition-all duration-500 ${currentModel === key ? 'text-[#FFD300] translate-x-4 scale-110' : 'text-white/10 hover:text-white/40'}`}
            >
              {key}
            </button>
          ))}
        </div>
      </section>

      {/* 3D 畫布 */}
      <section className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[5, 2, 8]} fov={35} />
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} />
          <Suspense fallback={null}>
            <FerrariModel
              modelPath={CAR_DATA[currentModel].modelPath}
              color={selectedColor.hex}
              bodyParts={CAR_DATA[currentModel].bodyParts}
              scale={CAR_DATA[currentModel].fixedScale}
            />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </section>

      {/* 右側規格面板 */}
      <aside className="w-[22vw] border-l border-white/5 p-12 flex flex-col justify-between z-10 bg-black/40 backdrop-blur-md">
        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-[0.65vw] tracking-[0.5em] opacity-40 uppercase">Technical Specs</h3>
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(CAR_DATA[currentModel].specs).map(([k, v]) => (
                <div key={k} className="border-b border-white/5 pb-2">
                  <p className="text-[0.6vw] opacity-30 uppercase mb-1">{k}</p>
                  <p className="text-[1.4vw] font-bold tracking-tight italic">{v as string}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[0.65vw] tracking-[0.5em] opacity-40 uppercase">Select Finish</p>
            <div className="flex gap-4">
              {FFERRARI_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-[2.2vw] h-[2.2vw] rounded-full border-[2px] transition-all duration-300 ${selectedColor.name === c.name ? 'border-[#FFD300] scale-125' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="w-full py-6 bg-white text-black text-[0.8vw] font-black tracking-[0.8em] hover:bg-[#FFD300] transition-all uppercase shadow-lg active:scale-95"
        >
          Register
        </button>
      </aside>

      {/* 註冊彈窗 */}
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </main>
  );
}