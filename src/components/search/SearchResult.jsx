import { MapPin } from 'lucide-react';

export default function SearchResult({ result, onSelect, isHighlighted }) {
  const { name, admin1, admin2 } = result;
  const subtitle = [admin1, admin2].filter(Boolean).join(', ');

  return (
    <button
      onClick={() => onSelect(result)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150
        ${isHighlighted ? 'bg-white/20' : 'hover:bg-white/10'}
        border-b border-white/5 last:border-0
      `}
    >
      <MapPin size={14} className="text-white/50 shrink-0" />
      <div>
        <div className="text-white font-medium text-sm">{name}</div>
        {subtitle && (
          <div className="text-white/50 text-xs">{subtitle}</div>
        )}
      </div>
    </button>
  );
}
