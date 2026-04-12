const { getTasksByAccount } = require("../services/mapping.service");
const mapping = require("../config/mapping.json");

exports.getTasks = (req, res) => {
  try {
    let rawAccount = decodeURIComponent(
  req.query.account ||
  req.headers["x-tempo-account"] ||
  req.body?.account?.name ||
  req.body?.account ||
  ""
);

// Extract only "R&D" from "R&D (PROJECT1)"
const accountName = rawAccount.split(" (")[0];

    // HANDLE VERIFICATION TOKEN
    const verificationToken = req.query.tempoVerificationToken;
    if (verificationToken) {
      res.setHeader("x-tempo-verification-token", verificationToken);
    }

    let tasks;

    if (!accountName) {
      tasks = Object.values(mapping).flat();
    } else {
      tasks = getTasksByAccount(accountName);
    }

    res.setHeader("Content-Type", "application/json");

    return res.status(200).json(
      tasks.map(t => ({
        id: t.value,
        name: t.label
      }))
    );

  } catch (error) {
    console.error(error);
    return res.status(500).json([]);
  }
};