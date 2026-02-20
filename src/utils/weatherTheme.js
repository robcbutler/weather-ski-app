/**
 * Maps { category, timeOfDay } → { gradient CSS string, particleConfig }
 * timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
 * category: 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'
 */

export const GRADIENTS = {
  clear: {
    dawn:  'linear-gradient(135deg, #0a0e27 0%, #1a237e 30%, #f57c00 65%, #e91e63 100%)',
    day:   'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #00838f 100%)',
    dusk:  'linear-gradient(135deg, #4a148c 0%, #880e4f 40%, #f57f17 80%, #e65100 100%)',
    night: 'linear-gradient(135deg, #020b18 0%, #051330 50%, #0a1628 100%)',
  },
  cloudy: {
    dawn:  'linear-gradient(135deg, #263238 0%, #455a64 50%, #78909c 100%)',
    day:   'linear-gradient(135deg, #37474f 0%, #546e7a 50%, #78909c 100%)',
    dusk:  'linear-gradient(135deg, #1a237e 0%, #37474f 50%, #4a4a6a 100%)',
    night: 'linear-gradient(135deg, #0d0d1a 0%, #1c1c2e 50%, #263238 100%)',
  },
  fog: {
    dawn:  'linear-gradient(135deg, #424242 0%, #616161 50%, #9e9e9e 100%)',
    day:   'linear-gradient(135deg, #546e7a 0%, #78909c 50%, #b0bec5 100%)',
    dusk:  'linear-gradient(135deg, #37474f 0%, #546e7a 50%, #607d8b 100%)',
    night: 'linear-gradient(135deg, #212121 0%, #37474f 50%, #455a64 100%)',
  },
  rain: {
    dawn:  'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
    day:   'linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #00695c 100%)',
    dusk:  'linear-gradient(135deg, #1a237e 0%, #1b5e20 50%, #2e7d32 100%)',
    night: 'linear-gradient(135deg, #0d1f0d 0%, #1b2e1b 50%, #1b5e20 100%)',
  },
  snow: {
    dawn:  'linear-gradient(135deg, #1565c0 0%, #42a5f5 50%, #e3f2fd 100%)',
    day:   'linear-gradient(135deg, #0d47a1 0%, #64b5f6 50%, #e1f5fe 100%)',
    dusk:  'linear-gradient(135deg, #283593 0%, #1565c0 50%, #42a5f5 100%)',
    night: 'linear-gradient(135deg, #0a1929 0%, #0d2137 50%, #1a3a5c 100%)',
  },
  storm: {
    dawn:  'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    day:   'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 40%, #0f3460 100%)',
    dusk:  'linear-gradient(135deg, #0a0a0a 0%, #16213e 50%, #0f3460 100%)',
    night: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #0d0d1a 100%)',
  },
};

export function getThemeGradient(category, timeOfDay) {
  const cat = GRADIENTS[category] ?? GRADIENTS.clear;
  return cat[timeOfDay] ?? cat.day;
}

/**
 * Particle configuration per type
 * count: number of particles
 * speed: animation duration base (seconds)
 */
export const PARTICLE_CONFIGS = {
  none:  { type: 'none',  count: 0,   speed: 0   },
  sun:   { type: 'sun',   count: 8,   speed: 4   },
  rain:  { type: 'rain',  count: 60,  speed: 0.8 },
  snow:  { type: 'snow',  count: 40,  speed: 4   },
  storm: { type: 'storm', count: 80,  speed: 0.4 },
};

export function getParticleConfig(particle) {
  return PARTICLE_CONFIGS[particle] ?? PARTICLE_CONFIGS.none;
}
