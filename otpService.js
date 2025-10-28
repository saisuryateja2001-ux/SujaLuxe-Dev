// otpService.js
const crypto = require("crypto");

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
const HMAC_SECRET = process.env.OTP_HMAC_SECRET;

function generateOtp(length = OTP_LENGTH) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10); // digits 0-9
  }
  return otp;
}

function hashOtp(otp) {
  return crypto.createHmac("sha256", HMAC_SECRET).update(otp).digest("hex");
}

module.exports = { generateOtp, hashOtp, OTP_TTL_SECONDS };
