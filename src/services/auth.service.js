const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret } = require("@/config/jwt");
const jwtUtil = require("@/utils/jwt");
const stringsUtil = require("@/utils/strings");
const userModel = require("@/models/user.model");
const revokedTokenModel = require("@/models/revokedToken.model");

const saltRounds = 10;
const accessTokenTtl = 60 * 60;
const refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000;

class AuthService {
  async generateTokens(user) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const payload = {
      sub: user.id,
      exp: nowInSeconds + accessTokenTtl,
    };

    const accessToken = jwtUtil.sign(payload, secret);
    const refreshToken = stringsUtil.createRandomString(32);
    const refreshExpiresAt = new Date(Date.now() + refreshTokenTtlMs);

    await userModel.updateRefreshToken(user.id, refreshToken, refreshExpiresAt);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(email, password) {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = await userModel.create(email, hashedPassword);

    const tokens = await this.generateTokens({ id: userId });
    return {
      user: { id: userId, email },
      ...tokens,
    };
  }

  async login(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    if (!user.verified_at) {
      throw new Error("Please verify your email first");
    }

    const tokens = await this.generateTokens(user);
    return {
      user: { id: user.id, email: user.email },
      ...tokens,
    };
  }
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const user = await userModel.findByRefreshToken(refreshToken);
    if (!user) {
      throw new Error("Invalid refresh token");
    }

    if (new Date(user.refresh_expires_at) < new Date()) {
      throw new Error("Refresh token expired");
    }

    return await this.generateTokens(user);
  }

  async logout(accessToken) {
    if (!accessToken) return;

    const payload = jwt.decode(accessToken);
    const expiresAt = payload?.exp ? new Date(payload.exp * 1000) : null;
    await revokedTokenModel.create(accessToken, expiresAt);
  }
}

module.exports = new AuthService();
