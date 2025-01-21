import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.css'],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))'
      },
      colors: {
        // blue: {
        //   400: '#2589FE',
        //   500: '#0070F3',
        //   600: '#2F6FEB',
        // },
      },
      fontSize: {
        xxs: '0.625rem', // Custom extra-extra-small size (10px)
        xxx: '0.5rem' // Custom xxx-small size (8px)
      }
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
export default config
