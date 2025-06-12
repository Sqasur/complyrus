#!/usr/bin/env node

// Database seeding script
// Usage: npm run seed

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env.local") });

// Import and run seeding
import seedDatabase from "../src/lib/seed.js";

async function runSeed() {
  try {
    console.log("🌱 Starting database seeding...\n");
    await seedDatabase();
    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();
