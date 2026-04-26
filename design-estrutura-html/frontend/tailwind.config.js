/** Tailwind — NC Control design tokens */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        nc: {
          bg: '#0F1419',
          panel: '#F6F7F8',
          surface: '#FFFFFF',
          ink: '#0F1419',
          'ink-2': '#3D4852',
          'ink-3': '#6B7480',
          muted: '#9AA3AE',
          line: '#E4E7EB',
          'line-strong': '#C9CFD6',
          accent: '#D97706',
          'accent-soft': '#FEF3E2',
          critical: '#B91C1C',
          'critical-soft': '#FEE2E2',
          medium: '#CA8A04',
          'medium-soft': '#FEF9C3',
          low: '#64748B',
          'low-soft': '#F1F5F9',
          ok: '#15803D',
          'ok-soft': '#DCFCE7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: { none: '0', sm: '2px', DEFAULT: '2px' },
    },
  },
  plugins: [],
};
