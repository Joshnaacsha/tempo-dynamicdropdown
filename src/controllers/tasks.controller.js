const { getTasksByAccount } = require("../services/mapping.service");
const mapping = require("../config/mapping.json");

exports.getTasks = (req, res) => {
  try {
    // Read account from ALL possible places
    let rawAccount =
      req.query?.account ||
      req.headers["x-tempo-account"] ||
      req.body?.account?.name ||
      req.body?.account?.key ||   // handle PROJECT1/PROJECT2
      req.body?.accountKey ||     // alternate format
      req.body?.account ||
      "";

    rawAccount = decodeURIComponent(rawAccount || "");

    // Map project keys → names
    if (rawAccount === "PROJECT1") rawAccount = "R&D";
    if (rawAccount === "PROJECT2") rawAccount = "SWM";

    // Extract prefix if value is like "SWM (PROJECT2)"
    const accountName = rawAccount.split(" (")[0];

    console.log("RAW ACCOUNT:", rawAccount);
    console.log("FINAL ACCOUNT:", accountName);

    // Tempo verification support
    const verificationToken = req.query.tempoVerificationToken;
    if (verificationToken) {
      res.setHeader("x-tempo-verification-token", verificationToken);
    }

    let tasks;

    // If no account → return all (for Verify)
    if (!accountName) {
      tasks = Object.values(mapping).flat();
    } else {
      tasks = getTasksByAccount(accountName);
    }

    // Response headers
    res.setHeader("Content-Type", "application/json");

    // Return in Tempo format
    return res.status(200).json(
      tasks.map(t => ({
        id: t.value,
        name: t.label
      }))
    );

  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json([]);
  }
};