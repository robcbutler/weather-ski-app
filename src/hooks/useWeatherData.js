import { useState, useEffect } from 'react';
import { getWeatherInfo } from '../utils/wmoWeatherCodes';
import { computeSegmentStats } from '../utils/temperatureUtils';
import { hourToSegment } from '../utils/dateUtils';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_VARS = [
  'temperature_2m', 'apparent_temperature', 'weathercode',
  'windspeed_10m', 'winddirection_10m', 'relativehumidity_2m',
  'precipitation', 'cloudcover',
].join(',');

const HOURLY_VARS = [
  'temperature_2m', 'apparent_temperature', 'precipitation_probability',
  'precipitation', 'snowfall', 'weathercode', 'windspeed_10m',
  'relativehumidity_2m', 'cloudcover',
].join(',');

const DAILY_VARS = [
  'weathercode', 'temperature_2m_max', 'temperature_2m_min',
  'precipitation_sum', 'snowfall_sum', 'precipitation_probability_max',
  'sunrise', 'sunset',
].join(',');

/**
 * Transforms raw Open-Meteo API response into app-friendly shape.
 */
function transformWeatherData(data) {
  const { current, hourly, daily } = data;

  // --- Current weather ---
  const currentWeather = {
    temp:         Math.round(current.temperature_2m),
    feelsLike:    Math.round(current.apparent_temperature),
    weatherCode:  current.weathercode,
    windSpeed:    Math.round(current.windspeed_10m),
    windDir:      current.winddirection_10m,
    humidity:     current.relativehumidity_2m,
    precipitation:current.precipitation,
    cloudCover:   current.cloudcover,
    ...getWeatherInfo(current.weathercode),
  };

  // --- Hourly (first 72h = 3 days) ---
  const hourlyForecast = hourly.time.slice(0, 72).map((time, i) => ({
    time,
    temp:          Math.round(hourly.temperature_2m[i]),
    feelsLike:     Math.round(hourly.apparent_temperature[i]),
    precipProb:    hourly.precipitation_probability[i] ?? 0,
    precipitation: +(hourly.precipitation[i] ?? 0).toFixed(1),
    snowfall:      +(hourly.snowfall[i]      ?? 0).toFixed(1), // cm
    weatherCode:   hourly.weathercode[i],
    windSpeed:     Math.round(hourly.windspeed_10m[i] ?? 0),
    humidity:      hourly.relativehumidity_2m[i],
    cloudCover:    hourly.cloudcover[i],
    ...getWeatherInfo(hourly.weathercode[i]),
  }));

  // --- Daily (first 7 days) ---
  const dailyForecast = daily.time.slice(0, 7).map((date, i) => ({
    date,
    weatherCode:   daily.weathercode[i],
    tempMax:       Math.round(daily.temperature_2m_max[i]),
    tempMin:       Math.round(daily.temperature_2m_min[i]),
    precipSum:     +(daily.precipitation_sum[i]  ?? 0).toFixed(1), // mm (rain)
    snowfallSum:   +(daily.snowfall_sum[i]        ?? 0).toFixed(1), // cm (snow)
    precipProbMax: daily.precipitation_probability_max[i] ?? 0,
    sunrise:       daily.sunrise[i],
    sunset:        daily.sunset[i],
    ...getWeatherInfo(daily.weathercode[i]),
  }));

  // --- Day segments (for today's hours) ---
  const segmentIndices = { morning: [], afternoon: [], evening: [], night: [] };
  hourly.time.slice(0, 24).forEach((time, i) => {
    const hour = new Date(time).getHours();
    const seg  = hourToSegment(hour);
    segmentIndices[seg].push(i);
  });

  const daySegments = {};
  for (const [seg, indices] of Object.entries(segmentIndices)) {
    daySegments[seg] = computeSegmentStats(hourly, indices);
  }

  // --- Precipitation chart (72h = 3 days) ---
  const precipChart = hourly.time.slice(0, 72).map((time, i) => ({
    index:       i,
    hour:        new Date(time).getHours(),
    date:        time.slice(0, 10),
    time,
    probability: hourly.precipitation_probability[i] ?? 0,
    amount:      +(hourly.precipitation[i]  ?? 0).toFixed(1), // mm total liquid
    snowfall:    +(hourly.snowfall[i]        ?? 0).toFixed(1), // cm snow
    weatherCode: hourly.weathercode[i] ?? 0,
  }));

  // Today's sunrise/sunset
  const sunrise = daily.sunrise[0];
  const sunset  = daily.sunset[0];

  // Dominant weather category for today
  const info = getWeatherInfo(current.weathercode);

  return {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    daySegments,
    precipChart,
    sunrise,
    sunset,
    weatherCategory: info.category,
    weatherParticle: info.particle,
  };
}

/**
 * Fetches weather data for a given city (lat/lon) from Open-Meteo.
 * @param {object|null} city - { latitude, longitude, timezone }
 * @returns {{ data, isLoading, error }}
 */
export function useWeatherData(city) {
  const [data, setData]         = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!city) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const url = new URL(WEATHER_URL);
        url.searchParams.set('latitude',  city.latitude);
        url.searchParams.set('longitude', city.longitude);
        url.searchParams.set('current',   CURRENT_VARS);
        url.searchParams.set('hourly',    HOURLY_VARS);
        url.searchParams.set('daily',     DAILY_VARS);
        url.searchParams.set('timezone',  city.timezone ?? 'auto');
        url.searchParams.set('forecast_days', '7');

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        const raw = await res.json();
        setData(transformWeatherData(raw));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [city?.latitude, city?.longitude, city?.timezone]);

  return { data, isLoading, error };
}
