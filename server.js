require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { sendOtpEmail } = require("./emailService");
const { generateOtp, hashOtp, OTP_TTL_SECONDS } = require("./otpService");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const otpStore = {};
const cooldownStore = {};
const COOLDOWN_SECONDS = 60; // 1 minute

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const now = Date.now();
  if (cooldownStore[email] && now - cooldownStore[email] < COOLDOWN_SECONDS * 1000) {
    const waitTime = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - cooldownStore[email])) / 1000);
    return res.status(429).json({ message: `Please wait ${waitTime}s before requesting another OTP.` });
  }

  const otp = generateOtp();
  const hashed = hashOtp(otp);
  otpStore[email] = hashed;

  setTimeout(() => delete otpStore[email], OTP_TTL_SECONDS * 1000);

  try {
    const info = await sendOtpEmail(email, otp);
    cooldownStore[email] = now;
    setTimeout(() => delete cooldownStore[email], COOLDOWN_SECONDS * 1000); // optional cleanup
    return res.status(200).json({ message: "OTP sent successfully", info: info || null });
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message || err);
    return res.status(500).json({ message: "Failed to send OTP", error: err.message || err });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const storedHash = otpStore[email];
  if (!storedHash) return res.status(400).json({ message: "OTP expired or not found" });

  const enteredHash = hashOtp(otp);
  if (enteredHash === storedHash) {
    delete otpStore[email];
    return res.status(200).json({ message: "OTP verified successfully ✅" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
