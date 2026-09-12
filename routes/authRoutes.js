const express = require("express");

const { register, checkUsername, login } = require("../controllers/authController");

const router = express.Router();

/******** Don't allow registration for now, only admin can create users ********/
 router.post("/register", register); 
/*********/
router.get("/check-username", checkUsername);

router.post("/login", login);

module.exports = router;
