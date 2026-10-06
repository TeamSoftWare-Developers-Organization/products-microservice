import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-auth/react$': path.resolve(__dirname, 'src/lib/next-auth-react.tsx'),
      'next-auth-react-original': path.resolve(__dirname, 'node_modules/next-auth/react/index.js'),
    };
    return config;
  },
};

export default nextConfig;
