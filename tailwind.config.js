/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Outfit'", "sans-serif"],
      },
      colors: {
        water: {
          50: "#eff8ff",
          100: "#dbeefe",
          200: "#bfe3fe",
          300: "#93d1fd",
          400: "#60b5fa",
          500: "#3b96f6",
          600: "#2578eb",
          700: "#1d62d8",
          800: "#1e50af",
          900: "#1e448a",
          950: "#172b54",
        },
      },
    },
  },
  plugins: [],
};
