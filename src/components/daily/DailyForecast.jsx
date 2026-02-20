import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import DayCard from './DayCard';

export default function DailyForecast() {
  const { t } = useTranslation();
  const { state } = useWeather();
  const { dailyForecast, selectedCity } = state;
  const timeZone = selectedCity?.timezone ?? null;

  if (!dailyForecast?.length) return null;

  const todayStr = timeZone
    ? new Date().toLocaleDateString('en-CA', { timeZone })
    : new Date().toLocaleDateString('en-CA');

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-6"
    >
      <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
        {t('sections.sevenDay')}
      </h2>
      <div className="flex flex-col gap-2">
        {dailyForecast.map((day) => (
          <DayCard
            key={day.date}
            day={day}
            isToday={day.date === todayStr}
            timeZone={timeZone}
          />
        ))}
      </div>
    </motion.section>
  );
}
