import { motion } from 'framer-motion';
import { Wind, Droplets, Snowflake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatRelativeDay } from '../../utils/dateUtils';
import { getTempStyle } from '../../utils/temperatureUtils';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Ski3DayForecast({ dailyForecast }) {
  const { t, i18n } = useTranslation();
  if (!dailyForecast?.length) return null;

  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';

  return (
    <div>
      <h3 className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2">
        {t('ski.threeDayForecast')}
      </h3>
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        {dailyForecast.map((day) => {
          const weatherLabel = t(`wmo.${day.weatherCode}`, { defaultValue: day.label });
          return (
            <motion.div key={day.date} variants={cardVariants} className="glass-card p-3 flex flex-col gap-2">
              {/* Day label */}
              <div className="text-white/60 text-xs font-semibold">
                {formatRelativeDay(day.date, t, locale)}
              </div>

              {/* Icon + temps */}
              <div className="flex items-center justify-between">
                <span className="text-2xl" role="img" aria-label={weatherLabel}>{day.icon}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={getTempStyle(day.tempMax)}>
                    {day.tempMax}°
                  </div>
                  <div className="text-xs text-white/40" style={getTempStyle(day.tempMin)}>
                    {day.tempMin}°
                  </div>
                </div>
              </div>

              {/* Snowfall */}
              <div className="flex items-center gap-1 text-blue-200 text-xs">
                <Snowflake size={11} />
                <span>{day.snowfallSum > 0 ? `${day.snowfallSum} cm` : t('ski.noSnow')}</span>
              </div>

              {/* Precip probability */}
              <div className="flex items-center gap-1 text-white/40 text-xs">
                <Droplets size={11} />
                <span>{day.precipProbMax}%</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
