const { getTasksByAccount } = require("../services/mapping.service");

exports.getTasks = (req, res) => {
  try {
    const accountName = decodeURIComponent(
      req.query.account ||
      req.headers["x-tempo-account"] ||
      ""
    );

    let tasks;

    if (!accountName) {
      const mapping = require("../config/mapping.json");
      tasks = Object.values(mapping).flat();
    } else {
      tasks = getTasksByAccount(accountName);
    }

    res.json({
      results: tasks.map(t => ({
        id: t.value,
        name: t.label
      }))
    });

  } catch (error) {
    res.status(500).json({ results: [] });
  }
};