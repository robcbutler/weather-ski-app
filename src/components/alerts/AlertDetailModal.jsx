import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CORS_PROXY = 'https://corsproxy.io/?url=';

const SEVERITY_STYLES = {
  Extreme: { border: '#e74c3c', bg: 'rgba(231,76,60,0.15)',  text: '#ff7675', label: 'alerts.extreme' },
  Severe:  { border: '#e17055', bg: 'rgba(225,112,85,0.15)', text: '#fab1a0', label: 'alerts.severe'  },
  Moderate:{ border: '#fdcb6e', bg: 'rgba(253,203,110,0.15)',text: '#ffeaa7', label: 'alerts.moderate' },
  Minor:   { border: '#74b9ff', bg: 'rgba(116,185,255,0.12)',text: '#a8d8ff', label: 'alerts.minor'   },
};
const fallbackStyle = SEVERITY_STYLES.Minor;

function formatExpiry(isoStr, locale) {
  if (!isoStr) return null;
  try {
    return new Date(isoStr).toLocaleString(locale, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return null; }
}

// ── Extract full alert text from EC warning page ──────────────────────────────
// EC page embeds Vue SSR data as:  window.__INITIAL_STATE__={...};
// Note: no spaces around '=' in the actual HTML.
function extractInitialState(html) {
  // Locate the marker (no spaces around =)
  const marker = 'window.__INITIAL_STATE__=';
  const idx = html.indexOf(marker);
  if (idx === -1) return null;

  const braceStart = html.indexOf('{', idx + marker.length);
  if (braceStart === -1) return null;

  // Walk forward counting braces — lazy regex fails on nested JSON
  let depth = 0;
  let end   = braceStart;
  for (; end < html.length; end++) {
    if      (html[end] === '{') depth++;
    else if (html[end] === '}') { depth--; if (depth === 0) break; }
  }

  try {
    return JSON.parse(html.slice(braceStart, end + 1));
  } catch {
    return null;
  }
}

async function fetchAlertBody(url) {
  if (!url) return null;
  const baseUrl = url.split('#')[0];
  const hash    = url.split('#')[1] ?? '';
  // Zone code is everything after '?' and before '#'  (e.g. "onrm104")
  const zone    = baseUrl.split('?')[1] ?? '';

  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(baseUrl)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const state = extractInitialState(html);
  if (!state) return null;

  const zoneData = state?.alert?.alert?.[zone];
  if (!zoneData?.alerts?.length) return null;

  // Match by UUID (URL hash) or fall back to the first alert in the zone
  const entry =
    zoneData.alerts.find(a => a.uuid === hash) ??
    zoneData.alerts[0];

  return entry?.text?.trim() ?? null;
}

// ── Modal component ───────────────────────────────────────────────────────────
export default function AlertDetailModal({ alert, onClose }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';
  const style  = SEVERITY_STYLES[alert?.severity] ?? fallbackStyle;
  const expiry = formatExpiry(alert?.expires, locale);

  const [body,    setBody]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed,  setFailed]  = useState(false);

  // Close on ESC
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Fetch body text from EC warning page
  useEffect(() => {
    if (!alert?.url) return;
    setLoading(true);
    setFailed(false);
    fetchAlertBody(alert.url)
      .then(text => { setBody(text); setLoading(false); })
      .catch(() => { setFailed(true); setLoading(false); });
  }, [alert?.url]);

  if (!alert) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="
          glass-card w-full sm:max-w-lg
          flex flex-col
          rounded-b-none sm:rounded-2xl rounded-t-2xl
          overflow-hidden
        "
        style={{
          maxHeight: 'calc(100dvh - env(safe-area-inset-top) - 1rem)',
          borderColor: `${style.border}40`,
        }}
        initial={{ y: 80, scale: 0.97 }}
        animate={{ y: 0,  scale: 1 }}
        exit={{ y: 80, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Severity colour bar */}
        <div className="h-1 w-full shrink-0" style={{ background: style.border }} />

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-4 pb-3 shrink-0">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: style.border }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ color: style.border, background: `${style.border}20` }}
              >
                {t(style.label)}
              </span>
              <span className="text-white/90 text-sm font-semibold leading-snug">
                {alert.event}
              </span>
            </div>
            {expiry && (
              <p className="text-white/35 text-[10px] mt-1">
                {t('alerts.expires')}: {expiry}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors shrink-0 p-0.5"
            aria-label={t('alerts.dismiss')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px mx-5 bg-white/10 shrink-0" />

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-white/40">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {!loading && body && (
            <pre className="text-white/75 text-xs leading-relaxed whitespace-pre-wrap font-sans">
              {body}
            </pre>
          )}

          {!loading && !body && (
            <p className="text-white/40 text-sm text-center py-6">
              {failed
                ? 'Could not load alert details.'
                : 'No additional details available.'}
            </p>
          )}
        </div>

        {/* Safe-area spacer on iPhone */}
        <div className="shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </motion.div>
    </motion.div>
  );
}
