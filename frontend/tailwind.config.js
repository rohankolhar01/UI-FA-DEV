/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F7FA',      // app background
        surface: '#FFFFFF',    // cards, panels
        ink: '#0F172A',        // primary text
        brand: '#1D4ED8',      // primary blue
        brandDark: '#1E3A8A',  // hover / emphasis
        brandSoft: '#EFF4FF',  // tinted fills
        rule: '#E2E8F0',       // borders, dividers
        muted: '#64748B',      // secondary text
        withdrawal: '#DC2626', // debits
        deposit: '#059669',    // credits
        warn: '#B45309',       // over-budget
      },
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        raised: '0 4px 12px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
}
