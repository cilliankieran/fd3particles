'use client';

import { LogoParticlesScene } from '@/components/LogoParticlesScene';
import { defaultLogoParticlesConfig } from '@/data/sampleLogos';

export default function Home() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#2B2E35',
      margin: 0,
      padding: 0
    }}>
      <LogoParticlesScene config={defaultLogoParticlesConfig} />
    </div>
  );
}
