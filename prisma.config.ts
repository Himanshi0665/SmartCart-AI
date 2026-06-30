import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local for CLI commands like prisma migrate
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use direct (non-pooled) URL for migrations
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
