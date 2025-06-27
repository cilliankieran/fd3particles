# Logo Particles - Create Paritcle Logos from Three.js & React Three Fiber

A React component that converts PNG logos into interactive 3D particle systems using Three.js and React Three Fiber. Features include mouse interaction, elastic animations, and customizable particle behavior.

## Features

- 🎨 **PNG to Particles**: Converts PNG logos into 3D particle systems
- 🖱️ **Mouse Interaction**: Particles respond to mouse movement with elastic physics
- ✨ **Smooth Animations**: Natural elastic wave animations and random particle motion
- 🎛️ **Highly Configurable**: Extensive customization options for appearance and behavior
- 🚀 **Performance Optimized**: Efficient particle rendering with native Three.js
- 🎭 **Transparent Background**: Seamless integration with any page background

## Installation

This component requires the following dependencies:

```bash
npm install three @react-three/fiber @react-three/drei
```

## Basic Usage

### 1. Import the Component

```tsx
import { LogoParticlesScene } from '@/components/LogoParticlesScene';
import { LogoParticlesConfig } from '@/types/logo';
```

### 2. Create a Configuration

```tsx
const config: LogoParticlesConfig = {
  // Particle system configuration
  particleCount: 2000,
  randomMotionAmplitude: 0.04,
  randomMotionSpeed: 1.0,
  logoScale: 1.0,
  
  // Visual appearance
  backgroundColor: '#2B2E35',
  particleColor: 'rgba(250,250,250,0.75)',
  logoPath: '/logos/your-logo.png',
  
  // Animation configuration
  initAnimationDuration: 6.0,
  initAnimationAmplitude: 2.5,
  initAnimationWaveAmplitude: 1.2,
  initAnimationWaveFrequency: 0.8,
};
```

### 3. Use the Component

```tsx
export default function MyPage() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#2B2E35' 
    }}>
      <LogoParticlesScene config={config} />
    </div>
  );
}
```

## Configuration Options

### Particle System Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `particleCount` | `number` | `4160` | Number of particles to generate from the logo (higher = more detailed) |
| `randomMotionAmplitude` | `number` | `0.04` | How much particles move randomly (0.01-0.1 for subtle, 0.1+ for more movement) |
| `randomMotionSpeed` | `number` | `1.0` | Speed of random particle motion (0.5-2.0, higher = faster) |
| `logoScale` | `number` | `1.0` | Scale factor for the logo size (0.5-3.0, 1.0 = original size) |

### Visual Appearance

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `backgroundColor` | `string` | `'#2B2E35'` | Background color of the page (hex, rgb, or named color) |
| `particleColor` | `string` | `'rgba(250,250,250,0.75)'` | Color of particles (rgba or hex with alpha for transparency) |
| `logoPath` | `string` | `'/logos/nyt2.png'` | Path to the PNG logo file |

### Animation Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `initAnimationDuration` | `number` | `6.0` | Duration of the initial bounce-in animation in seconds (2.0-10.0) |
| `initAnimationAmplitude` | `number` | `2.5` | How far particles move during initialization (1.0-5.0, higher = more dramatic) |
| `initAnimationWaveAmplitude` | `number` | `1.2` | Intensity of wave motion during init (0.5-3.0, higher = more wavey) |
| `initAnimationWaveFrequency` | `number` | `0.8` | Frequency of wave pattern (0.3-2.0, higher = tighter waves) |

## Logo Management

### Adding New Logos

1. **Place your PNG file** in the `public/logos/` directory
2. **Update the configuration** with the new logo path:

```tsx
const config: LogoParticlesConfig = {
  // ... other config options
  logoPath: '/logos/your-new-logo.png',
};
```

### Logo Requirements

- **Format**: PNG files only (SVG support removed for performance)
- **Recommended**: High contrast black and white logos work best
- **Size**: Any size, but larger logos (200px+) provide better detail
- **Transparency**: Supported, but solid logos work best for particle generation

### Changing Logos Dynamically

To change logos dynamically, update the config and pass it to the component:

```tsx
import { useState } from 'react';
import { LogoParticlesScene } from '@/components/LogoParticlesScene';
import { LogoParticlesConfig } from '@/types/logo';

export default function MyPage() {
  const [currentLogo, setCurrentLogo] = useState('logo1.png');
  
  const config: LogoParticlesConfig = {
    // ... other config options
    logoPath: `/logos/${currentLogo}`,
  };
  
  const changeLogo = (newLogo: string) => {
    setCurrentLogo(newLogo);
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#2B2E35' }}>
      <LogoParticlesScene config={config} />
      <button onClick={() => changeLogo('logo2.png')}>
        Switch to Logo 2
      </button>
    </div>
  );
}
```

## Advanced Examples

### Minimal Configuration

```tsx
const minimalConfig: LogoParticlesConfig = {
  particleCount: 1000,
  randomMotionAmplitude: 0.02,
  randomMotionSpeed: 0.8,
  logoScale: 1.0,
  backgroundColor: '#000000',
  particleColor: '#ffffff',
  logoPath: '/logos/simple-logo.png',
  initAnimationDuration: 3.0,
  initAnimationAmplitude: 1.5,
  initAnimationWaveAmplitude: 0.8,
  initAnimationWaveFrequency: 0.5,
};
```

### High-Detail Configuration

```tsx
const detailedConfig: LogoParticlesConfig = {
  particleCount: 8000,
  randomMotionAmplitude: 0.06,
  randomMotionSpeed: 1.2,
  logoScale: 1.5,
  backgroundColor: '#1a1a1a',
  particleColor: 'rgba(255,255,255,0.9)',
  logoPath: '/logos/detailed-logo.png',
  initAnimationDuration: 8.0,
  initAnimationAmplitude: 3.0,
  initAnimationWaveAmplitude: 1.5,
  initAnimationWaveFrequency: 1.0,
};
```

### Transparent Background

```tsx
const transparentConfig: LogoParticlesConfig = {
  // ... other config options
  backgroundColor: 'transparent',
  particleColor: 'rgba(0,0,0,0.8)',
};
```

## Performance Considerations

- **Particle Count**: Higher counts (5000+) may impact performance on lower-end devices
- **Animation Duration**: Longer animations (8+ seconds) use more resources
- **Logo Size**: Larger logos generate more particles automatically
- **Browser Support**: Requires WebGL support

## Troubleshooting

### Logo Not Visible
- Check that the PNG file exists in `public/logos/`
- Ensure the logo has good contrast (black and white works best)
- Verify the `logoPath` in your configuration

### Performance Issues
- Reduce `particleCount` for better performance
- Lower `randomMotionAmplitude` and `randomMotionSpeed`
- Decrease `initAnimationDuration`

### Mouse Interaction Not Working
- Ensure the component has proper dimensions
- Check that the page background color matches your config
- Verify WebGL is supported in your browser

## File Structure

```
src/
├── components/
│   └── LogoParticlesScene.tsx    # Main component
├── types/
│   └── logo.ts                   # TypeScript interfaces
├── utils/
│   ├── logoLoader.ts             # Logo loading utilities
│   └── pngProcessor.ts           # PNG to particle conversion
└── data/
    └── sampleLogos.ts            # Default configuration

public/
└── logos/                        # Place your PNG logos here
    ├── nyt2.png
    └── your-logo.png
```

## License

This component is part of a larger project. Please check the project's license for usage terms.
