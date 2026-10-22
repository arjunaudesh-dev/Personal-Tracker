import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: { 950: '#050714', 900: '#0a0d1f', 800: '#11152b' },
        neon: { cyan: '#22d3ee', violet: '#a78bfa', pink: '#f472b6', lime: '#a3e635', amber: '#fbbf24' },
      },
      fontFamily: { sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
      backgroundImage: {
        aurora:
          'radial-gradient(60% 50% at 10% 0%, rgba(34,211,238,0.22), transparent 60%), radial-gradient(50% 40% at 90% 10%, rgba(167,139,250,0.22), transparent 60%), radial-gradient(40% 40% at 50% 100%, rgba(244,114,182,0.14), transparent 70%)',
      },
      boxShadow: { glow: '0 0 40px -8px rgba(34,211,238,0.35)' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: { float: 'float 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
export default config;
