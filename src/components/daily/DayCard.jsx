import { Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatRelativeDay } from '../../utils/dateUtils';
import { getTempStyle } from '../../utils/temperatureUtils';

export default function DayCard({ day, isToday, timeZone }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';
  const weatherLabel = t(`wmo.${day.weatherCode}`, { defaultValue: day.label });

  return (
    <div
      className={`
        flex items-center gap-4 px-4 py-3.5 rounded-xl
        ${isToday ? 'bg-white/15 ring-1 ring-white/20' : 'glass-card hover:bg-white/12'}
        transition-all duration-200
      `}
    >
      {/* Day label */}
      <div className="w-24 shrink-0">
        <div className="text-white/90 text-sm font-semibold">
          {formatRelativeDay(day.date, t, locale, timeZone)}
        </div>
        {(day.precipProbMax > 10 || day.snowfallSum > 0 || day.precipSum > 0) && (
          <div className="flex items-center gap-1 text-blue-300 text-xs mt-0.5 flex-wrap">
            {day.precipProbMax > 10 && (
              <span className="flex items-center gap-1">
                <Droplets size={10} /> {day.precipProbMax}%
              </span>
            )}
            {day.snowfallSum > 0 ? (
              <span className="text-blue-200/90">{day.snowfallSum} cm</span>
            ) : day.precipSum > 0 ? (
              <span className="text-white/65">{day.precipSum} mm</span>
            ) : null}
          </div>
        )}
      </div>

      {/* Icon */}
      <span className="text-2xl shrink-0" role="img" aria-label={weatherLabel}>
        {day.icon}
      </span>

      {/* Condition label */}
      <div className="flex-1 text-white/70 text-xs hidden sm:block">
        {weatherLabel}
      </div>

      {/* Temp range */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <span className="text-sm font-medium" style={getTempStyle(day.tempMin)}>
          {day.tempMin}°
        </span>
        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(to right, #74b9ff, #fdcb6e)',
              width: '100%',
            }}
          />
        </div>
        <span className="text-sm font-semibold" style={getTempStyle(day.tempMax)}>
          {day.tempMax}°
        </span>
      </div>
    </div>
  );
}
