import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mountain, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SKI_RESORTS, RESORTS_BY_PROVINCE, PROVINCE_ORDER } from '../../data/skiResorts';

export default function SkiResortDropdown({ selected, onSelect }) {
  const { t } = useTranslation();
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const searchRef         = useRef(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 80);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') close(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function close() { setOpen(false); setQuery(''); }

  function handleSelect(resort) {
    onSelect(resort);
    close();
  }

  // Province name from translations
  function provinceName(code) {
    return t(`provinces.${code}`, { defaultValue: code });
  }

  const filtered = query.trim()
    ? SKI_RESORTS.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        provinceName(r.province).toLowerCase().includes(query.toLowerCase()) ||
        r.province.toLowerCase().includes(query.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name))
    : null;

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Centered modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.95,    y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md flex flex-col rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'rgba(15, 25, 50, 0.92)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.14)',
                maxHeight: '70vh',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 text-white/70">
                  <Mountain size={15} />
                  <span className="text-sm font-semibold">{t('ski.selectResort')}</span>
                </div>
                <button
                  onClick={close}
                  className="text-white/35 hover:text-white/80 transition-colors p-1 rounded-lg hover:bg-white/10"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search input */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/10 shrink-0">
                <Search size={14} className="text-white/40 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t('ski.searchResort')}
                  className="bg-transparent text-white placeholder-white/30 text-sm outline-none flex-1"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Resort list */}
              <div className="overflow-y-auto flex-1">
                {filtered ? (
                  filtered.length > 0 ? filtered.map(r => (
                    <ResortRow key={r.id} resort={r} onSelect={handleSelect} selected={selected} t={t} />
                  )) : (
                    <div className="px-4 py-10 text-center text-white/30 text-sm">
                      {t('ski.noMatch')} &ldquo;{query}&rdquo;
                    </div>
                  )
                ) : (
                  PROVINCE_ORDER.filter(p => RESORTS_BY_PROVINCE[p]).map(province => (
                    <div key={province}>
                      <div className="px-4 py-1.5 text-white/30 text-[10px] font-semibold uppercase tracking-widest sticky top-0"
                        style={{ background: 'rgba(15,25,50,0.95)' }}
                      >
                        {provinceName(province)}
                      </div>
                      {RESORTS_BY_PROVINCE[province].map(r => (
                        <ResortRow key={r.id} resort={r} onSelect={handleSelect} selected={selected} t={t} />
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="
          w-full glass-card flex items-center justify-between
          px-4 py-3.5 text-left transition-all duration-200
          hover:bg-white/12
        "
      >
        <div className="flex items-center gap-3">
          <Mountain size={16} className="text-white/50 shrink-0" />
          {selected ? (
            <div>
              <div className="text-white text-sm font-medium">{selected.name}</div>
              <div className="text-white/40 text-xs">{provinceName(selected.province)}</div>
            </div>
          ) : (
            <span className="text-white/40 text-sm">{t('ski.selectPrompt')}</span>
          )}
        </div>
        <ChevronDown size={16} className="text-white/40" />
      </button>

      {/* Modal rendered in a portal so it escapes any stacking context */}
      {createPortal(modal, document.body)}
    </>
  );
}

function ResortRow({ resort, onSelect, selected, t }) {
  const isSelected = selected?.id === resort.id;
  return (
    <button
      onClick={() => onSelect(resort)}
      className={`
        w-full flex items-center justify-between px-4 py-2.5 text-left
        transition-colors duration-100 border-b border-white/5 last:border-0
        ${isSelected ? 'bg-white/15' : 'hover:bg-white/10'}
      `}
    >
      <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-white/80'}`}>
        {resort.name}
      </span>
      <span className="text-white/30 text-xs ml-2 shrink-0">
        {resort.totalRuns} {t('ski.runs')}
      </span>
    </button>
  );
}
