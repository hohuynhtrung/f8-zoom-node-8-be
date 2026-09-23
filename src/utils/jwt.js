const crypto = require("crypto");

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const jwt = {
  sign(payload, secret) {
    const header = base64UrlEncode(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    );
    const encodePayload = base64UrlEncode(JSON.stringify(payload));
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${header}.${encodePayload}`);
    const signature = hmac.digest("base64url");

    return `${header}.${encodePayload}.${signature}`;
  },
};

module.exports = jwt;
