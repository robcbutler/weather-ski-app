/**
 * Returns a CSS color hex string based on temperature in Celsius.
 */
export function getTempColor(tempC) {
  if (tempC < -20) return '#a8d8ea';   // icy blue
  if (tempC < 0)   return '#74b9ff';   // steel blue
  if (tempC < 15)  return '#55efc4';   // mint
  if (tempC < 25)  return '#fdcb6e';   // amber
  if (tempC < 35)  return '#e17055';   // coral
  return '#d63031';                     // hot red
}

/**
 * Returns a Tailwind-style inline style object with the temp color.
 */
export function getTempStyle(tempC) {
  return { color: getTempColor(tempC) };
}

/**
 * Computes summary stats for a set of hourly indices within a segment.
 * @param {object} hourlyData - full hourly data from Open-Meteo
 * @param {number[]} indices - array of hour indices to include
 * @returns {{ avgTemp, minTemp, maxTemp, dominantCode, avgPrecipProb, avgWindspeed }}
 */
export function computeSegmentStats(hourlyData, indices) {
  if (!indices.length) return null;

  const temps = indices.map(i => hourlyData.temperature_2m[i]).filter(t => t != null);
  const precipProbs = indices.map(i => hourlyData.precipitation_probability[i]).filter(p => p != null);
  const winds = indices.map(i => hourlyData.windspeed_10m[i]).filter(w => w != null);
  const codes = indices.map(i => hourlyData.weathercode[i]).filter(c => c != null);

  // Most frequent WMO code in segment
  const codeFreq = {};
  codes.forEach(c => { codeFreq[c] = (codeFreq[c] || 0) + 1; });
  const dominantCode = codes.reduce((a, b) => (codeFreq[a] >= codeFreq[b] ? a : b), codes[0] ?? 0);

  const avg = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
  const sum = (arr) => arr.reduce((s, v) => s + v, 0);

  // Precipitation totals for the segment period
  const precipAmounts  = indices.map(i => hourlyData.precipitation[i] ?? 0);
  const snowfallAmounts = indices.map(i => hourlyData.snowfall?.[i]  ?? 0);
  const totalPrecip    = +sum(precipAmounts).toFixed(1);   // mm
  const totalSnowfall  = +sum(snowfallAmounts).toFixed(1); // cm

  return {
    avgTemp:       temps.length ? Math.round(avg(temps)) : null,
    minTemp:       temps.length ? Math.round(Math.min(...temps)) : null,
    maxTemp:       temps.length ? Math.round(Math.max(...temps)) : null,
    dominantCode,
    avgPrecipProb: precipProbs.length ? Math.round(avg(precipProbs)) : 0,
    avgWindspeed:  winds.length ? Math.round(avg(winds)) : 0,
    totalPrecip,
    totalSnowfall,
  };
}
