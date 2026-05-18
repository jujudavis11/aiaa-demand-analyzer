import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        electric: '#7C3AED',
        charcoal: '#111827',
        fire: '#F97316',
        silver: '#CBD5E1'
      }
    }
  },
  plugins: []
} satisfies Config;
