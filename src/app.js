const express = require("express");
const tasksRoute = require("./routes/tasks.route");

const app = express();

app.use(express.json());

app.use("/tempo/tasks", tasksRoute);

module.exports = app;