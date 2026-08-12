import type { Config } from 'tailwindcss'

// Focus PT — "Iron & Chalk" design system
// All colour, type, spacing and radius are semantic tokens, resolved through
// CSS variables in src/index.css so they can be reused verbatim in Lovable.

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
    },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          sunken: 'hsl(var(--surface-sunken))',
          raised: 'hsl(var(--surface-raised))',
        },
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          soft: 'hsl(var(--ink-soft))',
          faint: 'hsl(var(--ink-faint))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          subtle: 'hsl(var(--border-subtle))',
          strong: 'hsl(var(--border-strong))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          soft: 'hsl(var(--primary-soft))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          soft: 'hsl(var(--accent-soft))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          soft: 'hsl(var(--success-soft))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          soft: 'hsl(var(--warning-soft))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          soft: 'hsl(var(--destructive-soft))',
        },
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '900' }],
        'display-lg': ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.01em', fontWeight: '900' }],
        'display-md': ['1.75rem', { lineHeight: '1.1', letterSpacing: '0', fontWeight: '800' }],
        'display-sm': ['1.375rem', { lineHeight: '1.15', letterSpacing: '0', fontWeight: '800' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '800' }],
        'heading-md': ['1.125rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '700' }],
        'heading-sm': ['0.9375rem', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '700' }],
        'body-lg': ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        'body-md': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.45', letterSpacing: '0', fontWeight: '500' }],
        label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.06em', fontWeight: '700' }],
        eyebrow: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: '9999px',
      },
      borderWidth: {
        DEFAULT: '1px',
        2: '2px',
        3: '3px',
      },
      boxShadow: {
        plate: '0 1px 0 hsl(var(--ink) / 0.06)',
        card: '0 1px 2px hsl(var(--ink) / 0.04)',
        raised: '0 6px 16px hsl(var(--ink) / 0.10)',
      },
      transitionTimingFunction: {
        settle: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      keyframes: {
        'plate-settle': {
          '0%': { transform: 'translateY(-6px) scale(0.96)', opacity: '0' },
          '60%': { transform: 'translateY(1px) scale(1.01)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'pr-pop': {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '55%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.35)' },
          '100%': { boxShadow: '0 0 0 8px hsl(var(--primary) / 0)' },
        },
      },
      animation: {
        'plate-settle': 'plate-settle 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        'pr-pop': 'pr-pop 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
