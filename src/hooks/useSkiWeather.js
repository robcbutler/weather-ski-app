import { useState, useEffect } from 'react';
import { getWeatherInfo } from '../utils/wmoWeatherCodes';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const SKI_HOURLY = [
  'temperature_2m', 'precipitation_probability', 'precipitation',
  'snowfall', 'snow_depth', 'windspeed_10m', 'weathercode',
].join(',');

const SKI_DAILY = [
  'weathercode', 'temperature_2m_max', 'temperature_2m_min',
  'snowfall_sum', 'precipitation_probability_max', 'precipitation_sum',
].join(',');

/**
 * Computes a conditions rating and estimated open run percentage
 * from snow depth (cm), fresh snow in last 24h (cm), max temp (°C), wind (km/h).
 */
export function computeSkiConditions(snowDepthCm, freshSnowCm, maxTempC, avgWindKph) {
  let score = 0;

  // Snow base depth (0–35)
  if      (snowDepthCm >= 200) score += 35;
  else if (snowDepthCm >= 150) score += 30;
  else if (snowDepthCm >= 100) score += 22;
  else if (snowDepthCm >= 50)  score += 14;
  else if (snowDepthCm >= 20)  score += 7;

  // Fresh snow (0–30)
  if      (freshSnowCm >= 30) score += 30;
  else if (freshSnowCm >= 20) score += 25;
  else if (freshSnowCm >= 10) score += 18;
  else if (freshSnowCm >= 5)  score += 10;
  else if (freshSnowCm >  0)  score += 4;

  // Temperature: ideal −5 to −15°C (0–25)
  if      (maxTempC <= -15) score += 16;
  else if (maxTempC <= -5)  score += 25;
  else if (maxTempC <= 0)   score += 18;
  else if (maxTempC <= 5)   score += 8;

  // Wind: above 60 km/h likely causes lift closures (0–10)
  if      (avgWindKph <= 20) score += 10;
  else if (avgWindKph <= 40) score += 6;
  else if (avgWindKph <= 60) score += 2;

  if (score >= 72) return { key: 'excellent', label: 'Excellent', color: '#55efc4', bg: 'rgba(85,239,196,0.15)', openPct: 0.93 };
  if (score >= 50) return { key: 'good',      label: 'Good',      color: '#74b9ff', bg: 'rgba(116,185,255,0.15)', openPct: 0.72 };
  if (score >= 28) return { key: 'fair',      label: 'Fair',      color: '#fdcb6e', bg: 'rgba(253,203,110,0.15)', openPct: 0.48 };
  return                   { key: 'poor',     label: 'Poor',      color: '#e17055', bg: 'rgba(225,112,85,0.15)',  openPct: 0.20 };
}

function transformSkiData(raw) {
  const { hourly, daily } = raw;

  // 3-day daily forecast
  const dailyForecast = daily.time.slice(0, 3).map((date, i) => ({
    date,
    weatherCode:     daily.weathercode[i],
    tempMax:         Math.round(daily.temperature_2m_max[i]),
    tempMin:         Math.round(daily.temperature_2m_min[i]),
    snowfallSum:     +(daily.snowfall_sum[i] ?? 0).toFixed(1),
    precipProbMax:   daily.precipitation_probability_max[i] ?? 0,
    precipSum:       +(daily.precipitation_sum[i] ?? 0).toFixed(1),
    ...getWeatherInfo(daily.weathercode[i]),
  }));

  // 72-hour precip chart
  const precipChart = hourly.time.slice(0, 72).map((time, i) => ({
    index:       i,
    hour:        new Date(time).getHours(),
    date:        time.slice(0, 10),
    time,
    probability: hourly.precipitation_probability[i] ?? 0,
    snowfall:    +(hourly.snowfall[i]      ?? 0).toFixed(1), // cm
    amount:      +(hourly.precipitation[i] ?? 0).toFixed(1), // mm liquid total
    weatherCode: hourly.weathercode[i] ?? 0,
  }));

  // Current conditions — use first available hourly value
  const nowIdx       = 0;
  const snowDepthCm  = (hourly.snow_depth[nowIdx] ?? 0) * 100; // m → cm
  const freshSnow24h = hourly.snowfall.slice(0, 24).reduce((s, v) => s + (v ?? 0), 0);
  const maxTemp      = daily.temperature_2m_max[0] ?? 0;
  const avgWind      = hourly.windspeed_10m.slice(0, 24).reduce((s, v) => s + (v ?? 0), 0) / 24;

  const conditions = computeSkiConditions(snowDepthCm, freshSnow24h, maxTemp, avgWind);

  return {
    dailyForecast,
    precipChart,
    snowDepthCm:  Math.round(snowDepthCm),
    freshSnow24h: +freshSnow24h.toFixed(1),
    currentTemp:  Math.round(hourly.temperature_2m[nowIdx] ?? 0),
    avgWind:      Math.round(avgWind),
    conditions,
  };
}

export function useSkiWeather(resort) {
  const [data, setData]         = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!resort) { setData(null); return; }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const url = new URL(WEATHER_URL);
        url.searchParams.set('latitude',      resort.latitude);
        url.searchParams.set('longitude',     resort.longitude);
        url.searchParams.set('hourly',        SKI_HOURLY);
        url.searchParams.set('daily',         SKI_DAILY);
        url.searchParams.set('timezone',      'auto');
        url.searchParams.set('forecast_days', '3');

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        const raw = await res.json();
        setData(transformSkiData(raw));
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
  }, [resort?.id]);

  return { data, isLoading, error };
}
