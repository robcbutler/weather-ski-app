import { useWeather } from '../../context/WeatherContext';

const SIZES = [
  { key: 'small',  label: 'S' },
  { key: 'medium', label: 'M' },
  { key: 'large',  label: 'L' },
];

export default function FontSizeToggle() {
  const { state, setFontSize } = useWeather();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-1 glass-card px-2 py-1">
      {SIZES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setFontSize(key)}
          className={`
            w-7 h-7 rounded text-xs font-bold transition-all duration-200
            ${state.fontSize === key
              ? 'bg-white/30 text-white scale-110'
              : 'text-white/60 hover:text-white/90 hover:bg-white/10'
            }
          `}
          title={`Font size: ${key}`}
          aria-label={`Set font size to ${key}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
