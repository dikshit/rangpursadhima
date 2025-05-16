// db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12r@mQ1a",           // 🔁 Your password
  database: "sadhi_ma",   // ✅ Your DB name
  charset: "utf8mb4"
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

module.exports = db;
