require("dotenv").config();
require("module-alias/register");
require("@/config/database");

const { CronJob } = require("cron");

const backupDB = require("@/schedules/backupDB");
const cleanupExpiredTokens = require("@/schedules/cleanupExpiredTokens");

function startSchedule() {
  console.log("Schedule running...");

  // 3h sáng mỗi ngày, backup DB + upload Drive + gửi mail báo cáo
  new CronJob("0 0 3 * * *", backupDB, null, true);

  // 1h sáng mỗi ngày, dọn revoked token đã hết hạn
  new CronJob("0 0 1 * * *", cleanupExpiredTokens, null, true);
}

module.exports = startSchedule;
