import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import { useSkiWeather } from '../../hooks/useSkiWeather';
import { useWeatherAlerts } from '../../hooks/useWeatherAlerts';
import SkiResortDropdown from './SkiResortDropdown';
import Ski3DayForecast from './Ski3DayForecast';
import SkiConditionsPanel from './SkiConditionsPanel';
import SkiPrecipChart from './SkiPrecipChart';
import SkiMap from './SkiMap';
import SkiDining from './SkiDining';
import WeatherAlerts from '../alerts/WeatherAlerts';

export default function SkiingConditions() {
  const { t, i18n } = useTranslation();
  const { state } = useWeather();
  const { selectedCity } = state;
  const [resort, setResort]           = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { data, isLoading, error }    = useSkiWeather(resort);
  const { alerts, isLoading: alertsLoading } = useWeatherAlerts(
    resort ? { latitude: resort.latitude, longitude: resort.longitude } : null,
    i18n.language,
  );

  const handleGoogleLoaded = useCallback(() => setGoogleLoaded(true), []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mb-6"
    >
      {/* Section header */}
      <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>⛷️</span> {t('sections.skiingConditions')}
      </h2>

      {/* Resort picker */}
      <div className="mb-4">
        <SkiResortDropdown selected={resort} onSelect={setResort} cityLocation={selectedCity} />
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="ski-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-10 text-white/50"
          >
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">{t('ski.loading')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            key="ski-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-4 text-white/50 text-sm text-center"
          >
            {t('ski.errorPrefix')} {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {data && !isLoading && resort && (
          <motion.div
            key={resort.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
          >
            <WeatherAlerts alerts={alerts} isLoading={alertsLoading} />
            <Ski3DayForecast dailyForecast={data.dailyForecast} />
            <SkiConditionsPanel data={data} resort={resort} />
            <SkiPrecipChart precipChart={data.precipChart} />
            <SkiMap resort={resort} onGoogleLoaded={handleGoogleLoaded} />
            <SkiDining resort={resort} isGoogleLoaded={googleLoaded} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!resort && !isLoading && (
        <div className="glass-card p-6 text-center text-white/30 text-sm">
          {t('ski.emptyState')}
        </div>
      )}
    </motion.section>
  );
}
