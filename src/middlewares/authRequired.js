const crypto = require("crypto");
const { secret } = require("@/config/jwt");
const revokedTokenModel = require("@/models/revokedToken.model");
const userModel = require("@/models/user.model");

const authRequired = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization
      ?.replace("Bearer", "")
      ?.trim();

    if (!accessToken) {
      return res.error("Unauthorized", 401);
    }

    const isRevoked = await revokedTokenModel.isRevoked(accessToken);
    if (isRevoked) {
      return res.error("Token has been revoked", 401);
    }

    const [encodeHeader, encodePayload, clientSignature] =
      accessToken.split(".");
    if (!encodeHeader || !encodePayload || !clientSignature) {
      return res.error("Unauthorized", 401);
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${encodeHeader}.${encodePayload}`);
    const signature = hmac.digest("base64url");

    if (signature !== clientSignature) {
      return res.error("Unauthorized", 401);
    }

    const payload = JSON.parse(atob(encodePayload));
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp < nowInSeconds) {
      return res.error("Token expired", 401);
    }

    const currentUser = await userModel.findOne(payload.sub);
    if (!currentUser) {
      return res.error("Unauthorized", 401);
    }

    req.user = currentUser;
    req.accessToken = accessToken;
    next();
  } catch (error) {
    return res.error("Unauthorized", 401);
  }
};

module.exports = authRequired;
