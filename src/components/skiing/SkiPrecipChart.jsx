import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, ReferenceLine,
} from 'recharts';

// ── WMO code sets ─────────────────────────────────────────────────────────────
const SNOW_CODES  = new Set([71, 73, 75, 77, 85, 86]);
const RAIN_CODES  = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]);
const MIXED_CODES = new Set([56, 57, 66, 67]); // freezing rain / sleet

function getPrecipType(weatherCode, snowfall, amount) {
  if (MIXED_CODES.has(weatherCode)) return 'mixed';
  if (SNOW_CODES.has(weatherCode))  return 'snow';
  if (RAIN_CODES.has(weatherCode))  return 'rain';
  if (snowfall > 0 && amount > 0)   return 'mixed';
  if (snowfall > 0)                  return 'snow';
  if (amount   > 0)                  return 'rain';
  return 'none';
}

// ── Colours ───────────────────────────────────────────────────────────────────
const SNOW_COLOR  = 'rgba(162,155,254,0.80)';
const MIXED_COLOR = 'rgba(100,210,210,0.80)';

function rainColor(probability) {
  if (probability > 70) return 'rgba(116,185,255,0.85)';
  if (probability > 40) return 'rgba(116,185,255,0.55)';
  return 'rgba(116,185,255,0.30)';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatHourLabel(hour, locale) {
  if (locale === 'fr-CA') return hour === 0 ? '0h' : `${hour}h`;
  if (hour === 0)  return '12a';
  if (hour === 12) return '12p';
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

function getDayLabel(dateStr, locale) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(locale, { weekday: 'short' });
}

const TICK_INDICES = Array.from({ length: 12 }, (_, i) => i * 6);

// ── Tooltip ───────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, locale, t }) {
  if (!active || !payload?.length) return null;
  const { hour, date, probability, snowfall, amount, weatherCode } = payload[0]?.payload ?? {};
  const type = getPrecipType(weatherCode, snowfall, amount);

  return (
    <div className="glass-card px-3 py-2 text-xs text-white/90 shadow-xl">
      <div className="font-semibold mb-0.5">
        {getDayLabel(date, locale)} · {formatHourLabel(hour, locale)}
      </div>
      <div className="mb-0.5">
        {t('chart.precipChance')}: <span className="text-blue-300">{probability}%</span>
      </div>
      {(type === 'snow' || type === 'mixed') && snowfall > 0 && (
        <div className="text-purple-300">{t('chart.snow')}: {snowfall} cm</div>
      )}
      {type === 'rain' && amount > 0 && (
        <div className="text-blue-300">{t('chart.rain')}: {amount} mm</div>
      )}
      {type === 'mixed' && amount > 0 && (
        <div className="text-blue-300/80">{t('chart.rain')}: {amount} mm</div>
      )}
    </div>
  );
}

// ── X-axis tick ───────────────────────────────────────────────────────────────
function CustomXAxisTick({ x, y, payload, precipChart, locale }) {
  const entry = precipChart[payload.value];
  if (!entry) return null;
  const label = entry.hour === 0 ? getDayLabel(entry.date, locale) : formatHourLabel(entry.hour, locale);
  return (
    <text
      x={x} y={y + 10}
      textAnchor="middle"
      fill={entry.hour === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)'}
      fontSize={entry.hour === 0 ? 11 : 10}
      fontWeight={entry.hour === 0 ? '600' : '400'}
    >
      {label}
    </text>
  );
}

// ── Chart ─────────────────────────────────────────────────────────────────────
export default function SkiPrecipChart({ precipChart }) {
  const { t, i18n } = useTranslation();
  if (!precipChart?.length) return null;

  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';

  const dayBoundaries = precipChart
    .filter(d => d.hour === 0 && d.index > 0)
    .map(d => d.index);

  // Only show legend swatches for types actually present in this forecast
  const typesPresent = new Set(
    precipChart
      .filter(d => d.probability > 0 || d.snowfall > 0 || d.amount > 0)
      .map(d => getPrecipType(d.weatherCode, d.snowfall, d.amount))
      .filter(t => t !== 'none')
  );

  return (
    <div>
      <h3 className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2">
        {t('ski.precipChart')}
      </h3>
      <div className="glass-card p-4">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={precipChart}
            dataKey="index"
            barSize={5}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            {dayBoundaries.map(idx => (
              <ReferenceLine key={idx} x={idx} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" />
            ))}
            <XAxis
              dataKey="index"
              ticks={TICK_INDICES}
              tick={<CustomXAxisTick precipChart={precipChart} locale={locale} />}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={v => `${v}%`}
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip locale={locale} t={t} />}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="probability" radius={[3, 3, 0, 0]}>
              {precipChart.map((entry, i) => {
                const type = getPrecipType(entry.weatherCode, entry.snowfall, entry.amount);
                return (
                  <Cell
                    key={i}
                    fill={
                      type === 'snow'  ? SNOW_COLOR :
                      type === 'mixed' ? MIXED_COLOR :
                      rainColor(entry.probability)
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend — only shows types present in this forecast */}
        {typesPresent.size > 0 && (
          <div className="flex items-center gap-4 mt-2 text-[10px] text-white/30">
            {typesPresent.has('snow') && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: SNOW_COLOR }} />
                {t('chart.snow')} (cm)
              </span>
            )}
            {typesPresent.has('rain') && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'rgba(116,185,255,0.7)' }} />
                {t('chart.rain')} (mm)
              </span>
            )}
            {typesPresent.has('mixed') && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: MIXED_COLOR }} />
                {t('chart.mixed')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
