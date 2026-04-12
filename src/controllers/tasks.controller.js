const { getTasksByAccount } = require("../services/mapping.service");

exports.getTasks = (req, res) => {
  try {
    const accountName = decodeURIComponent(
      req.query.account ||
      req.headers["x-tempo-account"] ||
      req.body?.account?.name ||
      req.body?.account ||
      ""
    );

    let tasks;

    if (!accountName) {
      const mapping = require("../config/mapping.json");
      tasks = Object.values(mapping).flat();
    } else {
      tasks = getTasksByAccount(accountName);
    }

    // return plain array (NO "results" wrapper)
    res.json(
      tasks.map(t => ({
        id: t.value,
        name: t.label
      }))
    );

  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};