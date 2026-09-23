const express = require("express");
const router = express.Router();

const authRoute = require("@/routes/auth.route");
const taskRoute = require("@/routes/task.route");

router.use("/auth", authRoute);
router.use("/tasks", taskRoute);

module.exports = router;
