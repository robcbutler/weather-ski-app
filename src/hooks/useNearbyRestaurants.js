import { useState, useEffect, useRef } from 'react';

// Search all dining types in parallel so restaurants, cafés, bars, and
// takeaway spots are all considered in one combined ranking.
const DINING_TYPES = ['restaurant', 'cafe', 'bar', 'meal_takeaway'];

const SEARCH_RADIUS_M = 5000; // 5 km straight-line radius
const TOP_N = 5;

/**
 * Finds the top 5 highest-rated dining places within 5 km of the resort.
 * Searches restaurant, cafe, bar, and meal_takeaway types simultaneously,
 * merges + deduplicates, sorts by rating, then enriches the top 5 with
 * website and phone number via getDetails.
 *
 * @param {object|null} resort   - { id, name, latitude, longitude }
 * @param {boolean}     isLoaded - true once useJsApiLoader reports ready
 */
export function useNearbyRestaurants(resort, isLoaded) {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading,   setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const attrNodeRef = useRef(null);

  useEffect(() => {
    if (!resort || !isLoaded || !window.google?.maps?.places) return;

    let cancelled = false;
    setLoading(true);
    setRestaurants([]);
    setError(null);

    if (!attrNodeRef.current) {
      attrNodeRef.current = document.createElement('div');
    }

    const placesService = new window.google.maps.places.PlacesService(attrNodeRef.current);
    const origin        = { lat: resort.latitude, lng: resort.longitude };

    // Run a single NearbySearch for one place type
    function searchByType(type) {
      return new Promise(resolve => {
        placesService.nearbySearch(
          { location: origin, radius: SEARCH_RADIUS_M, type },
          (results, status) => {
            const OK = window.google.maps.places.PlacesServiceStatus.OK;
            resolve(status === OK ? (results ?? []) : []);
          }
        );
      });
    }

    // ── Step 1: Parallel search across all dining types ─────────────
    Promise.all(DINING_TYPES.map(searchByType)).then(resultArrays => {
      if (cancelled) return;

      // Merge, deduplicate by place_id, require at least one rating
      const seen       = new Set();
      const candidates = resultArrays
        .flat()
        .filter(r => r.rating && !seen.has(r.place_id) && seen.add(r.place_id));

      if (!candidates.length) {
        setLoading(false);
        return;
      }

      // Sort by rating (more reviews as tiebreaker), take top N
      const top = [...candidates]
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return (b.user_ratings_total ?? 0) - (a.user_ratings_total ?? 0);
        })
        .slice(0, TOP_N);

      // ── Step 2: Enrich each with website + phone ─────────────────
      const detailPromises = top.map(r => new Promise(resolve => {
        placesService.getDetails(
          { placeId: r.place_id, fields: ['website', 'formatted_phone_number'] },
          (detail) => {
            resolve({
              placeId:      r.place_id,
              name:         r.name,
              rating:       r.rating,
              totalRatings: r.user_ratings_total ?? 0,
              priceLevel:   r.price_level ?? null,
              vicinity:     r.vicinity ?? '',
              openNow:      r.opening_hours?.open_now ?? null,
              website:      detail?.website ?? null,
              phone:        detail?.formatted_phone_number ?? null,
            });
          }
        );
      }));

      Promise.all(detailPromises).then(enriched => {
        if (cancelled) return;
        setRestaurants(enriched);
        setLoading(false);
      });
    });

    return () => { cancelled = true; };
  }, [resort?.id, isLoaded]);

  return { restaurants, isLoading, error };
}
