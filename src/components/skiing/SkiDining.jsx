import { motion } from 'framer-motion';
import { Loader2, UtensilsCrossed, Globe, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNearbyRestaurants } from '../../hooks/useNearbyRestaurants';

const PRICE = ['', '$', '$$', '$$$', '$$$$'];

/** Continuous star fill — matches the fractional rating precisely. */
function StarRating({ rating }) {
  const pct = (rating / 5) * 100;
  return (
    <div className="relative inline-flex text-base leading-none select-none" aria-label={`${rating} out of 5 stars`}>
      <span className="text-white/15 tracking-tight">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden text-yellow-400 tracking-tight"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </div>
  );
}

/** Extract just the hostname from a URL for compact display. */
function domainOnly(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function SkiDining({ resort, isGoogleLoaded }) {
  const { t } = useTranslation();
  const { restaurants, isLoading, error } = useNearbyRestaurants(resort, isGoogleLoaded);

  return (
    <div>
      {/* Header */}
      <h3 className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
        <UtensilsCrossed size={12} />
        {t('dining.title')} {resort.name}
      </h3>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-white/40 text-sm py-6 justify-center">
          <Loader2 size={16} className="animate-spin" />
          {t('dining.loading')}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="glass-card p-4 text-white/40 text-sm text-center">{error}</div>
      )}

      {/* No results */}
      {!isLoading && !error && restaurants.length === 0 && (
        <div className="glass-card p-5 text-white/30 text-sm text-center">
          {t('dining.noResults')}
        </div>
      )}

      {/* Place cards */}
      {!isLoading && restaurants.length > 0 && (
        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {restaurants.map((r, i) => (
            <motion.div
              key={r.placeId}
              variants={cardVariants}
              className="glass-card p-4 flex flex-col sm:flex-row sm:items-start gap-3"
            >
              {/* Rank badge */}
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  background: i === 0 ? 'rgba(253,203,110,0.2)' : i === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                  color:      i === 0 ? '#fdcb6e' : i === 1 ? '#b2bec3' : 'rgba(255,255,255,0.4)',
                  border:     `1px solid ${i === 0 ? 'rgba(253,203,110,0.3)' : i === 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                #{i + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-sm leading-snug">{r.name}</div>
                    {r.vicinity && (
                      <div className="text-white/35 text-xs mt-0.5 truncate">{r.vicinity}</div>
                    )}
                  </div>
                  {r.priceLevel != null && (
                    <span className="text-white/40 text-xs font-medium shrink-0">
                      {PRICE[r.priceLevel]}
                    </span>
                  )}
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <StarRating rating={r.rating} />
                  <span className="text-yellow-400 text-xs font-bold">{r.rating.toFixed(1)}</span>
                  <span className="text-white/30 text-xs">
                    ({r.totalRatings.toLocaleString()} {r.totalRatings === 1 ? t('dining.review') : t('dining.reviews')})
                  </span>
                  {r.openNow !== null && (
                    <span className={`text-xs font-medium ${r.openNow ? 'text-green-400/70' : 'text-red-400/60'}`}>
                      · {r.openNow ? t('dining.openNow') : t('dining.closed')}
                    </span>
                  )}
                </div>

                {/* Website + Phone */}
                {(r.website || r.phone) && (
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {r.website && (
                      <a
                        href={r.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-300/60 hover:text-blue-300 text-xs transition-colors duration-150"
                      >
                        <Globe size={10} />
                        <span className="truncate max-w-[140px]">{domainOnly(r.website)}</span>
                      </a>
                    )}
                    {r.phone && (
                      <a
                        href={`tel:${r.phone}`}
                        className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs transition-colors duration-150"
                      >
                        <Phone size={10} />
                        {r.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
