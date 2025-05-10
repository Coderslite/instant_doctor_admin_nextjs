import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  // output: 'export', // for static site generation
  images: {
    unoptimized: true, // disable image optimization
  },
};

export default withFlowbiteReact(nextConfig);
