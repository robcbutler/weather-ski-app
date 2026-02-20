import { Thermometer, Wind, Layers, Snowflake, ExternalLink, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SkiConditionsPanel({ data, resort }) {
  const { t } = useTranslation();
  if (!data) return null;

  const { snowDepthCm, freshSnow24h, currentTemp, avgWind, conditions } = data;
  const { key: condKey, label, color, bg, openPct } = conditions;

  const estimatedOpen   = Math.round(resort.totalRuns * openPct);
  const estimatedClosed = resort.totalRuns - estimatedOpen;
  const condLabel = t(`conditions.${condKey}`, { defaultValue: label });

  return (
    <div className="flex flex-col gap-3">
      {/* Conditions header */}
      <h3 className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
        {t('ski.snowConditions')}
      </h3>

      {/* Rating badge + stats grid */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white/65 text-xs mb-1">{t('ski.conditionsRating')}</div>
            <div
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
              style={{ color, background: bg, border: `1px solid ${color}40` }}
            >
              {condLabel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/60 text-xs mb-1">{t('ski.verticalDrop')}</div>
            <div className="text-white/80 text-sm font-semibold">{resort.verticalDrop} m</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CondStat
            icon={<Layers size={14} />}
            label={t('ski.baseDepth')}
            value={snowDepthCm > 0 ? `${snowDepthCm} cm` : 'N/A'}
            note={snowDepthCm === 0 ? 'Model may underestimate' : null}
          />
          <CondStat
            icon={<Snowflake size={14} />}
            label={t('ski.newSnow24h')}
            value={freshSnow24h > 0 ? `${freshSnow24h} cm` : t('ski.noSnow')}
          />
          <CondStat
            icon={<Thermometer size={14} />}
            label={t('ski.temperature')}
            value={`${currentTemp}°C`}
          />
          <CondStat
            icon={<Wind size={14} />}
            label={t('ski.avgWind')}
            value={`${avgWind} km/h`}
          />
        </div>
      </div>

      {/* Runs estimate */}
      <h3 className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
        {t('ski.runStatus')}
      </h3>
      <div className="glass-card p-4">
        {/* Estimate bar */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-white/65 text-xs mb-1">
              {t('ski.estimatedOpen')}
              <span className="text-white/50 ml-1">{t('ski.conditionsBased')}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-light" style={{ color }}>~{estimatedOpen}</span>
              <span className="text-white/60 text-sm">
                {t('ski.of')} {resort.totalRuns} {t('ski.total')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/55 text-xs">{t('ski.estClosed')}</div>
            <div className="text-white/70 text-lg font-light">~{estimatedClosed}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.round(openPct * 100)}%`, background: color }}
          />
        </div>

        {/* Disclaimer + link */}
        <div className="flex items-start gap-2 pt-2 border-t border-white/10">
          <Info size={12} className="text-white/50 shrink-0 mt-0.5" />
          <p className="text-white/55 text-xs leading-relaxed">
            {t('ski.disclaimer')}
          </p>
        </div>
        <a
          href={resort.website}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-3 inline-flex items-center gap-1.5 text-xs font-medium
            text-blue-300/80 hover:text-blue-300 transition-colors duration-150
          "
        >
          {t('ski.officialStatus')} {resort.name}
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

function CondStat({ icon, label, value, note }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-white/55">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-white/90 text-sm font-semibold">{value}</div>
      {note && <div className="text-white/50 text-[10px]">{note}</div>}
    </div>
  );
}
