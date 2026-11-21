import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        karaoke: {
          purple: "#7c3aed",
          pink: "#db2777",
          dark: "#0f172a",
          card: "#1e293b",
          neon: "#a855f7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
