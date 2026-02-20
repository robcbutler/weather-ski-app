import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { useWeatherData } from './hooks/useWeatherData';
import { useGeolocation } from './hooks/useGeolocation';
import AppShell from './components/layout/AppShell';
import LanguageToggle from './components/layout/LanguageToggle';
import CitySearch from './components/search/CitySearch';
import HeroWeather from './components/current/HeroWeather';
import DaySegments from './components/segments/DaySegments';
import HourlyForecast from './components/hourly/HourlyForecast';
import DailyForecast from './components/daily/DailyForecast';
import PrecipitationChart from './components/charts/PrecipitationChart';
import SkiingConditions from './components/skiing/SkiingConditions';
import WeatherAlerts from './components/alerts/WeatherAlerts';
import { useWeatherAlerts } from './hooks/useWeatherAlerts';
import { Loader2, CloudSnow, MapPin, LocateFixed } from 'lucide-react';

function WeatherApp() {
  const { t, i18n } = useTranslation();
  const { state, setWeatherData, setLoading, setError, selectCity } = useWeather();
  const { selectedCity, isLoading, error, currentWeather } = state;

  const { alerts, isLoading: alertsLoading } = useWeatherAlerts(selectedCity, i18n.language);

  // Auto-detect location on mount
  const { city: geoCity, isLocating } = useGeolocation();
  useEffect(() => {
    if (geoCity && !selectedCity) {
      selectCity(geoCity);
    }
  }, [geoCity]);

  // Fetch weather whenever a city is selected
  const { data, isLoading: fetchLoading, error: fetchError } = useWeatherData(selectedCity);
  useEffect(() => {
    if (fetchLoading) {
      setLoading(true);
    } else if (fetchError) {
      setError(fetchError);
    } else if (data) {
      setWeatherData(data);
    }
  }, [data, fetchLoading, fetchError, setWeatherData, setLoading, setError]);

  const busy = isLoading || fetchLoading || isLocating;

  return (
    <AppShell>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        {/* Language toggle — centred above icon */}
        <div className="mb-3">
          <LanguageToggle />
        </div>

        <CloudSnow size={24} className="text-white/70 mb-2" />
        <h1 className="text-white/90 font-light text-xl tracking-wide text-center">
          {t('appTitle')}
        </h1>
        <p className="text-white/30 text-xs mt-1">This page was created by AI prompts.</p>
      </motion.header>

      {/* Search */}
      <CitySearch />

      {/* Loading state */}
      <AnimatePresence>
        {busy && !currentWeather && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-white/60"
          >
            <Loader2 size={36} className="animate-spin mb-4" />
            <p className="text-sm">
              {isLocating ? t('loading.detecting') : t('loading.fetching')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {error && !busy && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-6 text-center text-white/70 mb-6"
          >
            <p className="text-lg mb-1">{t('error.title')}</p>
            <p className="text-sm text-white/40">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather content */}
      <AnimatePresence mode="wait">
        {currentWeather && !busy && (
          <motion.div
            key={selectedCity?.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WeatherAlerts alerts={alerts} isLoading={alertsLoading} />
            <HeroWeather />
            <DaySegments />
            <HourlyForecast />
            <PrecipitationChart />
            <DailyForecast />
            <SkiingConditions />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome / empty state — only shown if geolocation was denied/unavailable */}
      <AnimatePresence>
        {!selectedCity && !busy && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-7xl mb-6 select-none">🍁</div>
            <h2 className="text-white/80 text-2xl font-light mb-2">
              {t('appTitle')}
            </h2>
            <p className="text-white/40 text-sm max-w-xs">
              {t('welcome.subtitle')}
            </p>
            <div className="mt-6 flex items-center gap-2 text-white/25 text-xs">
              <LocateFixed size={12} />
              <span>{t('welcome.locationDenied')}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-white/25 text-xs">
              <MapPin size={12} />
              <span>{t('welcome.poweredBy')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return (
    <WeatherProvider>
      <WeatherApp />
    </WeatherProvider>
  );
}
