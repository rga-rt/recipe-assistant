import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        ceramic: '#FAF8F3',
        chalk: '#FFFFFF',
        kale: '#1C2A21',
        basil: { DEFAULT: '#3D7A4E', 600: '#336B43', 700: '#2A5A38' },
        saffron: { DEFAULT: '#E7A13A', soft: '#FBEACB' },
        tomato: '#D6482F',
        stone: { 100: '#F2EFE8', 200: '#E9E5DC', 300: '#D8D2C6', 500: '#8C877C', 600: '#6B665C' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,42,33,0.04), 0 8px 24px -12px rgba(28,42,33,0.12)',
        lift: '0 8px 30px -10px rgba(28,42,33,0.22)',
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
