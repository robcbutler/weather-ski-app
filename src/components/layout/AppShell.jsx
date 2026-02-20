import { useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useTimeOfDay } from '../../hooks/useTimeOfDay';
import { getThemeGradient } from '../../utils/weatherTheme';
import ParticleCanvas from './ParticleCanvas';

export default function AppShell({ children }) {
  const { state, setTimeOfDay } = useWeather();
  const { weatherCategory, weatherParticle, sunrise, sunset } = state;

  const timeOfDay = useTimeOfDay(sunrise, sunset);

  useEffect(() => {
    setTimeOfDay(timeOfDay);
  }, [timeOfDay, setTimeOfDay]);

  const gradient = getThemeGradient(weatherCategory, timeOfDay);

  return (
    <div
      className="relative transition-all duration-1000"
      style={{
        minHeight: '100dvh',
        background: gradient,
        backgroundSize: '300% 300%',
        animation: 'gradientShift 8s ease infinite',
      }}
    >
      {/* Particle overlay — suppress sun rays after dark */}
      <ParticleCanvas
        particle={(timeOfDay === 'night' || timeOfDay === 'dusk') && weatherParticle === 'sun'
          ? 'none'
          : weatherParticle}
      />

      {/* Main content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 py-8 pb-16">
        {children}
      </div>
    </div>
  );
}
