import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#04060d',
          900: '#070a12',
          850: '#0b0f1a',
          800: '#101521',
          700: '#171d2c',
          600: '#222a3d',
        },
        nexus: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          emerald: '#34d399',
          amber: '#fbbf24',
          rose: '#fb7185',
          sky: '#38bdf8',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glass: '0 18px 48px -24px rgba(0,0,0,0.9), inset 0 1px 0 0 rgba(255,255,255,0.05)',
        glow: '0 0 0 1px rgba(34,211,238,0.25), 0 0 28px -6px rgba(34,211,238,0.45)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        aurora:
          'radial-gradient(60rem 40rem at 12% -10%, rgba(34,211,238,0.16), transparent 60%), radial-gradient(50rem 34rem at 92% 8%, rgba(167,139,250,0.16), transparent 62%), radial-gradient(46rem 30rem at 55% 108%, rgba(52,211,153,0.10), transparent 60%)',
      },
      backgroundSize: { grid: '34px 34px' },
      keyframes: {
        pulseRing: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.04)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 2.8s ease-in-out infinite',
        shimmer: 'shimmer 2.4s infinite',
        floaty: 'floaty 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
