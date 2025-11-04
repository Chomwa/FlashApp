/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Zambian fintech colors
        emerald: "#00B15C",
        navy: "#02121B", 
        charcoal: "#0F1F2A",
        sky: "#4CC8FF",
        gold: "#FFCC33",
        success: "#00D97E",
        danger: "#FF4D4F",
        divider: "#1A2B36",
        muted: "#6F8A9A"
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  },
  plugins: []
}