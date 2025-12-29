'use client';
import * as THREE from 'three';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment
} from '@react-three/drei';

// --- 初始化 Supabase ---
const supabase = createClientComponentClient();

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

// --- 3D 模型組件 ---
function FerrariModel({ modelPath, color, bodyParts, scale }: { modelPath: string; color: string; bodyParts: string[]; scale: number }) {
  const gltf = useLoader(GLTFLoader, modelPath);
  const scene = useMemo(() => gltf.scene.clone(), [gltf]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && bodyParts.includes(child.name)) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          metalness: 0.9,
          roughness: 0.1,
        });
      }
    });
  }, [scene, color, bodyParts]);

  return <primitive object={scene} scale={scale} position={[0, -1, 0]} />;
}

// --- 註冊 Modal 組件 ---
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
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        window.alert("❌ 註冊失敗，原因是：" + error.message);
      } else {
        window.alert("✅ 註冊成功！請去 Supabase 後台重新整理 Users 列表。");
        onClose();
      }
    } catch (err) {
      window.alert("💥 系統發生意外錯誤：" + err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="w-[30vw] border border-[#FFD300]/30 bg-black p-10 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#FFD300] hover:scale-125">✕</button>
        <h2 className="text-[2vw] font-black tracking-tighter mb-8 italic">JOIN SCUDERIA</h2>
        <form onSubmit={handleSignUp} className="space-y-6">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className="w-full bg-transparent border-b border-[#FFD300]/30 py-3 text-white outline-none focus:border-[#FFD300]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="PASSWORD (MIN 6 CHARACTERS)"
            className="w-full bg-transparent border-b border-[#FFD300]/30 py-3 text-white outline-none focus:border-[#FFD300]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full py-4 bg-[#FFD300] text-black font-bold hover:bg-white transition-all">
            REGISTER NOW
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 主頁面 ---
export default function Home() {
  const [currentModel, setCurrentModel] = useState<keyof typeof CAR_DATA>('F40');
  const [selectedColor, setSelectedColor] = useState(FFERRARI_COLORS[0]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <main className="h-screen w-screen bg-black text-white font-inter flex overflow-hidden">
      {/* 左側資訊 */}
      <section className="w-[35vw] p-16 flex flex-col justify-between z-10 bg-gradient-to-r from-black via-black/80 to-transparent">
        <div>
          <h1 className="text-[5vw] font-black leading-[0.85] italic tracking-tighter mb-4">
            {CAR_DATA[currentModel].fullName}
          </h1>
          <p className="text-[#FFD300] text-[1.2vw] font-archivo mb-8 tracking-[0.3em]">
            {CAR_DATA[currentModel].year}
          </p>
          <p className="text-[1.1vw] leading-relaxed opacity-70 font-light max-w-[25vw]">
            {CAR_DATA[currentModel].description}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {Object.keys(CAR_DATA).map((key) => (
            <button
              key={key}
              onClick={() => setCurrentModel(key as keyof typeof CAR_DATA)}
              className={`text-left text-[1.5vw] font-black italic transition-all ${currentModel === key ? 'text-[#FFD300] translate-x-4' : 'text-white/20 hover:text-white'}`}
            >
              {key}
            </button>
          ))}
        </div>
      </section>

      {/* 中間 3D 畫布 */}
      <section className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[5, 2, 8]} fov={35} />
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />
          <Suspense fallback={null}>
            <FerrariModel
              modelPath={CAR_DATA[currentModel].modelPath}
              color={selectedColor.hex}
              bodyParts={CAR_DATA[currentModel].bodyParts}
              scale={CAR_DATA[currentModel].fixedScale}
            />
            <Environment preset="city" />
          </Suspense>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#050505" />
          </mesh>
        </Canvas>
      </section>

      {/* 右側控制面板 */}
      <aside className="w-[20vw] border-l border-white/5 p-12 flex flex-col gap-12 z-10 bg-black/40 backdrop-blur-sm">
        <div className="space-y-3">
          <h3 className="text-[0.65vw] tracking-[0.4em] opacity-40 uppercase">Technical Data</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(CAR_DATA[currentModel].specs).map(([k, v]) => (
              <div key={k} className="border-b border-[#FFD300]/10 pb-1">
                <p className="text-[0.6vw] opacity-40 uppercase">{k}</p>
                <p className="text-[1.6vw]">{v as string}</p>
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
              />
            ))}
          </div>
        </div>

        <div className="flex-grow" />
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="w-full py-5 bg-[#FFD300] text-black text-[0.9vw] font-black tracking-[1em] hover:bg-white transition-all uppercase"
        >
          Register to Inquire
        </button>
      </aside>

      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </main>
  );
}