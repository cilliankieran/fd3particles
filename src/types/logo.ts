import * as THREE from 'three';

export interface LogoData {
  id: string;
  name: string;
  url: string;
  type: 'svg' | 'png';
  width: number;
  height: number;
  particlePositions: THREE.Vector3[];
  originalPath?: string; // For SVG logos
}

export interface LogoParticlesConfig {
  // Particle system configuration
  particleCount: number; // Number of particles to generate from the logo (higher = more detailed)
  randomMotionAmplitude: number; // How much particles move randomly (0.01-0.1 for subtle, 0.1+ for more movement)
  randomMotionSpeed: number; // Speed of random particle motion (0.5-2.0, higher = faster)
  logoScale: number; // Scale factor for the logo size (0.5-3.0, 1.0 = original size)
  
  // Visual appearance
  backgroundColor: string; // Background color of the page (hex, rgb, or named color)
  particleColor: string; // Color of particles (rgba or hex with alpha for transparency)
  logoPath: string; // Path to the PNG logo file (e.g., '/logos/logo.png')
  
  // Initialization animation configuration
  initAnimationDuration: number; // Duration of the initial bounce-in animation in seconds (2.0-10.0)
  initAnimationAmplitude: number; // How far particles move during initialization (1.0-5.0, higher = more dramatic)
  initAnimationWaveAmplitude: number; // Intensity of wave motion during init (0.5-3.0, higher = more wavey)
  initAnimationWaveFrequency: number; // Frequency of wave pattern (0.3-2.0, higher = tighter waves)
} 