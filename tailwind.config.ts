import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        foreground: "#f1f5f9",
        card: {
          DEFAULT: "rgba(15, 23, 42, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        tactical: {
          blue: "#38bdf8",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          violet: "#8b5cf6",
          slate: "#1e293b",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 20px -5px rgba(56, 189, 248, 0.3)",
        "glow-emerald": "0 0 20px -5px rgba(16, 185, 129, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
