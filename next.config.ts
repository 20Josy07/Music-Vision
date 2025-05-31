
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // Spotify image CDN
        port: '',
        pathname: '/image/**',
      }
    ],
  },
  experimental: {
    // Remove allowedDevOrigins from here if it was previously, or ensure this object is used for other valid experimental flags.
    // For now, let's keep it minimal or for actual experimental features.
    // If no other experimental flags are needed, this can be an empty object or removed.
  },
  allowedDevOrigins: [
      // Origins from the error log
      "https://6000-firebase-studio-1748216508502.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev",
      "https://9000-firebase-studio-1748216508502.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev",
      // It might be beneficial to add localhost with common ports if you test locally outside IDX too
      "http://localhost:6000", // Example common port for web services
      "http://localhost:9000", // Example common port for other services
      "http://localhost:9002", // The port your Next.js app runs on
  ],
  webpack: (config, { webpack }) => {
    // Ensures plugins array exists
    config.plugins = config.plugins || []; 
    
    // Add IgnorePlugin for the specific optional module
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@opentelemetry\/exporter-jaeger$/,
      })
    );

    // Suppress specific warnings from dependencies
    if (!config.ignoreWarnings) {
      config.ignoreWarnings = [];
    }
    config.ignoreWarnings.push({
      module: /node_modules\/handlebars\/lib\/index\.js$/,
      message: /require\.extensions is not supported by webpack/,
    });

    return config;
  },
};

export default nextConfig;
