import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        purple: "#603AAB",
        darkblue: "#100240",
        gray: "#696969",
      },
      backgroundColor: {
        purple: "#603AAB",
        darkblue: "#100240",
      },
      fontFamily: {
        geist: "Geist",
        onest: "Onest",
      },
      animation: {
        expand: "expand 2s infinite ease-in-out",
      },
      keyframes: {
        expand: {
          "0%, 100%": { transform: "scale(0.9)" },
          "50%": { transform: "scale(1.3)" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
