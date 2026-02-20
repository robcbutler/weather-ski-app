/**
 * Date / time formatting utilities for the weather app.
 * All times are based on the city's local timezone (passed via timezone param
 * or already localized by Open-Meteo's `timezone=auto` response).
 */

/** Format ISO hour string like "2024-01-15T14:00" → "2 PM" / "14h" */
export function formatHour(isoStr, locale = 'en-CA') {
  const d = new Date(isoStr);
  const h = d.getHours();
  if (locale === 'fr-CA') {
    return h === 0 ? '0h' : `${h}h`;
  }
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

/** Format ISO date string like "2024-01-15" → "Mon Jan 15" */
export function formatDay(isoStr, locale = 'en-CA') {
  const d = new Date(isoStr + 'T12:00:00'); // noon to avoid timezone edge cases
  return d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Format ISO date → short weekday like "Monday" */
export function formatWeekday(isoStr, locale = 'en-CA') {
  const d = new Date(isoStr + 'T12:00:00');
  return d.toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Returns 'Today' / 'Tomorrow' (translated via t) or locale-formatted weekday.
 * Uses string comparison so there's no rounding error at midnight or 1 AM.
 * Accepts an optional IANA timezone so the "today" reference matches the city,
 * not the browser's local clock.
 *
 * @param {string} isoStr    - date string "YYYY-MM-DD" from the forecast
 * @param {function|null} t  - i18next t function (optional, falls back to English)
 * @param {string} locale    - BCP 47 locale for weekday formatting
 * @param {string|null} timeZone - IANA tz (e.g. "America/Toronto") for city-local date
 */
export function formatRelativeDay(isoStr, t = null, locale = 'en-CA', timeZone = null) {
  const tzOpts = timeZone ? { timeZone } : {};

  // Current date string in the city's timezone (or browser local if none supplied)
  const todayStr = new Date().toLocaleDateString('en-CA', tzOpts);

  // Tomorrow's date string — use setDate to handle month/year rollovers correctly
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toLocaleDateString('en-CA', tzOpts);

  if (isoStr === todayStr)    return t ? t('time.today')    : 'Today';
  if (isoStr === tomorrowStr) return t ? t('time.tomorrow') : 'Tomorrow';

  return new Date(isoStr + 'T12:00:00').toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Returns the segment name for a given hour (0-23).
 * morning: 6–11, afternoon: 12–17, evening: 18–21, night: 22–23 & 0–5
 */
export function hourToSegment(hour) {
  if (hour >= 6  && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/** Format Unix timestamp or ISO string to local time "HH:MM" */
export function formatTime(isoStr, locale = 'en-CA') {
  const d = new Date(isoStr);
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: locale !== 'fr-CA' });
}

/** Format wind direction degrees to compass abbreviation */
export function degreesToCompass(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}
