'use client';
import * as THREE from 'three';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
// --- 修改這裡：更換更穩定的導入方式 ---
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
  }
};

const FFERRARI_COLORS = [
  { name: 'ROSSO CORSA', hex: '#FF0000' },
  { name: 'GIALLO MODENA', hex: '#FFD300' },
  { name: 'BIANCO AVUS', hex: '#FFFFFF' },
  { name: 'NERO DS', hex: '#000000' }
];

function RegisterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    window.alert("偵測到註冊點擊！開始嘗試連線...");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) {
        window.alert("❌ 註冊失敗: " + error.message);
      } else {
        window.alert("✅ 註冊成功！請檢查 Supabase Users。");
        onClose();
      }
    } catch (err) {
      window.alert("💥 系統錯誤: " + err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex bg-black/60 backdrop-blur-md">
      <div className="w-[40vw] h-full bg-[#FFD300] p-[5vw] flex flex-col justify-center relative shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute top-10 right-10 text-black text-[2vw]">✕</button>
        <h2 className="text-[5vw] font-black italic tracking-tighter text-black leading-[0.9] uppercase mb-[4vh]">Join the <br /> Scuderia</h2>
        <form className="space-y-[3vh]" onSubmit={handleSignUp}>
          <input
            type="email"
            placeholder="DRIVER@MARANELLO.IT"
            className="w-full bg-transparent border-b-4 border-black py-4 outline-none text-[1.8vw] font-black placeholder:text-black/10 uppercase text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-transparent border-b-4 border-black py-4 outline-none text-[1.8vw] font-black placeholder:text-black/10 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-black text-[#FFD300] py-6 text-[1.2vw] font-black tracking-[0.8em] mt-10 hover:bg-white hover:text-black transition-all">
            REGISTER NOW
          </button>
        </form>
      </div>
      <div className="flex-grow h-full" onClick={onClose}></div>
    </div>
  );
}

// 模型與主頁面組件維持原樣...
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

export default function Home() {
  const [currentModel, setCurrentModel] = useState<keyof typeof CAR_DATA>('F40');
  const [selectedColor, setSelectedColor] = useState(FFERRARI_COLORS[0]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <main className="h-screen w-screen bg-black text-[#FFD300] font-archivo italic flex overflow-hidden">
      <section className="w-[35vw] p-16 flex flex-col justify-between z-10">
        <div>
          <h1 className="text-[5vw] font-black leading-[0.85] tracking-tighter mb-4">{CAR_DATA[currentModel].fullName}</h1>
          <p className="text-[1.1vw] opacity-70 font-light max-w-[25vw] not-italic text-white">{CAR_DATA[currentModel].description}</p>
        </div>
        <div className="flex flex-col gap-4">
          {Object.keys(CAR_DATA).map((key) => (
            <button key={key} onClick={() => setCurrentModel(key as keyof typeof CAR_DATA)} className={`text-left text-[2vw] font-black ${currentModel === key ? 'text-[#FFD300]' : 'text-white/20'}`}>{key}</button>
          ))}
        </div>
      </section>

      <section className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[5, 2, 8]} fov={35} />
          <OrbitControls enableZoom={false} />
          <Suspense fallback={null}>
            <FerrariModel modelPath={CAR_DATA[currentModel].modelPath} color={selectedColor.hex} bodyParts={CAR_DATA[currentModel].bodyParts} scale={CAR_DATA[currentModel].fixedScale} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </section>

      <aside className="w-[25vw] p-12 flex flex-col gap-12 z-10 bg-black/40 border-l border-[#FFD300]/10">
        <button onClick={() => setIsRegisterOpen(true)} className="w-full py-5 bg-[#FFD300] text-black text-[0.9vw] font-black tracking-[1em] hover:bg-white uppercase">Register</button>
      </aside>
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </main>
  );
}