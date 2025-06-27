import * as THREE from 'three';
import { LogoParticlesConfig } from '@/types/logo';

interface PixelData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

interface ParticlePosition {
  x: number;
  y: number;
  z: number;
}

export class PNGProcessor {
  /**
   * Load PNG image and convert to particle positions using a uniform grid
   */
  async loadPNGToParticles(
    filePath: string, 
    particleCount: number = 500,
    threshold: number = 128,
    logoScale: number = 1.0
  ): Promise<THREE.Vector3[]> {
    try {
      // Load the image
      const image = await this.loadImage(filePath);
      const pixelData = await this.getPixelData(image);
      
      // Use a uniform grid for sampling
      const particles = this.gridSampleParticles(pixelData, particleCount, threshold, logoScale);
      return particles;
    } catch (error) {
      console.error('[PNGProcessor] Error processing PNG:', error);
      return [];
    }
  }

  /**
   * Load image from file path
   */
  private loadImage(filePath: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${filePath}`));
      
      img.src = filePath;
    });
  }

  /**
   * Get pixel data from image
   */
  private getPixelData(image: HTMLImageElement): Promise<PixelData> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.drawImage(image, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      resolve({
        width: imageData.width,
        height: imageData.height,
        data: imageData.data
      });
    });
  }

  /**
   * Uniform grid sampling for particles
   */
  private gridSampleParticles(
    pixelData: PixelData,
    particleCount: number,
    threshold: number,
    logoScale: number = 1.0
  ): THREE.Vector3[] {
    const { width, height, data } = pixelData;
    const aspect = width / height;
    // Calculate grid step size
    const totalPixels = width * height;
    const gridStep = Math.max(1, Math.floor(Math.sqrt(totalPixels / particleCount)));
    const particles: ParticlePosition[] = [];

    for (let y = 0; y < height; y += gridStep) {
      for (let x = 0; x < width; x += gridStep) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;
        if (brightness < threshold) {
          particles.push({ x, y, z: 0 });
        }
      }
    }

    // Normalize to 3D space (-2 to 2)
    const bounds = this.calculateBounds(particles);
    const normalized = this.normalizePixels(particles, bounds, width, height, logoScale);
    return normalized.map(p => new THREE.Vector3(p.x, -p.y, p.z));
  }

  /**
   * Calculate bounds of pixel positions
   */
  private calculateBounds(pixels: ParticlePosition[]): { minX: number; minY: number; maxX: number; maxY: number } {
    if (pixels.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = pixels[0].x;
    let minY = pixels[0].y;
    let maxX = pixels[0].x;
    let maxY = pixels[0].y;

    for (const pixel of pixels) {
      minX = Math.min(minX, pixel.x);
      minY = Math.min(minY, pixel.y);
      maxX = Math.max(maxX, pixel.x);
      maxY = Math.max(maxY, pixel.y);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * Normalize pixels to fit in 3D space (-2 to 2)
   */
  private normalizePixels(
    pixels: ParticlePosition[], 
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    imageWidth: number,
    imageHeight: number,
    logoScale: number = 1.0
  ): ParticlePosition[] {
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    
    if (width === 0 || height === 0) {
      // If bounds are zero, use image dimensions
      const scaleX = 4 / imageWidth * logoScale;
      const scaleY = 4 / imageHeight * logoScale;
      
      return pixels.map(pixel => ({
        x: (pixel.x - imageWidth / 2) * scaleX,
        y: (pixel.y - imageHeight / 2) * scaleY,
        z: 0
      }));
    }
    
    const scale = Math.min(4 / width, 4 / height, 1) * logoScale;
    
    return pixels.map(pixel => ({
      x: (pixel.x - bounds.minX - width / 2) * scale,
      y: (pixel.y - bounds.minY - height / 2) * scale,
      z: 0
    }));
  }
}

/**
 * Convert PNG logo to particle positions
 */
export async function convertPNGToParticles(
  filePath: string,
  config: LogoParticlesConfig
): Promise<THREE.Vector3[]> {
  const processor = new PNGProcessor();
  return processor.loadPNGToParticles(filePath, config.particleCount, 128, config.logoScale);
} 