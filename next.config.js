const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@oddmaki-protocol/sdk"],
  // TODO: Remove turbopack.root when using the stable @oddmaki-protocol/sdk from npm
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

module.exports = nextConfig;
