import { useState, useEffect } from 'react';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * On mount, requests the browser's geolocation, then reverse-geocodes
 * via Nominatim to get a city name.
 * Returns { city, isLocating, locationError }
 * where city matches the shape selectCity() expects:
 *   { name, admin1, latitude, longitude, timezone: null }
 */
export function useGeolocation() {
  const [city, setCity]           = useState(null);
  const [isLocating, setLocating] = useState(false);
  const [locationError, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const url = new URL(NOMINATIM_URL);
          url.searchParams.set('lat', latitude);
          url.searchParams.set('lon', longitude);
          url.searchParams.set('format', 'json');
          url.searchParams.set('zoom', '10'); // city level

          const res = await fetch(url.toString(), {
            headers: { 'Accept-Language': 'en' },
          });
          if (!res.ok) throw new Error('Reverse geocoding failed');
          const data = await res.json();

          const addr = data.address ?? {};
          const name =
            addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? 'Your Location';
          const admin1 = addr.state ?? addr.province ?? '';

          setCity({ name, admin1, latitude, longitude, timezone: null });
        } catch (err) {
          // Fall back: still use coords with a generic label
          setCity({
            name: 'Your Location',
            admin1: '',
            latitude,
            longitude,
            timezone: null,
          });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        // Don't treat denial as a hard error — just show the welcome screen
        if (err.code !== err.PERMISSION_DENIED) {
          setError(err.message);
        }
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  return { city, isLocating, locationError };
}
