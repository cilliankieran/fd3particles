import { LogoParticlesConfig } from '@/types/logo';

export const defaultLogoParticlesConfig: LogoParticlesConfig = {
  // Particle system configuration
  particleCount: 4160, // High particle count for detailed logo representation
  randomMotionAmplitude: 0.04, // Subtle random motion for gentle floating effect
  randomMotionSpeed: 1.0, // Standard speed for natural-looking motion
  logoScale: 1.0, // Original logo size
  
  // Visual appearance
  backgroundColor: '#2B2E35', // Dark gray background for good contrast
  particleColor: 'rgba(250,250,250,0.75)', // Semi-transparent white particles
  logoPath: '/logos/nyt2.png', // Path to the New York Times logo
  
  // Initialization animation configuration
  initAnimationDuration: 6.0, // 6-second duration for gradual, elegant entrance
  initAnimationAmplitude: 2.5, // Moderate amplitude for visible but not overwhelming bounce
  initAnimationWaveAmplitude: 1.2, // Gentle wave motion for organic flow
  initAnimationWaveFrequency: 0.8, // Balanced wave frequency for natural-looking patterns
}; 