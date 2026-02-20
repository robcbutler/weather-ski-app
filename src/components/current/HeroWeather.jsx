import { motion } from 'framer-motion';
import { Wind, Droplets, Thermometer, Sunrise, Sunset, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import { getWeatherInfo } from '../../utils/wmoWeatherCodes';
import { getTempStyle } from '../../utils/temperatureUtils';
import { formatTime, degreesToCompass } from '../../utils/dateUtils';

export default function HeroWeather() {
  const { t, i18n } = useTranslation();
  const { state } = useWeather();
  const { currentWeather, selectedCity, sunrise, sunset, timeOfDay } = state;

  if (!currentWeather) return null;

  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';
  const { temp, feelsLike, weatherCode, label, windSpeed, windDir, humidity } = currentWeather;
  const isNight = timeOfDay === 'night';
  const { icon } = getWeatherInfo(weatherCode, isNight);
  const weatherLabel = t(`wmo.${weatherCode}`, { defaultValue: label });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-6 md:p-8 mb-6"
    >
      {/* City name */}
      <div className="text-white/70 text-sm font-medium mb-1 tracking-wide uppercase">
        {selectedCity?.name}
        {selectedCity?.admin1 && <span className="ml-1 opacity-60">· {selectedCity.admin1}</span>}
      </div>

      {/* Main temp + icon */}
      <div className="flex items-start justify-between">
        <div>
          <div
            className="text-6xl sm:text-8xl md:text-9xl font-thin leading-none tracking-tighter"
            style={getTempStyle(temp)}
          >
            {temp}°
          </div>
          <div className="text-white/60 text-lg mt-1">{weatherLabel}</div>
          <div className="text-white/40 text-sm mt-0.5">
            {t('hero.feelsLike')} <span style={getTempStyle(feelsLike)}>{feelsLike}°C</span>
          </div>
        </div>
        <div className="text-5xl sm:text-7xl md:text-8xl select-none" role="img" aria-label={weatherLabel}>
          {icon}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat
          icon={<Wind size={16} />}
          label={t('hero.wind')}
          value={`${windSpeed} km/h ${degreesToCompass(windDir)}`}
        />
        <Stat
          icon={<Droplets size={16} />}
          label={t('hero.humidity')}
          value={`${humidity}%`}
        />
        {sunrise && (
          <Stat
            icon={<Sunrise size={16} />}
            label={t('hero.sunrise')}
            value={formatTime(sunrise, locale)}
          />
        )}
        {sunset && (
          <Stat
            icon={<Sunset size={16} />}
            label={t('hero.sunset')}
            value={formatTime(sunset, locale)}
          />
        )}
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/40">{icon}</span>
      <div>
        <div className="text-white/40 text-xs">{label}</div>
        <div className="text-white/90 text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
