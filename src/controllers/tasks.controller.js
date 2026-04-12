const { getTasksByAccount } = require("../services/mapping.service");
const mapping = require("../config/mapping.json");

exports.getTasks = (req, res) => {
  try {
    console.log("\n========== TEMPO REQUEST START ==========");

    // 🔍 BASIC REQUEST INFO
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);

    // 🔍 FULL INPUT
    console.log("QUERY:", JSON.stringify(req.query, null, 2));
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    console.log("HEADERS (partial):", {
      "x-tempo-account": req.headers["x-tempo-account"],
      "user-agent": req.headers["user-agent"]
    });

    // 🔍 EXTRACT ALL POSSIBLE ACCOUNT SOURCES
    const sources = {
      query_account: req.query?.account,
      query_accountKey: req.query?.accountKey,
      header_account: req.headers["x-tempo-account"],
      body_account_name: req.body?.account?.name,
      body_account_key: req.body?.account?.key,
      body_accountKey: req.body?.accountKey,
      body_account: req.body?.account
    };

    console.log("ACCOUNT SOURCES:", sources);

    // 🔥 PICK VALUE (priority order)
    let rawAccount =
      sources.query_accountKey ||
      sources.query_account ||
      sources.body_account_key ||
      sources.body_accountKey ||
      sources.body_account_name ||
      sources.header_account ||
      sources.body_account ||
      "";

    rawAccount = decodeURIComponent(rawAccount || "");

    console.log("RAW ACCOUNT (decoded):", rawAccount);

    // 🔁 MAP PROJECT KEYS → FRIENDLY NAMES
    let accountName = "";

    if (rawAccount === "PROJECT1") accountName = "R&D";
    else if (rawAccount === "PROJECT2") accountName = "SWM";
    else if (rawAccount.includes("R&D")) accountName = "R&D";
    else if (rawAccount.includes("SWM")) accountName = "SWM";
    else accountName = rawAccount.split(" (")[0];

    console.log("FINAL ACCOUNT NAME:", accountName);

    // 🔐 TEMPO VERIFICATION
    const verificationToken = req.query.tempoVerificationToken;
    if (verificationToken) {
      res.setHeader("x-tempo-verification-token", verificationToken);
      console.log("✔ Verification token handled:", verificationToken);
    }

    let tasks;

    // 🔁 DECISION LOGIC
    if (!accountName) {
      console.log("⚠ No account detected → returning ALL tasks");

      const allTasks = Object.values(mapping).flat();

      tasks = Array.from(
        new Map(allTasks.map(t => [t.value, t])).values()
      );

    } else {
      console.log(`✔ Filtering tasks for account: ${accountName}`);

      tasks = getTasksByAccount(accountName);

      console.log("Filtered tasks:", tasks);
    }

    // ✅ TEMPO RESPONSE FORMAT
    const response = {
      values: tasks.map(t => ({
        key: t.value,
        value: t.label
      }))
    };

    console.log("FINAL RESPONSE PAYLOAD:", response);

    // 🔥 JSONP SUPPORT
    const callback = req.query.callback;

    if (callback) {
      console.log("✔ JSONP callback detected:", callback);
      console.log("========== TEMPO REQUEST END ==========\n");

      return res
        .status(200)
        .send(`${callback}(${JSON.stringify(response)})`);
    }

    console.log("✔ Standard JSON response");
    console.log("========== TEMPO REQUEST END ==========\n");

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ CONTROLLER ERROR:", error);
    return res.status(500).json({ values: [] });
  }
};