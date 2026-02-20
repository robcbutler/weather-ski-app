import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
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

  if (!daySegments) return null;

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
        {SEGMENT_ORDER.map(seg => (
          <motion.div key={seg} variants={itemVariants}>
            <SegmentCard segmentKey={seg} stats={daySegments[seg]} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
