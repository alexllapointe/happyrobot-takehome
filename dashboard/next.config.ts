import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin file tracing to this package so Next doesn't walk up to the repo
  // root (where the shadcn CLI's package-lock lives) and emit a workspace
  // warning. process.cwd() is always defined; __dirname isn't reliable in
  // Next's TS config loader.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
