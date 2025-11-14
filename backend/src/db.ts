// Database connection using PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "./shared/schema";

// Load DATABASE_URL from environment variable
// Example: postgresql://username:password@localhost:5432/hms_db
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please set it in your .env file.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
