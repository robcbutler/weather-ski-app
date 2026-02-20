// Shared Google Maps config — imported by every component that uses useJsApiLoader.
// All callers MUST use the same id + libraries so the script is only loaded once.
export const GOOGLE_MAPS_KEY       = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';
export const GOOGLE_MAPS_ID        = 'google-map-ski';
export const GOOGLE_MAPS_LIBRARIES = ['places'];
