import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        "prose-narrow": "640px",
        "prose-normal": "760px",
        "prose-wide": "920px",
      },
      letterSpacing: {
        kicker: "0.22em",
      },
      colors: {
        // Editorial Monochrome — light
        ink: {
          bg: "#ffffff",
          fg: "#0a0a0a",
          muted: "#525252",
          subtle: "#737373",
          surface: "#fafafa",
          code: "#fafafa",
          border: "#e5e5e5",
          point: "#1d4ed8",
        },
        // Editorial Monochrome — dark (calm dark gray, not pitch black)
        nightInk: {
          bg: "#23262c",
          fg: "#e7e8ec",
          muted: "#a4a8b1",
          subtle: "#6f7480",
          surface: "#2d3139",
          code: "#2a2d34",
          border: "#3a3e47",
          point: "#7aa7ff",
        },
      },
    },
  },
  safelist: [
    "md-width-narrow",
    "md-width-normal",
    "md-width-wide",
    "md-font-s",
    "md-font-m",
    "md-font-l",
  ],
  plugins: [],
} satisfies Config;
