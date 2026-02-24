/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1C2D',
        gold: '#D4AF37',
        'gold-soft': '#E5C770',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.12)',
        card: '0 18px 40px rgba(15, 23, 42, 0.08)',
        subtle: '0 10px 25px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
