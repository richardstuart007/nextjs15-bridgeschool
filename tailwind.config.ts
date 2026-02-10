import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.css'],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))'
      },
      colors: {
        'sand-light': '#FBBF24',
        'sand-dark': '#F59E0B',
        'glass-light': '#E5E7EB',
        'glass-dark': '#9CA3AF'
      },
      fontSize: {
        xxs: '0.625rem',
        xxx: '0.5rem'
      }
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)'
        }
      },
      flip: {
        '0%, 100%': { transform: 'rotateY(0deg)' },
        '50%': { transform: 'rotateY(180deg)' }
      }
    },
    animation: {
      flip: 'flip 2s ease-in-out infinite',
      pulse: 'pulse 1.5s ease-in-out infinite'
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
export default config
