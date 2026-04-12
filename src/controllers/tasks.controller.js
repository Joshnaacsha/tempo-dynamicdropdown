const { getTasksByAccount } = require("../services/mapping.service");
const mapping = require("../config/mapping.json");

exports.getTasks = (req, res) => {
  try {
    // 🔍 DEBUG LOGS
    console.log("=== TEMPO REQUEST START ===");
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("QUERY:", JSON.stringify(req.query, null, 2));
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    console.log("HEADERS:", JSON.stringify(req.headers, null, 2));

    // 🔍 Extract account from all possible places
    let rawAccount =
      req.query?.account ||
      req.query?.accountKey ||
      req.headers["x-tempo-account"] ||
      req.body?.account?.name ||
      req.body?.account?.key ||
      req.body?.accountKey ||
      req.body?.account ||
      "";

    rawAccount = decodeURIComponent(rawAccount || "");

    // 🔁 Map project keys → names
    if (rawAccount === "PROJECT1") rawAccount = "R&D";
    if (rawAccount === "PROJECT2") rawAccount = "SWM";

    const accountName = rawAccount.split(" (")[0];

    console.log("RAW ACCOUNT:", rawAccount);
    console.log("FINAL ACCOUNT:", accountName);

    // 🔐 Tempo verification support
    const verificationToken = req.query.tempoVerificationToken;
    if (verificationToken) {
      res.setHeader("x-tempo-verification-token", verificationToken);
      console.log("Verification token detected:", verificationToken);
    }

    let tasks;

    // 🔁 No account → return all (for initial load / verify)
    if (!accountName) {
      const allTasks = Object.values(mapping).flat();

      tasks = Array.from(
        new Map(allTasks.map(t => [t.value, t])).values()
      );

      console.log("NO ACCOUNT → returning ALL tasks");
    } else {
      tasks = getTasksByAccount(accountName);
      console.log("FILTERED TASKS for", accountName, ":", tasks);
    }

    // ✅ Tempo REQUIRED format
    const response = {
      values: tasks.map(t => ({
        key: t.value,   // UUID
        value: t.label  // Display label
      }))
    };

    console.log("FINAL RESPONSE:", response);

    // 🔥 JSONP support (MANDATORY for Tempo)
    const callback = req.query.callback;

    if (callback) {
      console.log("JSONP CALLBACK:", callback);
      console.log("=== TEMPO REQUEST END ===");
      return res
        .status(200)
        .send(`${callback}(${JSON.stringify(response)})`);
    }

    // fallback (for browser testing)
    console.log("=== TEMPO REQUEST END ===");
    return res.status(200).json(response);

  } catch (error) {
    console.error("CONTROLLER ERROR:", error);
    return res.status(500).json({ values: [] });
  }
};