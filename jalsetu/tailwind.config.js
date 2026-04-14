/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        jal: {
          50:  '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fd',
          300: '#93d1fb',
          400: '#60b7f6',
          500: '#3b97f0',
          600: '#2478e4',
          700: '#1c62d1',
          800: '#1d50aa',
          900: '#1e4586',
          950: '#162c52',
        },
        ocean: {
          light: '#e0f2fe',
          mid:   '#38bdf8',
          deep:  '#0369a1',
        }
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(59,151,240,0.15)',
        card: '0 2px 16px rgba(0,0,0,0.07)',
        glow: '0 0 32px rgba(59,151,240,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'ripple': 'ripple 1.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%':   { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
