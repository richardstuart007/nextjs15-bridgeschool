export const URL_current = 'https://nextjs15-bridgeschool.vercel.app'
export const URL_old1 = 'nextjs-bridgeschool.vercel.app'
export const URL_old2 = 'nextjs14-bridgeschool.vercel.app'

const redirectsConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: URL_old1
          }
        ],
        destination: `${URL_current}/:path*`,
        permanent: true
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: URL_old2
          }
        ],
        destination: `${URL_current}/:path*`,
        permanent: true
      }
    ]
  }
}

const config = {
  env: {
    CUSTOM_ENV: process.env.CUSTOM_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL
  },
  ...redirectsConfig
}

export default config
