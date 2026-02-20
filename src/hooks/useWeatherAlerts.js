import { useState, useEffect } from 'react';

const MSC_URL   = 'https://api.weather.gc.ca/collections/alerts/items';
const CORS_PROXY = 'https://corsproxy.io/?url=';
const DELTA      = 1.0; // ±1 degree bbox (~100 km)

const SEVERITY_RANK = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1 };

function buildUrl(lat, lon, lang, proxy = false) {
  const params = new URLSearchParams({
    bbox: `${lon - DELTA},${lat - DELTA},${lon + DELTA},${lat + DELTA}`,
    lang,
    f: 'json',
    limit: 20,
  });
  const url = `${MSC_URL}?${params}`;
  return proxy ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
}

function parseAlerts(data, lang) {
  const prefix = lang === 'fr' ? 'fr' : 'en';
  return (data?.features ?? [])
    .map(f => {
      const props = f.properties ?? {};
      const infoArr = props.info ?? [];
      const info = infoArr.find(i => i.language?.startsWith(prefix)) ?? infoArr[0] ?? {};
      return {
        id:          props.identifier ?? String(Math.random()),
        event:       info.event       ?? 'Weather Alert',
        headline:    info.headline    ?? '',
        description: info.description ?? '',
        severity:    info.severity    ?? 'Minor',
        urgency:     info.urgency     ?? '',
        expires:     info.expires     ?? null,
      };
    })
    .filter(a => a.event)
    .sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0));
}

async function fetchWithFallback(lat, lon, lang, signal) {
  // Try MSC API directly first (supports CORS for most browsers)
  try {
    const res = await fetch(buildUrl(lat, lon, lang), { signal });
    if (res.ok) return parseAlerts(await res.json(), lang);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    // CORS or network error — fall through to proxy
  }

  // CORS proxy fallback
  const res = await fetch(buildUrl(lat, lon, lang, true), { signal });
  if (!res.ok) throw new Error(`Alerts API error: ${res.status}`);
  return parseAlerts(await res.json(), lang);
}

export function useWeatherAlerts(city, lang = 'en') {
  const [alerts,    setAlerts]   = useState([]);
  const [isLoading, setLoading]  = useState(false);
  const [error,     setError]    = useState(null);

  useEffect(() => {
    if (!city) { setAlerts([]); return; }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchWithFallback(city.latitude, city.longitude, lang, controller.signal)
      .then(data => { setAlerts(data); setLoading(false); })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setAlerts([]);
        setLoading(false);
      });

    return () => controller.abort();
  }, [city?.latitude, city?.longitude, lang]);

  return { alerts, isLoading, error };
}
