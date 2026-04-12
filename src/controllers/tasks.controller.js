const { getTasksByAccount } = require("../services/mapping.service");
const mapping = require("../config/mapping.json");

exports.getTasks = (req, res) => {
  try {
    // Read account from ALL possible places
    let rawAccount =
      req.query?.account ||
      req.query?.accountKey ||          // 🔥 add this
      req.headers["x-tempo-account"] ||
      req.body?.account?.name ||
      req.body?.account?.key ||
      req.body?.accountKey ||
      req.body?.account ||
      "";

    rawAccount = decodeURIComponent(rawAccount || "");

    // Map project keys → names
    if (rawAccount === "PROJECT1") rawAccount = "R&D";
    if (rawAccount === "PROJECT2") rawAccount = "SWM";

    // Extract prefix if needed
    const accountName = rawAccount.split(" (")[0];

    console.log("RAW ACCOUNT:", rawAccount);
    console.log("FINAL ACCOUNT:", accountName);
    console.log("QUERY:", req.query);

    // Tempo verification support
    const verificationToken = req.query.tempoVerificationToken;
    if (verificationToken) {
      res.setHeader("x-tempo-verification-token", verificationToken);
    }

    let tasks;

    // If no account → return all (for Verify / initial load)
    if (!accountName) {
      const allTasks = Object.values(mapping).flat();

      // remove duplicates
      tasks = Array.from(
        new Map(allTasks.map(t => [t.value, t])).values()
      );
    } else {
      tasks = getTasksByAccount(accountName);
    }

    const response = tasks.map(t => ({
      id: t.value,
      name: t.label
    }));

    // 🔥 JSONP SUPPORT (CRITICAL FOR TEMPO)
    const callback = req.query.callback;

    if (callback) {
      return res
        .status(200)
        .send(`${callback}(${JSON.stringify(response)})`);
    }

    // fallback (for browser testing)
    return res.status(200).json(response);

  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json([]);
  }
};