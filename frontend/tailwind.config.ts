import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          background: "#F7F7F9",
          surface: "#FFFFFF",
          primary: "#10B981",
          accent: "#EF4444",
          warning: "#F59E0B",
          error: "#EF4444",
          text: "#111827"
        }
      },
      boxShadow: {
        card: "0 8px 24px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
