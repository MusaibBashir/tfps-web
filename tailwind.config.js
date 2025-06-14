/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}", 
    "*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Orange theme colors
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // Main orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
          DEFAULT: "#f97316",
          foreground: "#ffffff",
        },
        // Dark colors
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        // Accent colors
        accent: {
          50: "#fef3c7",
          100: "#fde68a",
          200: "#fcd34d",
          300: "#fbbf24",
          400: "#f59e0b",
          500: "#d97706",
          600: "#b45309",
          700: "#92400e",
          800: "#78350f",
          900: "#451a03",
          DEFAULT: "#d97706",
          foreground: "#ffffff",
        },
        // shadcn/ui required colors
        border: "hsl(214.3 31.8% 91.4%)",
        input: "hsl(214.3 31.8% 91.4%)",
        ring: "#f97316",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
      },
      backgroundImage: {
        "gradient-orange": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        "gradient-orange-dark": "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
        "gradient-black": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        "gradient-orange-black": "linear-gradient(135deg, #f97316 0%, #1e293b 100%)",
        "gradient-orange-light": "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
        "gradient-card": "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        "gradient-card-hover": "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-in": "slideIn 0.6s ease-out",
        "float": "float 6s ease-in-out infinite",
        "gradient": "gradient 8s ease infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
