import { getPool, sql } from "../lib/db.js";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://thinkbit-woad.vercel.app/register.html'); // Replace '*' with your frontend URL as needed
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const team = req.query.team;
  if (!team) return res.status(400).json({ error: "Missing team name" });

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("TeamName", sql.NVarChar, team)
      .query("SELECT TOP 1 TeamId FROM Registrations WHERE LOWER(TeamName)=LOWER(@TeamName)");

    res.status(200).json({ exists: result.recordset.length > 0 });
  } catch (err) {
    console.error("Error checking team name:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
