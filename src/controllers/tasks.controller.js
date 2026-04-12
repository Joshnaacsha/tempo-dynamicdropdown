const { getTasksByAccount } = require("../services/mapping.service");

exports.getTasks = (req, res) => {
  try {
    console.log("Incoming query:", req.query);

 const accountName = decodeURIComponent(
  req.query.account ||
  req.headers["x-tempo-account"] ||
  ""
);

// If no account → return ALL tasks (for Tempo verify)
if (!accountName) {
  const allTasks = Object.values(require("../config/mapping.json")).flat();
  return res.json(allTasks);
}

const tasks = getTasksByAccount(accountName);
res.json(tasks);

    console.log("Tasks returned:", tasks);

    res.json(tasks);

  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};