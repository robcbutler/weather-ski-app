import { Wind, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getWeatherInfo } from '../../utils/wmoWeatherCodes';
import { getTempStyle } from '../../utils/temperatureUtils';

export default function SegmentCard({ segmentKey, stats, dayLabel }) {
  const { t } = useTranslation();

  if (!stats) return null;

  const label   = t(`segments.${segmentKey}`);
  const time    = t(`segments.${segmentKey}_time`);
  const isNight = segmentKey === 'night';
  const { icon } = getWeatherInfo(stats.dominantCode, isNight);

  // Precip detail — always rendered so card height is consistent
  let precipDetail;
  if (stats.totalSnowfall > 0) {
    precipDetail = <span className="text-blue-200/90">{stats.totalSnowfall} cm</span>;
  } else if (stats.totalPrecip > 0) {
    precipDetail = <span>{stats.totalPrecip} mm</span>;
  } else {
    precipDetail = <span className="text-white/25">—</span>;
  }

  return (
    <div className="glass-card p-4 flex flex-col h-full">
      {/* Day label */}
      <div className="text-white/35 text-[10px] font-semibold uppercase tracking-wider mb-2">
        {dayLabel}
      </div>

      {/* Segment name + icon */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-white/90 text-sm font-semibold">{label}</div>
          <div className="text-white/60 text-xs">{time}</div>
        </div>
        <span className="text-2xl" role="img" aria-label={label}>{icon}</span>
      </div>

      {/* Temperature — flex-1 so all cards push the detail row to the bottom */}
      <div className="flex items-baseline gap-1 flex-1">
        <span className="text-3xl font-light" style={getTempStyle(stats.avgTemp)}>
          {stats.avgTemp}°
        </span>
        <span className="text-white/65 text-sm">
          {stats.minTemp}° / {stats.maxTemp}°
        </span>
      </div>

      {/* Detail row — fixed 3-column layout, no wrapping */}
      <div className="flex items-center justify-between text-xs text-white/70 pt-2 mt-2 border-t border-white/10">
        <span className="flex items-center gap-1">
          <Droplets size={12} /> {stats.avgPrecipProb}%
        </span>
        <span>{precipDetail}</span>
        <span className="flex items-center gap-1">
          <Wind size={12} /> {stats.avgWindspeed}
        </span>
      </div>
    </div>
  );
}
