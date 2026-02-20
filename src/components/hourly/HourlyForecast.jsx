import { useRef, useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import HourlyItem from './HourlyItem';
import { formatRelativeDay } from '../../utils/dateUtils';

const SCROLL_AMOUNT = 300; // px per arrow click

/** Groups a flat hourly array by calendar date. */
function groupByDay(hourlyForecast) {
  const groups = [];
  let currentDate = null;
  let currentGroup = null;

  hourlyForecast.forEach((item) => {
    const date = item.time.slice(0, 10);
    if (date !== currentDate) {
      currentDate = date;
      currentGroup = { date, items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push(item);
  });

  return groups;
}

export default function HourlyForecast() {
  const { t, i18n } = useTranslation();
  const { state } = useWeather();
  const { hourlyForecast, sunrise, sunset, selectedCity } = state;
  const timeZone = selectedCity?.timezone ?? null;

  // Extract hour-of-day thresholds from today's sunrise/sunset for night detection
  const sunriseHour = sunrise ? new Date(sunrise).getHours() : 6;
  const sunsetHour  = sunset  ? new Date(sunset).getHours()  : 20;

  const scrollRef = useRef(null);
  const dayRefs   = useRef([]);

  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    return () => el.removeEventListener('scroll', updateArrows);
  }, [hourlyForecast]);

  if (!hourlyForecast?.length) return null;

  const locale  = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';
  const tzOpts    = timeZone ? { timeZone } : {};
  const todayDate = new Date().toLocaleDateString('en-CA', tzOpts);
  const nowHour   = new Date().getHours();

  // Build "YYYY-MM-DDTHH" for the current hour in the city's timezone
  // so we can drop every hour that has already passed.
  const cityNowPrefix = (() => {
    const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', hour12: false,
    }).formatToParts(new Date());
    const get = type => parts.find(p => p.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}`;
  })();

  // Keep only the current hour and everything after it
  const upcomingHours = hourlyForecast.filter(
    item => item.time.slice(0, 13) >= cityNowPrefix,
  );

  const groups = groupByDay(upcomingHours);

  function scrollToDay(index) {
    const el = dayRefs.current[index];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ left: el.offsetLeft - 12, behavior: 'smooth' });
    }
  }

  function scrollBy(direction) {
    scrollRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: 'smooth' });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6"
    >
      {/* Header row: title + day-jump tabs */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          {t('sections.hourlyForecast')}
        </h2>
        <div className="flex gap-1">
          {groups.map((group, i) => (
            <button
              key={group.date}
              onClick={() => scrollToDay(i)}
              className="
                px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150
                text-white/50 hover:text-white/90 hover:bg-white/10 active:bg-white/20
              "
            >
              {group.date === todayDate ? t('time.today') : formatRelativeDay(group.date, t, locale, timeZone)}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll strip + arrow buttons */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
            w-8 h-8 rounded-full glass-card flex items-center justify-center
            text-white transition-all duration-200
            ${canScrollLeft
              ? 'opacity-90 hover:opacity-100 hover:bg-white/20 shadow-lg'
              : 'opacity-0 pointer-events-none'
            }
          `}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
            w-8 h-8 rounded-full glass-card flex items-center justify-center
            text-white transition-all duration-200
            ${canScrollRight
              ? 'opacity-90 hover:opacity-100 hover:bg-white/20 shadow-lg'
              : 'opacity-0 pointer-events-none'
            }
          `}
        >
          <ChevronRight size={18} />
        </button>

        {/* Scrollable strip */}
        <div ref={scrollRef} className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex gap-2 w-max items-stretch">
            {groups.map((group, gi) => (
              <Fragment key={group.date}>
                {/* Day separator — scroll anchor */}
                <div
                  ref={el => { dayRefs.current[gi] = el; }}
                  className="flex flex-col items-center justify-center gap-1 px-2 min-w-[44px]"
                >
                  <div className="w-px flex-1 bg-white/10 min-h-[8px]" />
                  <span
                    className="text-white/35 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {group.date === todayDate ? t('time.today') : formatRelativeDay(group.date, t, locale, timeZone)}
                  </span>
                  <div className="w-px flex-1 bg-white/10 min-h-[8px]" />
                </div>

                {/* Hourly items */}
                {group.items.map((item) => {
                  const itemHour = new Date(item.time).getHours();
                  const isNow = item.time.slice(0, 10) === todayDate && itemHour === nowHour;
                  const isNightHour = itemHour < sunriseHour || itemHour >= sunsetHour;
                  return <HourlyItem key={item.time} item={item} isNow={isNow} isNight={isNightHour} />;
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
