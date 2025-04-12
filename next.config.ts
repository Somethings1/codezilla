import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    compiler: {
        styledComponents: true, // css-in-js runtime optimization
    },
};

export default nextConfig;
