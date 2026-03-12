import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Mint (primary)
        mint: {
          50:  '#f0fdf6',
          100: '#dcfce8',
          200: '#bbf7d4',
          300: '#86efb8',
          400: '#3df5b0',  // ← main mint neon
          500: '#00c47a',  // ← primary action
          600: '#00a366',
          700: '#007a4d',
          800: '#005c3a',
          900: '#003d27',
        },
        // Night blue (complementary)
        night: {
          50:  '#e8eaf6',
          100: '#c5c9e8',
          200: '#9fa6d9',
          300: '#7783ca',
          400: '#5a67be',
          500: '#3d4cb2',
          600: '#2e3a9a',
          700: '#1e2878',
          800: '#141a56',
          900: '#0f0f1a',  // ← darkest bg
          950: '#070710',  // ← deepest bg
        },
        // Semantic
        danger: '#ff6b6b',
        warning: '#ffd93d',
        surface: '#0f0f1a',
        card:    '#13132b',
        border:  '#1e1e3f',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'mint-glow':    'radial-gradient(ellipse at center, rgba(61,245,176,0.15) 0%, transparent 70%)',
        'card-shine':   'linear-gradient(135deg, rgba(61,245,176,0.05) 0%, rgba(255,255,255,0) 50%)',
        'grid-pattern': 'linear-gradient(rgba(61,245,176,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(61,245,176,0.04) 1px, transparent 1px)',
      },
      boxShadow: {
        'mint-sm':  '0 0 10px rgba(61,245,176,0.2)',
        'mint-md':  '0 0 25px rgba(61,245,176,0.3)',
        'mint-lg':  '0 0 50px rgba(61,245,176,0.25)',
        'card':     '0 4px 24px rgba(0,0,0,0.4)',
        'inset-top':'inset 0 1px 0 rgba(61,245,176,0.1)',
      },
      animation: {
        'pulse-mint':   'pulse-mint 2s ease-in-out infinite',
        'slide-up':     'slide-up 0.4s ease-out',
        'fade-in':      'fade-in 0.3s ease-out',
        'number-tick':  'number-tick 0.6s ease-out',
        'scan-line':    'scan-line 2s linear infinite',
      },
      keyframes: {
        'pulse-mint': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(61,245,176,0.2)' },
          '50%':       { boxShadow: '0 0 30px rgba(61,245,176,0.5)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'number-tick': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
