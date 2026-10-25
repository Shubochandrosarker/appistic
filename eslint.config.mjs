import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: ["docs/**", "drizzle/**", "tests/**", "scripts/**"],
  },
];

export default config;
