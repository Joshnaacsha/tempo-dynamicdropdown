const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const mappingFile = fs.readFileSync(path.join(__dirname, "../config/mapping.yaml"), "utf8");
const mapping = yaml.load(mappingFile);

exports.getTasks = (req, res) => {
  try {
    console.log("\n================ TEMPO REQUEST ================");

    const isVerification = !!req.query.tempoVerificationToken;
    const isDropdownCall = !!req.query.callback;
    console.log("TYPE:", isVerification ? "VERIFICATION" : "DROPDOWN_DATA");
    console.log("URL:", req.originalUrl);
    console.log("QUERY:", req.query);

    let rawAccount = decodeURIComponent(req.query?.accountKey || "");

    console.log("RAW_ACCOUNT:", rawAccount);

    // Map accountKey → mapping key
    let accountName = "";
    const upperAccount = rawAccount.toUpperCase();

    if (upperAccount === "PROJECT1" || upperAccount === "R&D") accountName = "R&D";
    else if (upperAccount === "PROJECT2" || upperAccount === "SWM") accountName = "SWM";

    console.log("FINAL_ACCOUNT:", accountName);

    // Verification
    if (isVerification) {
      res.setHeader(
        "x-tempo-verification-token",
        req.query.tempoVerificationToken
      );
      console.log("VERIFICATION_HANDLED:", true);
    }

    // Get tasks directly from mapping
    let tasks = [];

    if (accountName && mapping[accountName]) {
      console.log("ACCOUNT_STATUS: FOUND -> filtering");
      tasks = mapping[accountName];
    } else {
      console.log("ACCOUNT_STATUS: NONE -> returning all tasks");
      tasks = Object.values(mapping).flat();
    }

    console.log("TASK_COUNT:", tasks.length);

    // Correct Tempo format
    const response = {
      values: tasks.map(t => ({
        key: t.value,   // stable key
        value: t.label  // display
      }))
    };

    // JSONP (required by Tempo)
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