import { useState, useEffect, useRef } from 'react';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Debounced geocoding hook filtered to Canadian cities.
 * @param {string} query - city name input
 * @param {number} debounceMs - debounce delay (default 300ms)
 * @returns {{ results: [], isSearching: boolean, error: string|null }}
 */
export function useGeocoding(query, debounceMs = 300) {
  const [results, setResults]       = useState([]);
  const [isSearching, setSearching] = useState(false);
  const [error, setError]           = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const trimmed = query?.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setSearching(true);
      setError(null);

      try {
        const url = new URL(GEOCODING_URL);
        url.searchParams.set('name', trimmed);
        url.searchParams.set('count', '10');
        url.searchParams.set('country_code', 'CA');
        url.searchParams.set('language', 'en');

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setResults([]);
        }
      } finally {
        setSearching(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, debounceMs]);

  return { results, isSearching, error };
}
