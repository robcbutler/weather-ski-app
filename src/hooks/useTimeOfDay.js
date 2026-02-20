import { useMemo } from 'react';

/**
 * Derives timeOfDay string from current time + sunrise/sunset ISO strings.
 * Returns 'dawn' | 'day' | 'dusk' | 'night'
 *
 * Dawn: 30 min before sunrise → sunrise + 30 min
 * Day:  sunrise+30 → sunset-30
 * Dusk: sunset-30 → sunset+30
 * Night: everything else
 */
export function useTimeOfDay(sunrise, sunset) {
  return useMemo(() => {
    if (!sunrise || !sunset) return 'day';

    const now = Date.now();
    const riseMs = new Date(sunrise).getTime();
    const setMs  = new Date(sunset).getTime();

    const WINDOW = 30 * 60 * 1000; // 30 minutes in ms

    if (now >= riseMs - WINDOW && now <= riseMs + WINDOW) return 'dawn';
    if (now >= setMs  - WINDOW && now <= setMs  + WINDOW) return 'dusk';
    if (now > riseMs + WINDOW  && now < setMs  - WINDOW)  return 'day';
    return 'night';
  }, [sunrise, sunset]);
}
