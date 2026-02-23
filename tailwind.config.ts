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
        background: "#1a0e08",
        surface: "#522e1b",
        "surface-light": "#593a25",
        primary: "#c39767",
        accent: "#6c261f",
        text: "#ECEBE9",
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "Orbitron", "system-ui", "sans-serif"],
        sans: ["var(--font-kumbh)", "Kumbh Sans", "system-ui", "sans-serif"],
        ui: ["var(--font-teko)", "Teko", "Oswald", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "Roboto Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "cube-spin": "cubeSpin 20s linear infinite",
        "typewriter": "typewriter 3s steps(40) 1s forwards",
        "led-spin": "ledSpin 6s linear infinite",
        "led-pulse": "ledPulse 2.5s ease-in-out infinite",
        "dash": "dash 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(195,151,103,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(195,151,103,0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        cubeSpin: {
          "0%": { transform: "rotateX(-20deg) rotateY(0deg)" },
          "100%": { transform: "rotateX(-20deg) rotateY(360deg)" },
        },
        typewriter: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        ledSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        ledPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        dash: {
          "0%": { strokeDashoffset: "1050" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
