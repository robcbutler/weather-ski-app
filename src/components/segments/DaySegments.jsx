import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import { hourToSegment } from '../../utils/dateUtils';
import SegmentCard from './SegmentCard';

const SEGMENT_ORDER = ['morning', 'afternoon', 'evening', 'night'];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.4 } },
};

export default function DaySegments() {
  const { t } = useTranslation();
  const { state } = useWeather();
  const { daySegments } = state;

  if (!daySegments?.length) return null;

  // Find the 4 upcoming segments starting from the current one
  const currentSeg = hourToSegment(new Date().getHours());
  const startIdx   = SEGMENT_ORDER.indexOf(currentSeg); // 0–3 within today
  const upcoming   = daySegments.slice(startIdx, startIdx + 4);

  return (
    <section className="mb-6">
      <h2 className="text-white/65 text-xs font-semibold uppercase tracking-wider mb-3">
        {t('sections.hours24')}
      </h2>
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {upcoming.map(({ key, day, stats }) => {
          const dayLabel = day === 0 ? t('time.today') : t('time.tomorrow');
          return (
            <motion.div key={`${day}-${key}`} variants={itemVariants} className="flex flex-col">
              <SegmentCard segmentKey={key} stats={stats} dayLabel={dayLabel} />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
