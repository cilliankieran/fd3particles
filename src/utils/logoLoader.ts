import { LogoData, LogoParticlesConfig } from '@/types/logo';
import { convertPNGToParticles } from './pngProcessor';

/**
 * Load logo from PNG file and convert to particle data using config
 */
export async function loadLogoFromPNGConfig(
  config: LogoParticlesConfig
): Promise<{ success: boolean; data?: LogoData; error?: string }> {
  try {
    const filePath = config.logoPath;
    const logoName = filePath.split('/').pop()?.split('.')[0] || 'Logo';
    // Convert PNG to particle positions
    const particlePositions = await convertPNGToParticles(filePath, config);
    if (particlePositions.length === 0) {
      return {
        success: false,
        error: 'No particles generated from PNG'
      };
    }
    const logoData: LogoData = {
      id: logoName.toLowerCase().replace(/\s+/g, '-'),
      name: logoName,
      url: filePath,
      type: 'png',
      width: 200, // Default size
      height: 200,
      particlePositions: particlePositions,
      originalPath: filePath
    };
    return {
      success: true,
      data: logoData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 