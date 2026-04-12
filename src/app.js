const express = require("express");
const cors = require("cors");
const tasksRoute = require("./routes/tasks.route");

const app = express();

// middleware first
app.use(cors());
app.use(express.json());

// routes
app.use("/tempo/tasks", tasksRoute);

// optional (for testing root)
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;