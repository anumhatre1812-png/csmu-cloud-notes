/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF9A86",
        secondary: "#ECB390",
        background: "#FFF8F5",
        surface: "rgba(255,255,255,0.75)",
        textPrimary: "#2D1B14",
        textSecondary: "#7A5C50",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
