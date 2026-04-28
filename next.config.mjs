/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['nextjs-shared'],
  cacheComponents: false,
  env: {
    CUSTOM_ENV: process.env.CUSTOM_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL
  },

  // Your existing redirects configuration
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'nextjs-bridgeschool.vercel.app' // URL_old1 value
          }
        ],
        destination: 'https://nextjs15-bridgeschool.vercel.app/:path*',
        permanent: true
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'nextjs14-bridgeschool.vercel.app' // URL_old2 value
          }
        ],
        destination: 'https://nextjs15-bridgeschool.vercel.app/:path*',
        permanent: true
      }
    ]
  }
}

export default config
