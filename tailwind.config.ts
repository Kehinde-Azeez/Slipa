import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      /* ----------------------------------------------------------------
         All values reference CSS variables from tokens/.
         Never hardcode hex values here — change tokens, not this file.
         ---------------------------------------------------------------- */

      colors: {
        brand: {
          ink:        'var(--color-brand-ink)',
          green:      'var(--color-brand-green)',
          'green-dark': 'var(--color-brand-green-dark)',
          'green-tint': 'var(--color-brand-green-tint)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt:     'var(--color-surface-alt)',
          muted:   'var(--color-surface-muted)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border-strong)',
        },
        error:   {
          DEFAULT: 'var(--color-error)',
          bg:      'var(--color-error-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg:      'var(--color-warning-bg)',
        },
        info:    {
          DEFAULT: 'var(--color-info)',
          bg:      'var(--color-info-bg)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          bg:      'var(--color-success-bg)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        xs:   ['var(--text-xs)',   { lineHeight: 'var(--leading-tight)'  }],
        sm:   ['var(--text-sm)',   { lineHeight: 'var(--leading-normal)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        lg:   ['var(--text-lg)',   { lineHeight: 'var(--leading-tight)'  }],
        xl:   ['var(--text-xl)',   { lineHeight: 'var(--leading-tight)'  }],
        '2xl':['var(--text-2xl)', { lineHeight: 'var(--leading-tight)'  }],
      },

      spacing: {
        1:  'var(--space-1)',
        2:  'var(--space-2)',
        3:  'var(--space-3)',
        4:  'var(--space-4)',
        6:  'var(--space-6)',
        8:  'var(--space-8)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
      },

      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        DEFAULT: 'var(--radius-md)',
        lg:   'var(--radius-lg)',
        full: 'var(--radius-full)',
      },

      transitionDuration: {
        micro:     'var(--duration-micro)',
        entrance:  'var(--duration-entrance)',
        celebrate: 'var(--duration-celebrate)',
      },

      transitionTimingFunction: {
        DEFAULT: 'var(--ease-default)',
        out:     'var(--ease-out)',
        spring:  'var(--ease-spring)',
      },

      minHeight: {
        touch: 'var(--touch-target)',
      },

      minWidth: {
        touch: 'var(--touch-target)',
      },
    },
  },
  plugins: [],
}

export default config
