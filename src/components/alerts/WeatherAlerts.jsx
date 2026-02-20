import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SEVERITY_STYLES = {
  Extreme: { border: '#e74c3c', bg: 'rgba(231,76,60,0.15)',  text: '#ff7675', label: 'alerts.extreme' },
  Severe:  { border: '#e17055', bg: 'rgba(225,112,85,0.15)', text: '#fab1a0', label: 'alerts.severe'  },
  Moderate:{ border: '#fdcb6e', bg: 'rgba(253,203,110,0.15)',text: '#ffeaa7', label: 'alerts.moderate' },
  Minor:   { border: '#74b9ff', bg: 'rgba(116,185,255,0.12)',text: '#a8d8ff', label: 'alerts.minor'   },
};

const fallback = SEVERITY_STYLES.Minor;

function formatExpiry(isoStr, locale) {
  if (!isoStr) return null;
  try {
    return new Date(isoStr).toLocaleString(locale, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return null;
  }
}

function AlertCard({ alert, onDismiss }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';
  const style  = SEVERITY_STYLES[alert.severity] ?? fallback;
  const expiry = formatExpiry(alert.expires, locale);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18 } }}
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${style.border}40`, background: style.bg }}
    >
      {/* Severity bar */}
      <div className="h-1 w-full" style={{ background: style.border }} />

      <div className="px-4 py-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: style.border }} />

          <div className="flex-1 min-w-0">
            {/* Severity badge + event */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ color: style.border, background: `${style.border}20` }}
              >
                {t(style.label)}
              </span>
              <span className="text-white/80 text-sm font-semibold">{alert.event}</span>
            </div>

            {/* Headline */}
            {alert.headline && (
              <p className="text-white/60 text-xs mt-1 leading-snug">{alert.headline}</p>
            )}

            {/* Expiry */}
            {expiry && (
              <p className="text-white/35 text-[10px] mt-1">
                {t('alerts.expires')}: {expiry}
              </p>
            )}

            {/* Description (expandable) */}
            <AnimatePresence>
              {expanded && alert.description && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{    opacity: 0, height: 0 }}
                  className="text-white/55 text-xs mt-2 leading-relaxed overflow-hidden"
                >
                  {alert.description}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Expand toggle */}
            {alert.description && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-[10px] font-medium mt-2 transition-colors"
                style={{ color: style.text }}
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expanded ? t('alerts.less') : t('alerts.details')}
              </button>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-white/25 hover:text-white/60 transition-colors shrink-0 p-0.5"
            aria-label={t('alerts.dismiss')}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function WeatherAlerts({ alerts, isLoading }) {
  const [dismissed, setDismissed] = useState(new Set());

  const visible = alerts.filter(a => !dismissed.has(a.id));

  if (isLoading || visible.length === 0) return null;

  function dismiss(id) {
    setDismissed(prev => new Set([...prev, id]));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col gap-2"
    >
      <AnimatePresence mode="popLayout">
        {visible.map(alert => (
          <AlertCard key={alert.id} alert={alert} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
