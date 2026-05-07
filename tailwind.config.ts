import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Pretendard Variable",
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
      colors: {
        ink: {
          bg: "#ffffff",
          fg: "#1f2328",
          muted: "#5b6370",
          code: "#f6f7f9",
          border: "#e5e7eb",
        },
        nightInk: {
          bg: "#0f1115",
          fg: "#e6e7ea",
          muted: "#9aa3b2",
          code: "#161922",
          border: "#252a35",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
