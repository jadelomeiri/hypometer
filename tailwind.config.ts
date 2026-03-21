import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f5f7fb',
        foreground: '#111827',
        card: '#ffffff',
        border: '#dbe1ea',
        muted: '#6b7280',
        primary: '#2563eb',
        accent: '#7c3aed',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
      },
      boxShadow: {
        panel: '0 20px 45px -25px rgba(15, 23, 42, 0.25)',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
