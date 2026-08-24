/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
<<<<<<< HEAD
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070b14',
          900: '#0b1220',
          850: '#0f1729',
          800: '#131c33',
          700: '#1c2842',
          600: '#27375a',
          500: '#38507f',
        },
        risk: {
          safe: '#10b981',
          low: '#84cc16',
          moderate: '#eab308',
          high: '#f97316',
          severe: '#ef4444',
          extreme: '#b91c1c',
        },
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(56, 80, 127, 0.45)',
      },
    },
=======
    extend: {},
>>>>>>> b83f93ae018790b6db8060a8cb9dc3c0197e0603
  },
  plugins: [],
};
