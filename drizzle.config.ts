import type { Config } from "drizzle-kit";

const config = {
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://appistic_dev:appistic_dev@127.0.0.1:5432/appistic_dev",
  },
};

export default config;
