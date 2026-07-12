/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        divider: "var(--divider)",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        status: {
          available: "hsl(var(--available))",
          allocated: "hsl(var(--allocated))",
          reserved: "hsl(var(--reserved))",
          maintenance: "hsl(var(--maintenance))",
          disposed: "hsl(var(--disposed))",
          lost: "hsl(var(--lost))",
        }
      },
      borderRadius: {
        card: "var(--radius-card)",
        btn: "var(--radius-btn)",
        input: "var(--radius-input)",
        table: "var(--radius-table)",
        modal: "var(--radius-modal)",
        chart: "var(--radius-chart)",
      },
      boxShadow: {
        custom: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        glow: "0 0 20px rgba(99, 102, 241, 0.12)",
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      fontFamily: {
        sans: ["'Public Sans'", "sans-serif"],
      },
      fontSize: {
        title: ["36px", { lineHeight: "1.5" }],
        section: ["28px", { lineHeight: "1.5" }],
        cardTitle: ["20px", { lineHeight: "1.5" }],
        navbar: ["16px", { lineHeight: "1.5" }],
        sidebar: ["15px", { lineHeight: "1.5" }],
        body: ["16px", { lineHeight: "1.5" }],
        tableHeader: ["14px", { lineHeight: "1.5" }],
        tableBody: ["14px", { lineHeight: "1.5" }],
        small: ["13px", { lineHeight: "1.5" }],
        button: ["15px", { lineHeight: "1.5" }],
      },
    },
  },
  plugins: [],
}
