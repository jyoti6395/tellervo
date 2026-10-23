/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f3f7f4',
          100: '#e4eee6',
          200: '#c7dcd0',
          300: '#9ec1ae',
          400: '#71a187',
          500: '#4e8467',
          600: '#3c6951',
          700: '#325442',
          800: '#2a4436',
          900: '#1b3224',
          950: '#0e1d14',
        },
        boreal: {
          dark: '#16281D',
          card: '#1F3728',
          accent: '#D49B4E',
          cream: '#F7F5EE',
          sand: '#ECE8DD',
          subtle: '#6B7A6E',
          muted: '#8D9B90',
        },
        gold: {
          light: '#F8DC96',
          DEFAULT: '#E5A953',
          dark: '#C78931',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Cormorant Garamond', 'Georgia', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(22, 40, 29, 0.06)',
        'soft': '0 4px 20px -2px rgba(22, 40, 29, 0.08)',
        'soft-lg': '0 10px 30px -4px rgba(22, 40, 29, 0.12)',
        'float': '0 12px 36px -4px rgba(22, 40, 29, 0.25)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
