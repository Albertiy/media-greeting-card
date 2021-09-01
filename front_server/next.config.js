const path = require('path');
let config = require('./config/application.config.json');
let server = config.server ? config.server : '';

console.log('back server: ' + server);

/**
 * @type {import{'next'}.NextConfig}
 */
module.exports = {
  // reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: server + '/api/:path*',
      },
      {
        source: '/:slug(MP_verify_\\S*.txt)',
        destination: server + '/:slug',
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/index',
        permanent: true
      },
    ]
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  }
}
