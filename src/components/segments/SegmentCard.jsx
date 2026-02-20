import { Wind, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getWeatherInfo } from '../../utils/wmoWeatherCodes';
import { getTempStyle } from '../../utils/temperatureUtils';

export default function SegmentCard({ segmentKey, stats }) {
  const { t } = useTranslation();

  if (!stats) return null;

  const label = t(`segments.${segmentKey}`);
  const time  = t(`segments.${segmentKey}_time`);
  const isNight = segmentKey === 'night';
  const { icon } = getWeatherInfo(stats.dominantCode, isNight);

  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white/90 text-sm font-semibold">{label}</div>
          <div className="text-white/60 text-xs">{time}</div>
        </div>
        <span className="text-2xl" role="img" aria-label={label}>{icon}</span>
      </div>

      {/* Temperature */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-light" style={getTempStyle(stats.avgTemp)}>
          {stats.avgTemp}°
        </span>
        <span className="text-white/65 text-sm">
          {stats.minTemp}° / {stats.maxTemp}°
        </span>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 text-xs text-white/70 pt-1 border-t border-white/10 flex-wrap">
        <span className="flex items-center gap-1">
          <Droplets size={12} /> {stats.avgPrecipProb}%
          {stats.totalSnowfall > 0 ? (
            <span className="text-blue-200/90 ml-1">{stats.totalSnowfall} cm</span>
          ) : stats.totalPrecip > 0 ? (
            <span className="text-white/65 ml-1">{stats.totalPrecip} mm</span>
          ) : null}
        </span>
        <span className="flex items-center gap-1">
          <Wind size={12} /> {stats.avgWindspeed} km/h
        </span>
      </div>
    </div>
  );
}
