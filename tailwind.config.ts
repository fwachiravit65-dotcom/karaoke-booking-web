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
        alabaster: "#F7F5F0",
        stone: "#EFECE6",
        ink: "#121212",
        muted: "#68645E",
        accent: "#D9381E",
      },
      fontFamily: {
        display: ["'Nunito'", "'Mitr'", "'Prompt'", "sans-serif"],
        sans: ["'Nunito'", "'Prompt'", "-apple-system", "sans-serif"],
        mono: ["'Nunito'", "'Prompt'", "sans-serif"],
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
