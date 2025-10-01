import { getPool } from "../lib/db.js";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://thinkbit-woad.vercel.app/register.html'); // set frontend URL for stricter security
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM Registrations ORDER BY CreatedAt DESC");

    const students = result.recordset.map(r => ({
      ...r,
      Events: r.Events ? r.Events.split(",").map(e => e.trim()) : []
    }));

    res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ error: "Error fetching students" });
  }
}
