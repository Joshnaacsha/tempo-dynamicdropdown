const { getTasksByAccount } = require("../services/mapping.service");
const mapping = require("../config/mapping.json");

exports.getTasks = (req, res) => {
  try {
    // 🔍 Read account from multiple possible places
    const accountName = decodeURIComponent(
      req.query?.account ||
      req.headers["x-tempo-account"] ||
      req.body?.account?.name ||
      req.body?.account ||
      ""
    );

    let tasks;

    // 🔁 If no account (Tempo Verify), return ALL tasks
    if (!accountName) {
      tasks = Object.values(mapping).flat();
    } else {
      tasks = getTasksByAccount(accountName);
    }

    const response = tasks.map(t => ({
      id: t.value,
      name: t.label
    }));

    // ✅ Required headers (helps Tempo verification)
    res.setHeader("Content-Type", "application/json");

    return res.status(200).json(response);

  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json([]);
  }
};