/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F7FA',      // app background (fallback / text contexts)
        surface: '#FFFFFF',    // cards, panels
        ink: '#0F172A',        // primary text
        brand: '#4F46E5',      // primary indigo
        brandDark: '#3730A3',  // hover / emphasis
        brandSoft: '#EEF2FF',  // tinted fills
        brand2: '#8B5CF6',     // violet — gradient partner for brand
        brand3: '#06B6D4',     // cyan — accent gradient partner
        rule: '#E2E8F0',       // borders, dividers
        // These three sit on translucent glass, not solid white. Each is a step
        // darker than the usual slate/emerald/red so small text still clears
        // WCAG AA 4.5:1 once the card composites over the gradient behind it.
        muted: '#556072',      // secondary text
        withdrawal: '#C81E1E', // debits
        deposit: '#047857',    // credits
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
