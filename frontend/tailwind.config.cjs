/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      colors: {
        primary: {
          500: "#6366F1",
          600: "#4F46E5",
        },
        accent: {
          500: "#22D3EE",
          600: "#0EA5E9",
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(79, 70, 229, 0.4)",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #1F2937 0%, #111827 35%, #312E81 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(14, 165, 233, 0.3))",
      },
    },
  },
  plugins: [],
};

