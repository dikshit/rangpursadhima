const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ GET all users
router.get("/", (req, res) => {
  db.query("SELECT * FROM userdata", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ POST: Create a new user
router.post("/", (req, res) => {
  const user = req.body;

  // 🔍 Log incoming data
  //console.log("Received user data:", user);

  // Validate non-empty payload
  if (!user || Object.keys(user).length === 0) {
    return res.status(400).json({ error: "Empty request body" });
  }

  db.query("INSERT INTO userdata SET ?", user, (err, result) => {
    if (err) {
      console.error("Insert error:", err.sqlMessage);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.status(201).json({ id: result.insertId, ...user });
  });
});

// ✅ PUT: Update user by ID
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const user = req.body;

  if (!user || Object.keys(user).length === 0) {
    return res.status(400).json({ error: "Empty update data" });
  }

  db.query("UPDATE userdata SET ? WHERE id = ?", [user, id], (err) => {
    if (err) {
      console.error("Update error:", err.sqlMessage);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.sendStatus(200);
  });
});

// ✅ POST: Mark attendance
router.post("/attendance", (req, res) => {
  //console.log("BODY RECEIVED:", req.body);
  const { user_id, slot } = req.body;

  if (!user_id || !slot) {
    return res.status(400).json({ error: "user_id and slot are required" });
  }

  db.query(
    "INSERT INTO attendance (user_id, slot) VALUES (?, ?)",
    [user_id, slot],
    (err) => {
      if (err) {
        console.error("Attendance insert error:", err.sqlMessage);
        return res.status(500).json({ error: err.sqlMessage });
      }
      res.sendStatus(200);
    }
  );
});

// ✅ GET: Get attendance by user ID
router.get("/attendance/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  db.query(
    "SELECT slot, timestamp FROM attendance WHERE user_id = ?",
    [user_id],
    (err, results) => {
      if (err) {
        console.error("Attendance fetch error:", err.sqlMessage);
        return res.status(500).json({ error: err.sqlMessage });
      }
      res.json(results);
    }
  );
});

router.delete("/:id", (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM userdata WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "User deleted successfully" });
  });
});

// ✅ GET all unique states
router.get("/states", (req, res) => {
  db.query("SELECT DISTINCT STATE FROM userdata WHERE STATE IS NOT NULL AND STATE != ''", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);  // Return the unique states as JSON
  });
});
// ✅ GET users by state
router.get("/state", (req, res) => {
  const { state } = req.query;
  
  //console.log('Received state:', state);  // Log the received state for debugging

  if (!state) {
    return res.status(400).json({ error: "State is required" });
  }

  db.query("SELECT * FROM userdata WHERE STATE = ?", [state], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);  // Log the error
      return res.status(500).json({ error: 'Database error' });  // Return JSON error response
    }
    //console.log('Query results:', results);  // Log results to check if data is fetched
    res.json(results);  // Send users matching the state as JSON
  });
});




module.exports = router;
