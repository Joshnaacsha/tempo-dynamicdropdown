const express = require("express");
const router = express.Router();
const { getTasks } = require("../controllers/tasks.controller");

router.get("/", getTasks);

module.exports = router;