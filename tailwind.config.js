/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "var(--theme-bg)",
          surface: "var(--theme-surface)",
          "surface-card": "var(--theme-surface-card)",
          border: "var(--theme-border)",
          primary: "var(--theme-primary)",
          "primary-hover": "var(--theme-primary-hover)",
          "primary-light": "var(--theme-primary-light)",
          secondary: "var(--theme-secondary)",
          accent: "var(--theme-accent)",
          text: "var(--theme-text)",
          "text-muted": "var(--theme-text-muted)",
        },
      },
      borderRadius: {
        cute: "1.25rem",
        cuter: "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(236, 72, 153, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        glow: "0 0 25px -5px var(--theme-primary-light)",
        float: "0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.05)",
      },
      keyframes: {
        floatHeart: {
          "0%": { transform: "translateY(0) scale(0.8)", opacity: "1" },
          "100%": { transform: "translateY(-60px) scale(1.2)", opacity: "0" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "float-heart": "floatHeart 1s ease-out forwards",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
