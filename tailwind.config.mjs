// precisian-blog/tailwind.config.mjs
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      colors: {
        bg: {
          base: 'var(--bg)',
          elevated: 'var(--bg-elevated)',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          muted: 'var(--fg-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        border: 'var(--border)',
        code: {
          bg: 'var(--code-bg)',
        },
      },
      maxWidth: {
        prose: '68ch',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--fg)',
            '--tw-prose-headings': 'var(--fg)',
            '--tw-prose-links': 'var(--accent)',
            '--tw-prose-bold': 'var(--fg)',
            '--tw-prose-code': 'var(--accent)',
            '--tw-prose-quotes': 'var(--fg-muted)',
            '--tw-prose-hr': 'var(--border)',
            maxWidth: '68ch',
            fontSize: '1.125rem',
            lineHeight: '1.75',
          },
        },
      },
    },
  },
  plugins: [typography],
}
