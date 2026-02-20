import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import { useGeocoding } from '../../hooks/useGeocoding';
import SearchResult from './SearchResult';

export default function CitySearch() {
  const { t } = useTranslation();
  const { state, setQuery, selectCity, setSearchOpen } = useWeather();
  const { query, searchOpen } = state;
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [highlighted, setHighlighted] = useState(-1);

  const { results, isSearching } = useGeocoding(query);

  // Keyboard navigation
  function handleKeyDown(e) {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      selectCity(results[highlighted]);
      setHighlighted(-1);
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      inputRef.current?.blur();
    }
  }

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current  && !inputRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [setSearchOpen]);

  // Reset highlight on new results
  useEffect(() => setHighlighted(-1), [results]);

  const showDropdown = searchOpen && query.trim().length >= 2;

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      {/* Input */}
      <div className="relative flex items-center glass-card overflow-hidden">
        <Search size={18} className="absolute left-4 text-white/50 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className="
            w-full bg-transparent text-white placeholder-white/40
            pl-11 pr-10 py-3.5 outline-none
          "
          style={{ fontSize: '16px' }}
          aria-label={t('search.ariaLabel')}
          autoComplete="off"
        />
        {isSearching ? (
          <Loader2 size={16} className="absolute right-4 text-white/50 animate-spin" />
        ) : query ? (
          <button
            onClick={() => { setQuery(''); setSearchOpen(false); inputRef.current?.focus(); }}
            className="absolute right-4 text-white/40 hover:text-white/80 transition-colors"
            aria-label={t('search.ariaLabelClear')}
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute w-full top-full mt-2 glass-card overflow-hidden z-50 shadow-2xl"
          >
            {results.map((r, i) => (
              <SearchResult
                key={r.id ?? i}
                result={r}
                isHighlighted={i === highlighted}
                onSelect={(city) => {
                  selectCity(city);
                  setHighlighted(-1);
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
