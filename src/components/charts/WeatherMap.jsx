import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Loader2, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GOOGLE_MAPS_KEY, GOOGLE_MAPS_ID, GOOGLE_MAPS_LIBRARIES } from '../../config/googleMaps';
import { useWeather } from '../../context/WeatherContext';

// Muted/dark Google Maps style so the radar colours pop
const MAP_STYLE = [
  { elementType: 'geometry',        stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill',stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke',stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023747' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

/** Fetches RainViewer radar frames — current snapshot + nowcast only. */
function useRainViewerFrames() {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(r => r.json())
      .then(d => {
        const past    = d.radar?.past    ?? [];
        const nowcast = d.radar?.nowcast ?? [];
        const current = past.length > 0 ? [past[past.length - 1]] : [];
        setFrames([...current, ...nowcast]);
      })
      .catch(() => {});
  }, []);

  return frames;
}

/** Format Unix timestamp (seconds) to HH:MM local time. */
function formatFrameTime(unixSec) {
  return new Date(unixSec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Location pin marker. */
function locationIcon() {
  return {
    path: 'M 0,-14 C -5,-14 -9,-10 -9,-5 C -9,3 0,14 0,14 C 0,14 9,3 9,-5 C 9,-10 5,-14 0,-14 Z',
    fillColor: '#55efc4',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.3,
    anchor: { x: 0, y: 14 },
  };
}

export default function WeatherMap() {
  const { t } = useTranslation();
  const { state } = useWeather();
  const { selectedCity } = state;

  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_ID,
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [map,        setMap]        = useState(null);
  const [radarOn,    setRadarOn]    = useState(true);
  const [mapType,    setMapType]    = useState('roadmap');
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const intervalRef = useRef(null);

  const frames = useRainViewerFrames();

  const center = selectedCity
    ? { lat: selectedCity.latitude, lng: selectedCity.longitude }
    : { lat: 56, lng: -96 }; // Canada centre fallback

  const onLoad    = useCallback((m) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // Pan to new location when city changes
  useEffect(() => {
    if (map && selectedCity) map.panTo(center);
  }, [selectedCity?.latitude, selectedCity?.longitude]);

  // Start at frame 0 and auto-play the nowcast when frames arrive
  useEffect(() => {
    if (frames.length > 0) {
      setFrameIndex(0);
      setIsPlaying(true);
    }
  }, [frames.length]);

  // Auto-play — advance one frame every 700 ms
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (isPlaying && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        setFrameIndex(i => (i + 1) % frames.length);
      }, 700);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, frames.length]);

  // Radar overlay
  useEffect(() => {
    if (!map || !window.google) return;
    map.overlayMapTypes.clear();
    if (radarOn && frames.length > 0) {
      const currentPath = frames[frameIndex]?.path;
      if (currentPath) {
        const overlay = new window.google.maps.ImageMapType({
          getTileUrl: (coord, zoom) =>
            `https://tilecache.rainviewer.com${currentPath}/256/${zoom}/${coord.x}/${coord.y}/6/1_1.png`,
          tileSize: new window.google.maps.Size(256, 256),
          opacity: 0.7,
          name: 'Precipitation Radar',
        });
        map.overlayMapTypes.push(overlay);
      }
    }
  }, [map, frames, frameIndex, radarOn]);

  // Sync map type
  useEffect(() => {
    if (map) map.setMapTypeId(mapType);
  }, [map, mapType]);

  if (!selectedCity) return null;

  // ── Render guards ─────────────────────────────────────────────────
  if (!GOOGLE_MAPS_KEY) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-6"
      >
        <h2 className="text-white/65 text-xs font-semibold uppercase tracking-wider mb-3">
          {t('sections.precipMap')}
        </h2>
        <div className="glass-card flex items-center justify-center text-center text-white/40 text-sm p-8" style={{ height: 320 }}>
          <div>
            <p className="mb-1">{t('ski.mapsNoKey')}</p>
            <p className="text-white/25 text-xs">{t('ski.mapsNoKeyHint')}</p>
          </div>
        </div>
      </motion.section>
    );
  }

  if (loadError) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-6"
      >
        <h2 className="text-white/65 text-xs font-semibold uppercase tracking-wider mb-3">
          {t('sections.precipMap')}
        </h2>
        <div className="glass-card flex items-center justify-center text-white/40 text-sm" style={{ height: 320 }}>
          {t('ski.mapsLoadError')}
        </div>
      </motion.section>
    );
  }

  const MAP_TYPE_LABELS = [
    ['roadmap',   t('ski.mapTypeMap')],
    ['satellite', t('ski.mapTypeSatellite')],
    ['hybrid',    t('ski.mapTypeHybrid')],
  ];

  const currentFrame = frames[frameIndex];
  const isForecast   = frameIndex > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="mb-6"
    >
      <h2 className="text-white/65 text-xs font-semibold uppercase tracking-wider mb-3">
        {t('sections.precipMap')}
      </h2>

      {/* Header + controls */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">
          {t('ski.precipMap')}
        </h3>
        <div className="flex items-center gap-2">
          {/* Map type toggle */}
          <div className="flex gap-1">
            {MAP_TYPE_LABELS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMapType(id)}
                className={`
                  text-[10px] font-semibold px-2 py-1 rounded-lg transition-all duration-200
                  ${mapType === id
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'text-white/30 hover:text-white/60 border border-white/10'}
                `}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Radar toggle */}
          <button
            onClick={() => setRadarOn(v => !v)}
            className={`
              text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200
              ${radarOn
                ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                : 'text-white/30 hover:text-white/60 border border-white/10'}
            `}
          >
            {radarOn ? t('ski.radarOn') : t('ski.radarOff')}
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ height: 360 }}>
        {!isLoaded ? (
          <div className="glass-card w-full h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white/40" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={7}
            options={{
              styles: mapType === 'roadmap' ? MAP_STYLE : [],
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              mapTypeId: mapType,
            }}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            <Marker
              position={center}
              title={selectedCity.name}
              icon={locationIcon()}
            />
          </GoogleMap>
        )}
      </div>

      {/* Radar timeline */}
      {radarOn && frames.length > 1 && (
        <div className="mt-2 glass-card p-2.5">
          <div className="flex items-center gap-2">
            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(v => !v)}
              aria-label={isPlaying ? t('ski.radarPause') : t('ski.radarPlay')}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full
                         text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>

            {/* Scrubber */}
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              value={frameIndex}
              onChange={e => {
                setIsPlaying(false);
                setFrameIndex(Number(e.target.value));
              }}
              className="flex-1 h-1 accent-blue-400 cursor-pointer"
            />

            {/* Frame time + forecast badge */}
            <span className="text-[10px] text-white/50 shrink-0 min-w-[60px] text-right">
              {currentFrame ? formatFrameTime(currentFrame.time) : ''}
              {isForecast && <span className="text-blue-300/70 ml-0.5">▲</span>}
            </span>
          </div>

          {/* Legend */}
          {frames.length > 1 && (
            <div className="flex justify-end text-[9px] text-blue-300/35 mt-1 pr-1">
              ▲ {t('ski.radarForecast')}
            </div>
          )}
        </div>
      )}

      <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/20 px-1">
        <span>© Google Maps</span>
        <span>Radar: © RainViewer</span>
      </div>
    </motion.section>
  );
}
