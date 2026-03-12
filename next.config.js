/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose', '@apollo/server'],
  },
  webpack: (config, { isServer }) => {
    // face-api.js needs canvas on server side
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    // Ignore fs module on client side (used by face-api)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
