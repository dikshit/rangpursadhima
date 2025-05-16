// index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const userRoutes = require("./routes/users");
const attendanceRoutes=require("./routes/attendance");
const uploadRoutes=require("./routes/upload");

app.use(cors());
app.use(bodyParser.json());
app.use("/api/attendance",attendanceRoutes)
app.use("/api/users", userRoutes);
app.use("/api/upload",uploadRoutes);
app.use("/upload",express.static("upload"));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
