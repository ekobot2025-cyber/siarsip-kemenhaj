/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // haji.go.id / Kemenhaj Official Design Tokens
        kemenhaj: {
          gold: '#c9a961',
          goldDark: '#b8941e',
          goldOchre: '#967412',
          goldBronze: '#8a6d2b',
          champagne: '#fbf8ee',
          ivory: '#fefcf7',
          obsidian: '#1A1410',
          obsidianLight: '#2A2018',
          base: '#FAF9F5',
          border: '#e8dfc8',
          textMuted: '#786c5e',
          green: '#059669',
          greenLight: '#ecfdf5',
        },
        kemenag: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        papua: {
          gold: '#c9a961',
          goldDark: '#b8941e',
          goldLight: '#fbf8ee',
          teal: '#0e7490',
          navy: '#1A1410',
          clay: '#9c4125',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
