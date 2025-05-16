const express = require("express");
const db = require("../db");
const router = express.Router();

/** 
 * GET /api/attendance/summary?date=YYYY-MM-DD
 * Fetch attendance summary for a specific date.
 */
router.get("/summary", (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing date" });
  }

  const query = `
    SELECT 
      a.user_id,
      u.FIRST_NAME,
      u.LAST_NAME,
      u.Sevakcode,
      u.CITY_AREA_VILLAGE,
      u.DISTRICT,
      u.STATE,
      COUNT(CASE WHEN a.slot = 'Morning_presentation' THEN 1 END) AS morning,
      COUNT(CASE WHEN a.slot = 'evening_presentation' THEN 1 END) AS evening
    FROM attendance a
    JOIN userdata u ON a.user_id = u.id
    WHERE DATE(a.timestamp) = ?
    GROUP BY a.user_id, u.FIRST_NAME, u.LAST_NAME, u.Sevakcode, u.CITY_AREA_VILLAGE, u.DISTRICT, u.STATE
  `;

  db.query(query, [date], (err, results) => {
    if (err) {
      console.error("Attendance summary error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    let morningCount = 0;
    let eveningCount = 0;
    let bothCount = 0;

    // Process data to return detailed attendance for each user
    const breakdown = results.map(row => {
      const morningPresent = row.morning > 0 ? "Y" : "N";
      const eveningPresent = row.evening > 0 ? "Y" : "N";
      const bothPresent = (row.morning > 0 && row.evening > 0) ? "Y" : "N";

      if (row.morning > 0) morningCount++;
      if (row.evening > 0) eveningCount++;
      if (row.morning > 0 && row.evening > 0) bothCount++;

      return {
        user_id: row.user_id,
        FIRST_NAME: row.FIRST_NAME,
        LAST_NAME: row.LAST_NAME,
        Sevakcode: row.Sevakcode,
        CITY_AREA_VILLAGE: row.CITY_AREA_VILLAGE,
        DISTRICT: row.DISTRICT,
        STATE: row.STATE,
        morning: morningPresent,
        evening: eveningPresent,
        both: bothPresent
      };
    });

    res.json({
      morningCount,
      eveningCount,
      bothCount,
      breakdown
    });
  });
});

/**
 * POST /api/attendance
 * Mark attendance for a user.
 */
router.post("/", (req, res) => {
  const { user_id, slot } = req.body;
  if (!user_id || !slot) {
    return res.status(400).json({ error: "Missing user_id or slot" });
  }

  const checkQuery = `
    SELECT 1 FROM attendance
    WHERE user_id = ? AND slot = ? AND DATE(timestamp) = CURDATE()
  `;

  db.query(checkQuery, [user_id, slot], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Attendance check error:", checkErr);
      return res.status(500).json({ error: "Database error" });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({ message: "Attendance already marked today for this slot." });
    }

    const insertQuery = "INSERT INTO attendance (user_id, slot) VALUES (?, ?)";
    db.query(insertQuery, [user_id, slot], (insertErr, result) => {
      if (insertErr) {
        console.error("Insert attendance error:", insertErr);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ message: "Attendance marked", id: result.insertId });
    });
  });
});

/**
 * GET /api/attendance/:id
 * Fetch attendance summary for a specific user.
 */
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT 
      SUM(slot = 'Morning_presentation') AS morning,
      SUM(slot = 'evening_presentation') AS evening,
      MAX(timestamp) AS lastMarked,
      MAX(CASE WHEN slot = 'Morning_presentation' THEN timestamp END) AS lastMorningMarked,
      MAX(CASE WHEN slot = 'evening_presentation' THEN timestamp END) AS lastEveningMarked
    FROM attendance
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Fetch attendance error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      morning: results[0].morning || 0,
      evening: results[0].evening || 0,
      lastMarked: results[0].lastMarked || null,
      lastMorningMarked: results[0].lastMorningMarked || null,
      lastEveningMarked: results[0].lastEveningMarked || null
    });
  });
});

/**
 * GET /api/attendance/:id/log
 * Fetch recent attendance log for a user.
 */
router.get("/:id/log", (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT slot, timestamp
    FROM attendance
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT 50
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Fetch attendance log error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;
