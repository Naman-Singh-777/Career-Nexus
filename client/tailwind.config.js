/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    // Not the default Tailwind scale. This is a fluid, ratio-derived type
    // system (major third, 1.25) instead of the stock text-xl/2xl steps.
    fontSize: {
      xs: "clamp(0.72rem, 0.68rem + 0.2vw, 0.8rem)",
      sm: "clamp(0.85rem, 0.8rem + 0.25vw, 0.95rem)",
      base: "clamp(1rem, 0.95rem + 0.3vw, 1.125rem)",
      md: "clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)",
      lg: "clamp(1.6rem, 1.4rem + 1vw, 2.1rem)",
      xl: "clamp(2.1rem, 1.7rem + 2vw, 3rem)",
      "2xl": "clamp(2.8rem, 2.1rem + 3.5vw, 4.6rem)",
      "3xl": "clamp(3.6rem, 2.6rem + 5vw, 6.4rem)",
    },
    extend: {
      colors: {
        carbon: {
          DEFAULT: "#080a10",
          soft: "#0d1018",
          raised: "#12151f",
          line: "rgba(255,255,255,0.08)",
        },
        signal: {
          amber: "#f2a65a",
          rose: "#e8618c",
          cyan: "#5fd4d6",
          violet: "#8b7cf6",
        },
        ink: {
          DEFAULT: "#eef0f4",
          dim: "#9aa1b2",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
        mono: ["'Space Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        body: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
        snap: "cubic-bezier(0.68, -0.15, 0.27, 1.15)",
      },
      boxShadow: {
        glow: "0 0 80px -20px var(--tw-shadow-color)",
      },
    },
  },
  plugins: [],
};
