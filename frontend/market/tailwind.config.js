/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        // adds a utility class `font-darker-grotesque`
        'darker-grotesque': ['"Darker Grotesque"', 'sans-serif']
      }
    },
  },
  plugins: [],
}

