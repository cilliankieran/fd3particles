'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { LogoData, LogoParticlesConfig } from '@/types/logo';
import { loadLogoFromPNGConfig } from '../utils/logoLoader';

interface LogoParticlesSceneProps {
  config: LogoParticlesConfig;
}

// Simple particle system using native Three.js
function SimpleParticleSystem({ logos, config }: { logos: LogoData[]; config: LogoParticlesConfig }) {
  const pointsRef = useRef<THREE.Points>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const phasesRef = useRef<Float32Array | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const displacementsRef = useRef<Float32Array | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const mousePrevRef = useRef<{ x: number; y: number } | null>(null);
  const mouseVelRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initProgress, setInitProgress] = useState(0); // 0 to 1 for init animation

  // Initialization animation
  useEffect(() => {
    setInitProgress(0);
    let start: number | null = null;
    let raf: number;
    function animateInit(ts: number) {
      if (start === null) start = ts;
      const elapsed = (ts - start) / 1000;
      // Configurable animation duration
      const progress = Math.min(1, elapsed / (config.initAnimationDuration ?? 6.0));
      
      // Elastic easing function for natural bouncing motion
      const elasticEase = (t: number) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
      };
      
      const elasticProgress = elasticEase(progress);
      setInitProgress(elasticProgress);
      if (progress < 1) raf = requestAnimationFrame(animateInit);
    }
    raf = requestAnimationFrame(animateInit);
    return () => cancelAnimationFrame(raf);
  }, [logos, config.initAnimationDuration]);

  // Mouse event handler
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse((prev) => {
        if (prev) {
          mouseVelRef.current = { x: x - prev.x, y: y - prev.y };
        }
        return { x, y };
      });
      mousePrevRef.current = { x, y };
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Create geometry and material only once
  const { geometry, material, particleCount } = useMemo(() => {
    const allPositions: number[] = [];
    logos.forEach((logo) => {
      if (logo.particlePositions && Array.isArray(logo.particlePositions)) {
        logo.particlePositions.forEach((pos) => {
          let x: number, y: number, z: number;
          if (Array.isArray(pos) && pos.length >= 3) {
            [x, y, z] = pos;
          } else if (pos && typeof pos === 'object' && 'x' in pos && 'y' in pos && 'z' in pos) {
            x = (pos as any).x;
            y = (pos as any).y;
            z = (pos as any).z;
          } else {
            return;
          }
          if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number' &&
              !isNaN(x) && !isNaN(y) && !isNaN(z)) {
            allPositions.push(x * (config.logoScale ?? 1), y * (config.logoScale ?? 1), z * (config.logoScale ?? 1));
          }
        });
      }
    });
    if (allPositions.length === 0) {
      allPositions.push(0, 0, 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3));
    
    // Parse color and opacity
    let color = 0xffffff;
    let opacity = 1.0;
    if (config.particleColor) {
      const match = config.particleColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        color = (parseInt(match[1]) << 16) | (parseInt(match[2]) << 8) | parseInt(match[3]);
        if (match[4]) opacity = parseFloat(match[4]);
      } else if (config.particleColor.startsWith('#')) {
        color = parseInt(config.particleColor.replace('#', ''), 16);
      }
    }
    const material = new THREE.PointsMaterial({
      color,
      size: 1.5,
      sizeAttenuation: false,
      transparent: opacity < 1.0,
      opacity,
      depthWrite: false,
    });
    return { geometry, material, particleCount: allPositions.length / 3 };
  }, [logos, config.logoScale, config.particleColor]);

  // Store original positions, random phases, and velocities for each particle
  useEffect(() => {
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    originalPositionsRef.current = new Float32Array(posAttr.array);
    const phases = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count * 3; i++) {
      phases[i] = Math.random() * Math.PI * 2;
    }
    phasesRef.current = phases;
    velocitiesRef.current = new Float32Array(posAttr.count * 3);
    displacementsRef.current = new Float32Array(posAttr.count * 3);
  }, [geometry]);

  // Animate particles with gentle random motion, mouse interaction, and init animation
  useFrame(({ clock, camera }) => {
    const points = pointsRef.current;
    if (!points) return;
    const posAttr = points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const original = originalPositionsRef.current;
    const phases = phasesRef.current;
    const velocities = velocitiesRef.current;
    const displacements = displacementsRef.current;
    if (!original || !phases || !velocities || !displacements) return;
    
    const t = clock.getElapsedTime();

    let mouse3D: THREE.Vector3 | null = null;
    let mouseVel3D: THREE.Vector3 | null = null;
    if (mouse) {
      const vec = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      vec.unproject(camera);
      const camPos = camera.position;
      const dir = vec.clone().sub(camPos).normalize();
      const distance = -camPos.z / dir.z;
      mouse3D = camPos.clone().add(dir.multiplyScalar(distance));
      const velNDC = mouseVelRef.current;
      const velVec = new THREE.Vector3(mouse.x + velNDC.x, mouse.y + velNDC.y, 0.5);
      velVec.unproject(camera);
      const velDir = velVec.clone().sub(vec).normalize();
      mouseVel3D = velDir;
    }

    for (let i = 0; i < posAttr.count; i++) {
      const ox = original[i * 3];
      const oy = original[i * 3 + 1];
      const oz = original[i * 3 + 2];
      
      // Natural elastic wave animation with bouncing motion
      const initOffset = (1 - initProgress) * (config.initAnimationAmplitude ?? 2.5) * (Math.random() - 0.5);
      const fade = Math.min(1, Math.max(0, initProgress));
      
      // Wave motion based on particle position for natural flow
      const wavePhase = ox * (config.initAnimationWaveFrequency ?? 0.8) + oy * (config.initAnimationWaveFrequency ?? 0.8);
      const waveAmplitude = (1 - initProgress) * (config.initAnimationWaveAmplitude ?? 1.2);
      const waveOffset = waveAmplitude * Math.sin(wavePhase + initProgress * Math.PI * 2);
      
      // Gentle random motion
      const amp = config.randomMotionAmplitude ?? 0.04;
      const speed = config.randomMotionSpeed ?? 1.0;
      const rx = amp * Math.sin(t * 0.7 * speed + phases[i * 3]);
      const ry = amp * Math.cos(t * 0.9 * speed + phases[i * 3 + 1]);
      const rz = amp * Math.sin(t * 0.5 * speed + phases[i * 3 + 2]);
      // Displacement (for inertia)
      let dx = displacements[i * 3] || 0;
      let dy = displacements[i * 3 + 1] || 0;
      let dz = displacements[i * 3 + 2] || 0;
      // Mouse force
      if (mouse3D && mouseVel3D) {
        const px = ox + rx + dx;
        const py = oy + ry + dy;
        const pz = oz + rz + dz;
        const dist = Math.sqrt(
          (mouse3D.x - px) ** 2 +
          (mouse3D.y - py) ** 2 +
          (mouse3D.z - pz) ** 2
        );
        const influenceRadius = 0.425;
        if (dist < influenceRadius) {
          const strength = 0.19 * (1 - dist / influenceRadius);
          dx += mouseVel3D.x * strength;
          dy += mouseVel3D.y * strength;
          dz += mouseVel3D.z * strength;
        }
      }
      // Velocity-based elastic return (spring acts on displacement)
      const idx = i * 3;
      let vx = velocities[idx] || 0;
      let vy = velocities[idx + 1] || 0;
      let vz = velocities[idx + 2] || 0;
      const spring = 0.045;
      const damping = 0.91;
      vx += -dx * spring;
      vy += -dy * spring;
      vz += -dz * spring;
      vx *= damping;
      vy *= damping;
      vz *= damping;
      dx += vx;
      dy += vy;
      dz += vz;
      velocities[idx] = vx;
      velocities[idx + 1] = vy;
      velocities[idx + 2] = vz;
      displacements[idx] = dx;
      displacements[idx + 1] = dy;
      displacements[idx + 2] = dz;
      // Apply all effects: scale, random, mouse, init with natural elastic wave
      posAttr.setXYZ(i, 
        ox + rx + dx + initOffset * (1 - fade) + waveOffset, 
        oy + ry + dy + initOffset * (1 - fade) + waveOffset, 
        oz + rz + dz + initOffset * (1 - fade) + waveOffset
      );
    }
    posAttr.needsUpdate = true;
    // Animate opacity for fade-in
    if (points && points.material) {
      (points.material as THREE.PointsMaterial).opacity = Math.min(1, Math.max(0, initProgress)) * ((config.particleColor?.includes('rgba') && parseFloat(config.particleColor.split(',')[3]) > 0) ? parseFloat(config.particleColor.split(',')[3]) : 1);
    }
  });

  return <primitive object={new THREE.Points(geometry, material)} ref={pointsRef} />;
}

interface SceneProps {
  logo: LogoData;
  config: LogoParticlesConfig;
}

function Scene({ logo, config }: SceneProps) {
  const { camera } = useThree();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize camera position and set background color
  useEffect(() => {
    if (!isInitialized) {
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      setIsInitialized(true);
    }
  }, [camera, isInitialized]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <SimpleParticleSystem logos={[logo]} config={config} />
    </>
  );
}

export function LogoParticlesScene({ config }: LogoParticlesSceneProps) {
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadLogoFromPNGConfig(config).then((result: { success: boolean; data?: LogoData; error?: string }) => {
      if (result.success && result.data) {
        setLogoData(result.data);
      } else {
        setLogoData(null);
        console.error('[LogoParticlesScene] Failed to load logo:', result.error);
      }
      setLoading(false);
    });
  }, [config.logoPath, config.particleCount, config.logoScale]);

  if (loading || !logoData) {
    if (!loading && !logoData) {
      console.error('[LogoParticlesScene] No logoData after loading!');
    }
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <Suspense fallback={null}>
          <Scene 
            logo={logoData} 
            config={config}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 