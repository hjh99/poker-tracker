// prisma.config.ts  ← sits at your project ROOT (next to package.json)
// Required for Prisma v7+ — the database URL moved out of schema.prisma
 
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
 
export default defineConfig({
  schema: "./src/prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
 