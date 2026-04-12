const { getTasksByAccount } = require("../services/mapping.service");
const mapping = require("../config/mapping.json");

exports.getTasks = (req, res) => {
  try {
    console.log("\n================ TEMPO REQUEST ================");

    const isVerification = !!req.query.tempoVerificationToken;
    const isDropdownCall = !!req.query.callback;

    let requestType = "UNKNOWN";
    if (isVerification) requestType = "VERIFICATION";
    else if (isDropdownCall) requestType = "DROPDOWN_DATA";

    console.log("TYPE:", requestType);
    console.log("URL:", req.originalUrl);
    console.log("PATH:", req.path);
    console.log("QUERY:", req.query);
    console.log("PARAMS:", req.params);

    // 🔥 Extract account from ALL possible sources
    let rawAccount =
      req.query?.accountKey ||
      req.query?.account ||
      req.params?.accountKey ||
      req.params?.account ||
      "";

    // 🔥 Fallback: extract from path manually if needed
    if (!rawAccount) {
      const parts = req.path.split("/").filter(Boolean);
      // Example: /tempo/tasks/PROJECT2 → ["tempo","tasks","PROJECT2"]
      if (parts.length >= 3) {
        rawAccount = parts[2];
      }
    }

    rawAccount = decodeURIComponent(rawAccount || "");

    console.log("RAW_ACCOUNT:", rawAccount);

    // 🔁 Map account key → name
    let accountName = "";

    if (rawAccount === "PROJECT1") accountName = "R&D";
    else if (rawAccount === "PROJECT2") accountName = "SWM";

    console.log("FINAL_ACCOUNT:", accountName);

    // 🔐 Verification handling
    if (isVerification) {
      res.setHeader(
        "x-tempo-verification-token",
        req.query.tempoVerificationToken
      );
      console.log("VERIFICATION_HANDLED:", true);
    }

    let tasks;

    if (!accountName) {
      console.log("ACCOUNT_STATUS: NONE -> returning all tasks");

      const allTasks = Object.values(mapping).flat();

      tasks = Array.from(
        new Map(allTasks.map(t => [t.value, t])).values()
      );
    } else {
      console.log("ACCOUNT_STATUS: FOUND -> filtering");

      tasks = getTasksByAccount(accountName);
    }

    console.log("TASK_COUNT:", tasks.length);

    const response = {
      values: tasks.map(t => ({
        key: t.value,
        value: t.label
      }))
    };

    // 🔥 JSONP response (Tempo requirement)
    if (isDropdownCall) {
      console.log("RESPONSE_TYPE: JSONP");
      console.log("=============================================\n");

      return res.send(
        `${req.query.callback}(${JSON.stringify(response)})`
      );
    }

    console.log("RESPONSE_TYPE: JSON");
    console.log("=============================================\n");

    return res.json(response);

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ values: [] });
  }
};