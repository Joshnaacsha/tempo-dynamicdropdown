require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3001;

// Run locally only
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;