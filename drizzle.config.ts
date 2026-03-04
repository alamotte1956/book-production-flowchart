import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    url: process.env.DATABASE_URL || ""
  }
});
