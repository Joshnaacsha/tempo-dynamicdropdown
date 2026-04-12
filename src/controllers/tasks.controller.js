const { getTasksByAccount } = require("../services/mapping.service");

exports.getTasks = (req, res) => {
  try {
    console.log("Incoming query:", req.query);

    const accountName =
     decodeURIComponent(
  req.query.account ||
  req.headers["x-tempo-account"] ||
  ""
);

    console.log("Account received:", accountName);

    const tasks = getTasksByAccount(accountName);

    console.log("Tasks returned:", tasks);

    res.json(tasks);

  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};