import { getPool, sql } from "../lib/db.js";

export default async function handler(req, res) {
  // Add CORS headers to allow cross-origin requests from your frontend domain
  res.setHeader('Access-Control-Allow-Origin', 'https://thinkbit-woad.vercel.app/contact.html'); // Replace '*' with your frontend URL for stricter security
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { Name = "", Email = "", Message = "" } = req.body || {};

    const pool = await getPool();

    await pool
      .request()
      .input("Name", sql.NVarChar, Name)
      .input("Email", sql.NVarChar, Email)
      .input("Message", sql.NVarChar, Message)
      .query(`
        INSERT INTO ContactMessages (Name, Email, Message, CreatedAt)
        VALUES (@Name, @Email, @Message, GETDATE())
      `);

    return res.status(200).json({ success: true, message: "Message saved successfully!" });
  } catch (err) {
    console.error("❌ Contact Form Error:", err);
    return res.status(500).json({ success: false, message: "Failed to save message" });
  }
}
