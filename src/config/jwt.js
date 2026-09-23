const jwt = {
  secret: process.env.AUTH_JWT_SECRET,
  verifyEmailSecret: process.env.VERIFY_EMAIL_JWT_SECRET,
};

module.exports = jwt;
