const express = require("express");

const {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  register,
  checkUsername,
  login,
  googleLogin,
  githubLogin,
  githubCallback,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");

const router = express.Router();

router.post("/send-registration-otp", sendRegistrationOTP);
router.post("/verify-registration-otp", verifyRegistrationOTP);

router.post("/register", register);
router.get("/check-username", checkUsername);

router.post("/login", login);
router.post("/google-login", googleLogin);

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/resend-verification", resendVerificationEmail);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;