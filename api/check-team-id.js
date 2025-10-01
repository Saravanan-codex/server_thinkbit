import { getPool, sql } from "../lib/db.js";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://thinkbit-woad.vercel.app/register.html'); // Replace '*' with frontend URL if desired
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = (req.query.id || "").toUpperCase();
  if (!id) return res.status(400).json({ error: "Missing team ID" });

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("TeamId", sql.NVarChar, id)
      .query("SELECT TOP 1 TeamId FROM Registrations WHERE TeamId=@TeamId");

    res.status(200).json({ exists: result.recordset.length > 0 });
  } catch (err) {
    console.error("Error checking team ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
