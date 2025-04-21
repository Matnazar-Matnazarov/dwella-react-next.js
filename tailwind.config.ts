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
        primary: {
          DEFAULT: "rgb(var(--primary-color))",
          dark: "rgb(var(--primary-dark-color))",
          light: "rgb(var(--primary-light-color))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary-color))",
          dark: "rgb(var(--secondary-dark-color))",
          light: "rgb(var(--secondary-light-color))",
        },
        accent: "rgb(var(--accent-color))",
        error: "rgb(var(--error-color))",
        success: "rgb(var(--success-color))",
        warning: "rgb(var(--warning-color))",
        info: "rgb(var(--info-color))",
      },
      fontFamily: {
        sans: ["Roboto", "Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
export default config; 