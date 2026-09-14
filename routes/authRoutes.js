const express = require("express");

const {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  googleLogin,
  register,
  checkUsername,
  login,
} = require("../controllers/authController");

const router = express.Router();

router.post("/send-registration-otp", sendRegistrationOTP);
router.post("/verify-registration-otp", verifyRegistrationOTP);
router.post("/google-login", googleLogin);

/******** Don't allow registration for now, only admin can create users ********/
 router.post("/register", register); 
/*********/
router.get("/check-username", checkUsername);

router.post("/login", login);

module.exports = router;
