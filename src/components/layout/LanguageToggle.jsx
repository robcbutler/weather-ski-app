import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className="flex items-center gap-0.5 glass-card px-1 py-1">
      {['en', 'fr'].map((lang) => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={`
            px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide
            transition-all duration-200
            ${current === lang
              ? 'bg-white/20 text-white'
              : 'text-white/35 hover:text-white/70'}
          `}
          aria-label={lang === 'en' ? 'English' : 'Français'}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
