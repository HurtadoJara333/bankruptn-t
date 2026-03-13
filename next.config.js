/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'canvas',
        'face-api.js',
        '@tensorflow/tfjs',
      ];
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:     false,
        path:   false,
        crypto: false,
        buffer: false,
      };
    }

    config.ignoreWarnings = [
      { module: /node_modules\/@tensorflow/ },
    ];

    return config;
  },
};

module.exports = nextConfig;