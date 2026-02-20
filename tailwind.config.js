/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ice-blue': '#a8d8ea',
        'steel-blue': '#74b9ff',
        'mint': '#55efc4',
        'amber': '#fdcb6e',
        'coral': '#e17055',
        'hot-red': '#d63031',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        rainFall: {
          '0%': { transform: 'translateY(-100vh)', opacity: '0.7' },
          '100%': { transform: 'translateY(100vh)', opacity: '0.3' },
        },
        snowFall: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '0.9' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0.3' },
        },
        sunRay: {
          '0%': { opacity: '0', transform: 'scaleY(0)' },
          '50%': { opacity: '0.3' },
          '100%': { opacity: '0', transform: 'scaleY(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'rain-fall': 'rainFall linear infinite',
        'snow-fall': 'snowFall linear infinite',
        'sun-ray': 'sunRay 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
