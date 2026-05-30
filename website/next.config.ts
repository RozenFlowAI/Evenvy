import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://party-place-finder.preview.emergentagent.com/api',
  },
  async redirects() {
    return [
      { source: '/search', destination: '/budget-planner', permanent: false },
      { source: '/search/:path*', destination: '/budget-planner', permanent: false },
      { source: '/venue', destination: '/budget-planner', permanent: false },
      { source: '/venue/:id', destination: '/budget-planner', permanent: false },
      { source: '/pentru-proprietari', destination: '/budget-planner', permanent: false },
      { source: '/dashboard/add-venue', destination: '/budget-planner', permanent: false },
      { source: '/dashboard/edit-venue/:path*', destination: '/budget-planner', permanent: false },
      { source: '/my-quotes', destination: '/budget-planner', permanent: false },
    ];
  },
};

export default nextConfig;
