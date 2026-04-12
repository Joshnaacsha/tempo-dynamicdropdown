const mapping = require("../config/mapping.json");

function getTasksByAccount(accountName) {
  if (!accountName) return [];

  return mapping[accountName] || [];
}

module.exports = {
  getTasksByAccount
};