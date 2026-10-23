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
  changePassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");

const { authMiddleware } = require("../middleware/authMiddleware");

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

router.post("/change-password", authMiddleware, changePassword);

router.post("/resend-verification", resendVerificationEmail);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;