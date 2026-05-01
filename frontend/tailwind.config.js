/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Space Mono"', 'monospace'],
        'body': ['"IBM Plex Sans"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'bg': '#0a0a0f',
        'surface': '#111118',
        'border': '#1e1e2e',
        'accent': '#6ee7b7',
        'accent2': '#818cf8',
        'accent3': '#f472b6',
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',
        'text-muted': '#475569',
      },
      animation: {
        'scan': 'scan 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
