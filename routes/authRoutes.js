// const express = require("express");

// const {
//   sendRegistrationOTP,
//   verifyRegistrationOTP,
//   googleLogin,
//   forgotPassword,
//   resetPassword,
//   verifyEmail,
//   resendVerification,
//   register,
//   checkUsername,
//   login,
// } = require("../controllers/authController");

// const router = express.Router();

// router.post("/send-registration-otp", sendRegistrationOTP);
// router.post("/verify-registration-otp", verifyRegistrationOTP);
// router.post("/google-login", googleLogin);

// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);

// router.get("/verify-email/:token", verifyEmail);
// router.post("/resend-verification", resendVerification);

// /******** Don't allow registration for now, only admin can create users ********/
//  router.post("/register", register);
// /*********/
// router.get("/check-username", checkUsername);

// router.post("/login", login);

// module.exports = router;

const express = require("express");

const {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  register,
  checkUsername,
  login,
  googleLogin,
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

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/resend-verification", resendVerificationEmail);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;