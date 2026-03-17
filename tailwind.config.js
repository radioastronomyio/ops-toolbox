/**
 * @file tailwind.config.js
 * @description Tailwind v3 config consuming HSL design tokens — default palette disabled
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      bg: 'hsl(var(--color-bg-base) / <alpha-value>)',
      surface: {
        1: 'hsl(var(--color-surface-1) / <alpha-value>)',
        2: 'hsl(var(--color-surface-2) / <alpha-value>)',
        3: 'hsl(var(--color-surface-3) / <alpha-value>)',
      },
      border: {
        subtle: 'hsl(var(--color-border-subtle) / <alpha-value>)',
        DEFAULT: 'hsl(var(--color-border-default) / <alpha-value>)',
        strong: 'hsl(var(--color-border-strong) / <alpha-value>)',
      },
      text: {
        primary: 'hsl(var(--color-text-primary) / <alpha-value>)',
        secondary: 'hsl(var(--color-text-secondary) / <alpha-value>)',
        muted: 'hsl(var(--color-text-muted) / <alpha-value>)',
      },
      accent: {
        DEFAULT: 'hsl(var(--color-accent-base) / <alpha-value>)',
        hover: 'hsl(var(--color-accent-hover) / <alpha-value>)',
        muted: 'hsl(var(--color-accent-muted) / <alpha-value>)',
        text: 'hsl(var(--color-accent-text) / <alpha-value>)',
      },
      status: {
        success: 'hsl(var(--color-success) / <alpha-value>)',
        error: 'hsl(var(--color-error) / <alpha-value>)',
        warning: 'hsl(var(--color-warning) / <alpha-value>)',
        info: 'hsl(var(--color-info) / <alpha-value>)',
      },
    },
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      full: '9999px',
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      none: '0 0 #0000',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-family-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-family-mono)', 'ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
