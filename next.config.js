/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  resolve: {
    alias: {
      // fixes problem with outdated react-dnd version
      // see https://github.com/react-dnd/react-dnd/issues/3433
      // can be removed if edtr is on react-dnd 16
      'react/jsx-runtime.js': 'react/jsx-runtime',
      'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
    },
  },
}

module.exports = nextConfig
