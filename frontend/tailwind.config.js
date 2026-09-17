/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Vibrant Saffron
          600: '#ea580c', // Deep Saffron / Clay
          700: '#c2410c', // Royal Spice
          800: '#9a3412',
          900: '#7c2d12',
          dark: '#1c1917',
          surface: '#fafaf9',
        },
        accent: {
          gold: '#eab308',
          amber: '#d97706',
          emerald: '#059669', // Veg Green
          ruby: '#dc2626',    // Non-Veg Red
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(249, 115, 22, 0.25)',
        'card-hover': '0 20px 30px -10px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'hero-pattern': "radial-gradient(ellipse at top, rgba(249, 115, 22, 0.15), transparent 70%)",
      },
      keyframes: {
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
      },
      animation: {
        shine: 'shine 5s linear infinite',
      },
    },
  },
  plugins: [],
}
