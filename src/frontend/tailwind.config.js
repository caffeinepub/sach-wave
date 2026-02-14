/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'accent-blue': 'oklch(var(--accent-blue))',
        'accent-purple': 'oklch(var(--accent-purple))',
        'accent-cyan': 'oklch(var(--accent-cyan))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        'premium': '0 8px 32px oklch(0 0 0 / 0.3), 0 0 0 1px oklch(1 0 0 / 0.05)',
        'premium-lg': '0 12px 48px oklch(0 0 0 / 0.4), 0 0 0 1px oklch(1 0 0 / 0.08)',
        'glow-blue': '0 0 24px oklch(0.60 0.28 250 / 0.3), 0 8px 32px oklch(0 0 0 / 0.3)',
        'glow-purple': '0 0 24px oklch(0.55 0.28 285 / 0.3), 0 8px 32px oklch(0 0 0 / 0.3)',
        'glow-gold': '0 0 20px oklch(0.70 0.20 80 / 0.4), 0 8px 32px oklch(0 0 0 / 0.3)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'ring-pulse': 'ring-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'shimmer-slow': 'shimmer-slow 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        'ring-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'shimmer-slow': {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
