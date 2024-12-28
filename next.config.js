const URL_new = 'https://nextjs15-bridgeschool.vercel.app'
const URL_old1 = 'nextjs-bridgeschool.vercel.app'
const URL_old2 = 'nextjs14-bridgeschool.vercel.app'
module.exports = {
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
        destination: URL_new,
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
        destination: URL_new,
        permanent: true
      }
    ]
  }
}
