const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("@/services/auth.service");
const { BCRYPT_SALT_ROUNDS, HTTP_STATUS } = require("@/config/constants");
const userModel = require("@/models/user.model");
const queueService = require("@/services/queue.service");
const { verifyEmailSecret } = require("@/config/jwt");

const register = async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  try {
    const insertId = await userModel.create(email, hash);
    const newUser = { id: insertId, email };

    await queueService.push({
      type: "sendVerificationEmail",
      payload: newUser,
    });

    res.success(newUser, HTTP_STATUS.CREATED);
  } catch (error) {
    if (String(error).includes("Duplicate")) {
      res.error("Email already exists!", HTTP_STATUS.CONFLICT);
    } else {
      throw error;
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.error("Email and password are required", 400);
    }
    const result = await authService.login(email, password);
    res.success(result);
  } catch (error) {
    res.error(error.message, 401);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refreshToken(refresh_token);
    res.success(result);
  } catch (error) {
    res.error(error.message, 401);
  }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.accessToken);
    res.success({ message: "Logged out successfully" });
  } catch (error) {
    res.error(error.message, 500);
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.error("Token request", HTTP_STATUS.BAD_REQUEST);
  }
  let payload;
  try {
    payload = jwt.verify(token, verifyEmailSecret);
  } catch (error) {
    return res.error("Token expired or invalid", HTTP_STATUS.BAD_REQUEST);
  }

  const userId = payload.sub;
  const user = await userModel.findOne(userId);

  if (!user) {
    return res.error("Account does not exist", HTTP_STATUS.NOT_FOUND);
  }

  if (user.verified_at) {
    return res.error("Account previously verified", HTTP_STATUS.BAD_REQUEST);
  }

  await userModel.verifyEmail(userId);

  const tokens = await authService.generateTokens(user);

  res.success({
    message: "Verify email success",
    user: { id: user.id, email: user.email },
    ...tokens,
  });
};

const resendVerifyEmail = async (req, res) => {
  if (req.user.verified_at) {
    res.error("Verified accouunt ", 400);
    return;
  }

  queueService.push({
    type: "sendVerificationEmail",
    payload: {
      id: req.user.id,
      email: req.user.email,
    },
  });

  res.success("Resend verify email success");
};

const changePassword = async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const userId = req.user.id;

  if (!current_password || !new_password || !confirm_password) {
    return res.error(
      "Please fill in all the information",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const user = await userModel.findByWithPassword(userId);
  if (!user) {
    return res.error("Account does not exist.", HTTP_STATUS.NOT_FOUND);
  }

  const isValidPassword = await bcrypt.compare(current_password, user.password);
  if (!isValidPassword) {
    return res.error("Current password is incorrect ", HTTP_STATUS.BAD_REQUEST);
  }

  if (new_password !== confirm_password) {
    return res.error(
      "New password and confirm password do not match",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (current_password === new_password) {
    return res.error(
      "New password must not be the same as current passwors",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const newHash = await bcrypt.hash(new_password, BCRYPT_SALT_ROUNDS);
  await userModel.updatePassword(userId, newHash);

  const changeAt = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  await queueService.push({
    type: "sendPasswordChangeEmail",
    payload: {
      email: user.email,
      changeAt,
    },
  });
  res.success("Change password successfully");
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerifyEmail,
  changePassword,
};
