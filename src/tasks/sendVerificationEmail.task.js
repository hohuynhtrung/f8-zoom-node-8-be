const emailService = require("@/services/email.service");

async function sendVerificationEmail(payload) {
  await emailService.sendVerificationEmail(payload);
}

module.exports = sendVerificationEmail;
