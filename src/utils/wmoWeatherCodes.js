/**
 * WMO Weather Interpretation Codes (WW)
 * Maps code → { label, icon (emoji), nightIcon (emoji), category, particle }
 * Categories: clear | cloudy | fog | rain | snow | storm
 * Particles: none | sun | rain | snow | storm
 *
 * nightIcon is only set for sky-condition codes where the icon
 * is sun-dependent (codes 0-2). All rain/snow/storm icons are
 * the same day or night.
 */
export const WMO_CODES = {
  0:  { label: 'Clear Sky',              icon: '☀️',  nightIcon: '🌙',  category: 'clear',  particle: 'sun'   },
  1:  { label: 'Mainly Clear',           icon: '🌤️',  nightIcon: '🌙',  category: 'clear',  particle: 'sun'   },
  2:  { label: 'Partly Cloudy',          icon: '⛅',  nightIcon: '🌙',  category: 'cloudy', particle: 'none'  },
  3:  { label: 'Overcast',               icon: '☁️',                    category: 'cloudy', particle: 'none'  },
  45: { label: 'Foggy',                  icon: '🌫️',                    category: 'fog',    particle: 'none'  },
  48: { label: 'Icy Fog',                icon: '🌫️',                    category: 'fog',    particle: 'none'  },
  51: { label: 'Light Drizzle',          icon: '🌦️',                    category: 'rain',   particle: 'rain'  },
  53: { label: 'Moderate Drizzle',       icon: '🌦️',                    category: 'rain',   particle: 'rain'  },
  55: { label: 'Dense Drizzle',          icon: '🌧️',                    category: 'rain',   particle: 'rain'  },
  56: { label: 'Freezing Drizzle',       icon: '🌧️',                    category: 'rain',   particle: 'rain'  },
  57: { label: 'Heavy Freezing Drizzle', icon: '🌧️',                    category: 'rain',   particle: 'rain'  },
  61: { label: 'Slight Rain',            icon: '🌧️',                    category: 'rain',   particle: 'rain'  },
  63: { label: 'Moderate Rain',          icon: '🌧️',                    category: 'rain',   particle: 'rain'  },
  65: { label: 'Heavy Rain',             icon: '🌧️',                    category: 'rain',   particle: 'rain'  },
  66: { label: 'Freezing Rain',          icon: '🌨️',                    category: 'rain',   particle: 'rain'  },
  67: { label: 'Heavy Freezing Rain',    icon: '🌨️',                    category: 'rain',   particle: 'rain'  },
  71: { label: 'Slight Snowfall',        icon: '🌨️',                    category: 'snow',   particle: 'snow'  },
  73: { label: 'Moderate Snowfall',      icon: '❄️',                    category: 'snow',   particle: 'snow'  },
  75: { label: 'Heavy Snowfall',         icon: '❄️',                    category: 'snow',   particle: 'snow'  },
  77: { label: 'Snow Grains',            icon: '🌨️',                    category: 'snow',   particle: 'snow'  },
  80: { label: 'Slight Rain Showers',    icon: '🌦️',                    category: 'rain',   particle: 'rain'  },
  81: { label: 'Moderate Rain Showers',  icon: '🌧️',                    category: 'rain',   particle: 'rain'  },
  82: { label: 'Violent Rain Showers',   icon: '⛈️',                    category: 'storm',  particle: 'storm' },
  85: { label: 'Slight Snow Showers',    icon: '🌨️',                    category: 'snow',   particle: 'snow'  },
  86: { label: 'Heavy Snow Showers',     icon: '❄️',                    category: 'snow',   particle: 'snow'  },
  95: { label: 'Thunderstorm',           icon: '⛈️',                    category: 'storm',  particle: 'storm' },
  96: { label: 'Thunderstorm w/ Hail',   icon: '⛈️',                    category: 'storm',  particle: 'storm' },
  99: { label: 'Thunderstorm w/ Heavy Hail', icon: '⛈️',               category: 'storm',  particle: 'storm' },
};

/**
 * Returns weather info for a WMO code, with a safe fallback.
 * @param {number} code - WMO weather code
 * @param {boolean} isNight - if true, returns nightIcon for sky-condition codes
 */
export function getWeatherInfo(code, isNight = false) {
  const info = WMO_CODES[code] ?? { label: 'Unknown', icon: '🌡️', category: 'clear', particle: 'none' };
  if (isNight && info.nightIcon) {
    return { ...info, icon: info.nightIcon };
  }
  return info;
}
