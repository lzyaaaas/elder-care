/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fbf7ef",
          100: "#f4edde",
        },
        ink: {
          950: "#17202c",
          900: "#223042",
          800: "#314256",
        },
        pine: {
          700: "#2d5b4f",
          800: "#21463c",
          900: "#19332c",
        },
        terracotta: {
          500: "#c96d4c",
          600: "#b85735",
        },
        gold: {
          300: "#dcc58f",
          400: "#c9ad67",
        },
        mist: {
          100: "#eef2f6",
          200: "#dde5ec",
          300: "#c7d4df",
        },
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 32, 44, 0.08)",
        panel: "0 24px 50px rgba(23, 32, 44, 0.08)",
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at top left, rgba(220,197,143,0.25), transparent 35%), radial-gradient(circle at bottom right, rgba(45,91,79,0.12), transparent 32%)",
      },
      animation: {
        rise: "rise 0.8s ease-out both",
        drift: "drift 8s ease-in-out infinite",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
