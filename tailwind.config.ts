import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8ec1ff",
          400: "#599dff",
          500: "#3478f6",
          600: "#1f5be0",
          700: "#1a48c0",
          800: "#1b3d9b",
          900: "#1c377b"
        }
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(31, 91, 224, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
