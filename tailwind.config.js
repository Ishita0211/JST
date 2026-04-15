import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        primary: "#0891B2",
      },
    },
  },
  plugins: [],
};
export default config;
