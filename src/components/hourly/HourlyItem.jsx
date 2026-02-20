import { useTranslation } from 'react-i18next';
import { getWeatherInfo } from '../../utils/wmoWeatherCodes';
import { formatHour } from '../../utils/dateUtils';
import { getTempStyle } from '../../utils/temperatureUtils';

export default function HourlyItem({ item, isNow, isNight = false }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';

  const { icon } = getWeatherInfo(item.weatherCode, isNight);
  const weatherLabel = t(`wmo.${item.weatherCode}`, { defaultValue: item.label });

  return (
    <div
      className={`
        flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl
        ${isNow ? 'bg-white/20 ring-1 ring-white/30' : 'glass-card hover:bg-white/15'}
        transition-all duration-200 min-w-[68px]
      `}
    >
      <div className="text-white/50 text-xs font-medium">
        {isNow ? t('time.now') : formatHour(item.time, locale)}
      </div>
      <div className="text-2xl" role="img" aria-label={weatherLabel}>
        {icon}
      </div>
      <div className="text-sm font-semibold" style={getTempStyle(item.temp)}>
        {item.temp}°
      </div>
      {item.precipProb > 10 && (
        <div className="text-blue-300 text-xs opacity-80">{item.precipProb}%</div>
      )}
      {item.snowfall > 0 ? (
        <div className="text-blue-200/70 text-[10px]">{item.snowfall} cm</div>
      ) : item.precipitation > 0 ? (
        <div className="text-blue-200/60 text-[10px]">{item.precipitation} mm</div>
      ) : null}
    </div>
  );
}
