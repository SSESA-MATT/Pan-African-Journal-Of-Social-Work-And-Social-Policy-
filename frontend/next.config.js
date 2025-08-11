/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Exclude backend directory from compilation
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    config.module.rules.push({
      test: /\.ts$/,
      exclude: [/node_modules/, /src\/backend/],
    });

    return config;
  },
};

module.exports = nextConfig;