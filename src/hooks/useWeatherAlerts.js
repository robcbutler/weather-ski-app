import { useState, useEffect } from 'react';

// ── Environment Canada city-page weather API ──────────────────────────────────
const EC_CITYPAGE = 'https://api.weather.gc.ca/collections/citypageweather-realtime/items';
const CORS_PROXY  = 'https://corsproxy.io/?url=';

// ── Severity map ──────────────────────────────────────────────────────────────
const SEVERITY_RANK = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1 };

function typeToSeverity(type) {
  const t = type.toLowerCase();
  if (t === 'warning') return 'Severe';
  if (t === 'watch')   return 'Moderate';
  return 'Minor'; // statement, advisory, etc.
}

// ── Known EC city identifiers + approximate coordinates ───────────────────────
// Lookup key: { id, lat, lon }
// Confirmed via direct API calls to citypageweather-realtime collection.
const KNOWN_CITIES = [
  // Ontario
  { id: 'on-118', lat: 45.42,  lon: -75.70  },  // Ottawa
  { id: 'on-143', lat: 43.65,  lon: -79.38  },  // Toronto
  { id: 'on-69',  lat: 44.23,  lon: -76.48  },  // Kingston
  { id: 'on-139', lat: 46.31,  lon: -79.46  },  // North Bay
  { id: 'on-121', lat: 44.30,  lon: -78.32  },  // Peterborough
  { id: 'on-44',  lat: 44.55,  lon: -78.73  },  // Kawartha Lakes
  // Quebec
  { id: 'qc-147', lat: 45.51,  lon: -73.67  },  // Montréal
  { id: 'qc-133', lat: 46.81,  lon: -71.21  },  // Québec City
  { id: 'qc-126', lat: 45.48,  lon: -75.70  },  // Gatineau
  { id: 'qc-59',  lat: 45.53,  lon: -75.78  },  // Chelsea
  // British Columbia
  { id: 'bc-74',  lat: 49.28,  lon: -123.12 },  // Vancouver
  { id: 'bc-85',  lat: 48.43,  lon: -123.37 },  // Victoria
  { id: 'bc-48',  lat: 49.88,  lon: -119.50 },  // Kelowna
  // Alberta
  { id: 'ab-52',  lat: 51.05,  lon: -114.07 },  // Calgary
  { id: 'ab-3',   lat: 51.09,  lon: -115.34 },  // Canmore (near Banff ski resorts)
  { id: 'ab-30',  lat: 49.70,  lon: -112.83 },  // Lethbridge
  // Manitoba
  { id: 'mb-38',  lat: 49.90,  lon: -97.14  },  // Winnipeg
  // Saskatchewan
  { id: 'sk-32',  lat: 50.45,  lon: -104.62 },  // Regina
  { id: 'sk-40',  lat: 52.13,  lon: -106.67 },  // Saskatoon
  // Nova Scotia
  { id: 'ns-19',  lat: 44.65,  lon: -63.57  },  // Halifax
  // New Brunswick
  { id: 'nb-29',  lat: 45.97,  lon: -66.65  },  // Fredericton
  // Newfoundland & Labrador
  { id: 'nl-24',  lat: 47.56,  lon: -52.71  },  // St. John's
  // Prince Edward Island
  { id: 'pe-5',   lat: 46.24,  lon: -63.13  },  // Charlottetown
];

// Haversine distance in km
function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find the closest known city within maxKm km
function findNearest(lat, lon, maxKm = 250) {
  let best = null, bestDist = Infinity;
  for (const city of KNOWN_CITIES) {
    const d = distKm(lat, lon, city.lat, city.lon);
    if (d < bestDist && d <= maxKm) { bestDist = d; best = city; }
  }
  return best;
}

// ── Response parser ───────────────────────────────────────────────────────────
function parseAlerts(data, lang) {
  const key = lang === 'fr' ? 'fr' : 'en';
  const seen = new Set();
  const alerts = [];

  for (const feature of data?.features ?? []) {
    for (const w of feature.properties?.warnings ?? []) {
      const typeStr = (w.type?.[key] ?? '').toLowerCase();
      if (typeStr === 'ended') continue;

      const event = w.description?.[key] ?? 'Weather Alert';
      if (seen.has(event)) continue;
      seen.add(event);

      alerts.push({
        id:       `${event}-${w.expiryTime?.[key] ?? Math.random()}`,
        event,
        headline: '',
        description: '',
        severity: typeToSeverity(typeStr),
        urgency:  '',
        expires:  w.expiryTime?.[key] ?? null,
        url:      w.url?.[key]        ?? null,
      });
    }
  }

  return alerts.sort(
    (a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0),
  );
}

// ── Fetch with CORS fallback ───────────────────────────────────────────────────
async function fetchAlerts(ecId, lang, signal) {
  const url = `${EC_CITYPAGE}?identifier=${encodeURIComponent(ecId)}&f=json&limit=1`;

  try {
    const res = await fetch(url, { signal });
    if (res.ok) return parseAlerts(await res.json(), lang);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    // CORS or network error — fall through to proxy
  }

  const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;
  const res = await fetch(proxied, { signal });
  if (!res.ok) throw new Error(`Alerts API error: ${res.status}`);
  return parseAlerts(await res.json(), lang);
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * Fetch Environment Canada weather alerts for the nearest known city
 * to the provided location (city or ski resort).
 *
 * @param {object|null} location  - object with .latitude and .longitude
 * @param {string}      lang      - 'en' | 'fr'
 */
export function useWeatherAlerts(location, lang = 'en') {
  const [alerts,    setAlerts]  = useState([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) { setAlerts([]); return; }

    const lat = location.latitude  ?? location.lat;
    const lon = location.longitude ?? location.lon;
    if (lat == null || lon == null) { setAlerts([]); return; }

    const nearest = findNearest(lat, lon);
    if (!nearest) { setAlerts([]); return; }

    const controller = new AbortController();
    setLoading(true);

    fetchAlerts(nearest.id, lang, controller.signal)
      .then(data => { setAlerts(data); setLoading(false); })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setAlerts([]);
        setLoading(false);
      });

    return () => controller.abort();
  }, [location?.latitude ?? location?.lat, location?.longitude ?? location?.lon, lang]);

  return { alerts, isLoading };
}
