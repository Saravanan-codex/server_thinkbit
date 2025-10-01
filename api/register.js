// api/register.js
import { getPool, sql } from "../lib/db.js";



export default async function handler(req, res) {
  // CORS headers to allow cross-origin API calls
  res.setHeader('Access-Control-Allow-Origin', 'https://thinkbit-woad.vercel.app/register.html'); // Or specify your frontend URL for security
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const pool = await getPool();

    // Always query to get last-used counters (no in-memory variables!)
    const studentResult = await pool.request().query(`
      SELECT TOP 1 StudentId FROM Registrations
      WHERE StudentId IS NOT NULL
      ORDER BY TRY_CAST(SUBSTRING(StudentId, 3, LEN(StudentId)) AS INT) DESC
    `);

    const teamResult = await pool.request().query(`
      SELECT TOP 1 TeamId FROM Registrations
      WHERE TeamId IS NOT NULL
      ORDER BY TRY_CAST(SUBSTRING(TeamId, 4, LEN(TeamId)) AS INT) DESC
    `);

    let studentCounter = 1;
    if (studentResult.recordset.length > 0) {
      studentCounter = parseInt(studentResult.recordset[0].StudentId.replace("MZ", "")) + 1;
    }

    let teamCounter = 1;
    if (teamResult.recordset.length > 0) {
      teamCounter = parseInt(teamResult.recordset[0].TeamId.replace("MZT", "")) + 1;
    }

    const {
      Name,
      CollegeName,
      Department,
      Year,
      Contact,
      Events,
      TeamName,
      TeamId,
      payment,
    } = req.body;

    const eventsStr = Array.isArray(Events)
      ? Events.join(", ")
      : (Events || "");

    // Generate Student ID (always fresh)
    const studentId = "MZ" + String(studentCounter).padStart(2, "0");

    // Determine Team ID
    let finalTeamId = null;

    if (TeamId && TeamId.trim() !== "") {
      const existingTeam = await pool
        .request()
        .input("TeamId", sql.NVarChar, TeamId.trim().toUpperCase())
        .query("SELECT TOP 1 TeamId FROM Registrations WHERE TeamId=@TeamId");

      if (existingTeam.recordset.length > 0) {
        finalTeamId = TeamId.trim().toUpperCase();
      } else {
        finalTeamId = "MZT" + String(teamCounter).padStart(2, "0");
        teamCounter++;
      }
    } else if (TeamName && TeamName.trim() !== "") {
      const existingTeamByName = await pool
        .request()
        .input("TeamName", sql.NVarChar, TeamName.trim())
        .query(
          "SELECT TOP 1 TeamId FROM Registrations WHERE LOWER(TeamName)=LOWER(@TeamName)"
        );

      if (existingTeamByName.recordset.length > 0) {
        finalTeamId = existingTeamByName.recordset[0].TeamId;
      } else {
        finalTeamId = "MZT" + String(teamCounter).padStart(2, "0");
        teamCounter++;
      }
    }

    // Insert into DB
    await pool
      .request()
      .input("StudentId", sql.NVarChar, studentId)
      .input("TeamId", sql.NVarChar, finalTeamId)
      .input("Name", sql.NVarChar, Name || "")
      .input("CollegeName", sql.NVarChar, CollegeName || "")
      .input("Department", sql.NVarChar, Department || "")
      .input("Year", sql.NVarChar, Year || "")
      .input("Contact", sql.NVarChar, Contact || "")
      .input("Events", sql.NVarChar, eventsStr)
      .input("TeamName", sql.NVarChar, TeamName || "")
      .input("PaymentTransactionId", sql.NVarChar, payment || "")
      .query(`
        INSERT INTO Registrations
        (StudentId, TeamId, Name, CollegeName, Department, Year, Contact, Events, TeamName, PaymentTransactionId)
        VALUES (@StudentId,@TeamId,@Name,@CollegeName,@Department,@Year,@Contact,@Events,@TeamName,@PaymentTransactionId)
      `);

    return res
      .status(200)
      .json({ success: true, studentId, teamId: finalTeamId });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}
