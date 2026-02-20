import { useMemo } from 'react';
import { getParticleConfig } from '../../utils/weatherTheme';

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export default function ParticleCanvas({ particle }) {
  const config = getParticleConfig(particle);

  const particles = useMemo(() => {
    if (config.type === 'none' || config.count === 0) return [];
    return Array.from({ length: config.count }, (_, i) => ({
      id: i,
      left: getRandom(0, 100),
      delay: getRandom(0, config.speed * 3),
      duration: getRandom(config.speed * 0.7, config.speed * 1.4),
      size: config.type === 'rain'
        ? getRandom(1, 2)
        : config.type === 'snow'
          ? getRandom(3, 8)
          : getRandom(2, 5),
      opacity: getRandom(0.3, 0.8),
    }));
  }, [config]);

  if (config.type === 'none') return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-10"
      aria-hidden="true"
    >
      {config.type === 'rain' || config.type === 'storm' ? (
        particles.map(p => (
          <div
            key={p.id}
            className="absolute top-0 rounded-full"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 8}px`,
              opacity: p.opacity,
              background: 'linear-gradient(to bottom, transparent, rgba(174,214,241,0.8))',
              animation: `rainFall ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))
      ) : config.type === 'snow' ? (
        particles.map(p => (
          <div
            key={p.id}
            className="absolute top-0 rounded-full bg-white"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `snowFall ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))
      ) : config.type === 'sun' ? (
        // Sun rays radiating from top-right
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute top-0 right-0 origin-top-right"
              style={{
                width: `${p.size}px`,
                height: '40vh',
                opacity: p.opacity,
                background: 'linear-gradient(to bottom, rgba(253,203,110,0.6), transparent)',
                transform: `rotate(${p.left * 1.8}deg)`,
                animation: `sunRay ${p.duration}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
