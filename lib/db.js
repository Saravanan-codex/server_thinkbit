// lib/db.js
import sql from "mssql";

// --- SQL Server Config ---
// ⚠️ IMPORTANT: Use Environment Variables in Vercel Dashboard for security
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,      // for Azure SQL
    trustServerCertificate: true, // change to false in production if SSL is strict
  },
};

// Global connection pool (avoid multiple pools on hot reload in dev)
let pool;

export async function getPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw new Error("DB_CONNECTION_ERROR");
  }
}

export { sql };
