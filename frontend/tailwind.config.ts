/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      gridTemplateRows: {
        full: "minmax(100px, 100%)",
        "60-40": "minmax(100px, 60%) minmax(100px, 40%)"
      }
    },
  },
  plugins: [],
};
