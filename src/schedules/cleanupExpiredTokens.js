const revokedTokenModel = require("@/models/revokedToken.model");

async function cleanupExpiredTokens() {
  try {
    const deletedCount = await revokedTokenModel.deletedExpiresd();
    console.log(`Deleted ${deletedCount} expired revoked tokens`);
  } catch (error) {
    console.error("Failed:", error);
  }
}

module.exports = cleanupExpiredTokens;
