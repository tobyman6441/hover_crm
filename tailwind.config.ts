import type { Config } from "tailwindcss";
import { brand } from "./lib/brand";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: brand.colors,
      fontFamily: brand.typography.fontFamily,
      fontSize: brand.typography.fontSize,
      spacing: brand.spacing,
      borderRadius: brand.borderRadius,
    },
  },
  plugins: [],
};

export default config; 