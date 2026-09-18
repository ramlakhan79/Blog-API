const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");

const EmailOTP = require("../models/EmailOTP");
const { sendOTPEmail } = require("../utils/sendEmail");
const {
  sendResetPasswordEmail,
  sendVerificationEmail,
} = require("../services/mailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

const createToken = generateToken;

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  authProvider: user.authProvider,
});

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/* Send registration OTP */
const sendRegistrationOTP = async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must contain at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail });

    if (existingEmail) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });

    if (existingUsername) {
      return res.status(409).json({ message: "Username is already taken" });
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    await EmailOTP.deleteMany({ email: normalizedEmail });

    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000,
    );

    await EmailOTP.create({ email: normalizedEmail, otpHash, expiresAt });
    await sendOTPEmail(normalizedEmail, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* Verify OTP and create user */
const verifyRegistrationOTP = async (req, res) => {
  try {
    const { name, username, email, password, otp } = req.body;

    if (!name || !username || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const otpRecord = await EmailOTP.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please request a new OTP." });
    }

    if (otpRecord.expiresAt < new Date()) {
      await EmailOTP.deleteOne({ _id: otpRecord._id });
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new OTP." });
    }

    if (otpRecord.attempts >= 3) {
      await EmailOTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const otpHash = hashOTP(otp);

    if (otpHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });

    if (existingEmail) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });

    if (existingUsername) {
      return res.status(409).json({ message: "Username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: "viewer",
      emailVerified: true,
      authProvider: "local",
    });

    await EmailOTP.deleteOne({ _id: otpRecord._id });
    const token = createToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    // console.error("Verify registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username, email and password are required",
      });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can contain only lowercase letters, numbers and underscores",
      });
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.username === normalizedUsername
            ? "Username already exists"
            : "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: "viewer",
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const checkUsername = async (req, res, next) => {
  try {
    const username = req.query.username?.toLowerCase().trim();

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return res.status(200).json({
        success: true,
        available: false,
        message:
          "Username can contain only lowercase letters, numbers and underscores",
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Username must be between 3 and 30 characters",
      });
    }

    const existingUser = await User.exists({
      username,
    });

    res.status(200).json({
      success: true,
      available: !existingUser,
      message: existingUser
        ? `The username ${username} is taken.`
        : "Username is available",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    const value = identifier.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: value }, { username: value }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
      // user: {
      //   id: user._id,
      //   name: user.name,
      //   username: user.username,
      //   email: user.email,
      //   role: user.role,
      // },
    });
  } catch (error) {
    next(error);
  }
};

/* Google login */
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub, email, name, email_verified } = payload;

    if (!email || !email_verified) {
      return res.status(400).json({ message: "Google email is not verified" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ googleId: sub });

    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (user) {
      if (!user.googleId) {
        user.googleId = sub;
      }
      user.emailVerified = true;

      if (!user.authProvider) {
        user.authProvider = "google";
      }

      await user.save();
    } else {
      let username = normalizedEmail
        .split("@")[0]
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 25);

      if (username.length < 3) {
        username = `user${Date.now()}`;
      }

      let baseUsername = username;
      let counter = 1;

      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter += 1;
      }

      user = await User.create({
        name: name || username,
        username,
        email: normalizedEmail,
        password: null,
        role: "viewer",
        googleId: sub,
        emailVerified: true,
        authProvider: "google",
      });
    }

    const token = createToken(user);

    res.json({
      message: "Google login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether an email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Google users don't have a password
    // if (user.authProvider === "google" || !user.password) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This account uses Google login. Please continue with Google.",
    //   });
    // }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenExpires = new Date(
      Date.now() +
        Number(process.env.RESET_PASSWORD_EXPIRE_MINUTES || 15) * 60 * 1000,
    );

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetTokenExpires;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const emailResult = await sendResetPasswordEmail({
      email: user.email,
      name: user.name,
      resetUrl,
      expiryMinutes: Number(process.env.RESET_PASSWORD_EXPIRE_MINUTES || 15),
    });

    if (!emailResult?.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Unable to send password reset email",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;

    // Invalidate reset token after successful use
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // If this was previously a local account, keep it local
    user.authProvider = user.authProvider || "local";

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Do not reveal whether an email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a verification email has been sent.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Your email is already verified. Please login.",
      });
    }

    // if (user.authProvider === "google") {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "This account uses Google login. Your email is already verified through Google.",
    //   });
    // }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const expiryMinutes = Number(
      process.env.EMAIL_VERIFICATION_EXPIRE_MINUTES || 30,
    );

    const verificationExpires = new Date(
      Date.now() + expiryMinutes * 60 * 1000,
    );

    user.emailVerificationToken = verificationTokenHash;
    user.emailVerificationExpires = verificationExpires;

    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const emailResult = await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl,
      expiryMinutes,
    });

    if (!emailResult?.success) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      return res.status(500).json({
        success: false,
        message: "Unable to send verification email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your email has been successfully verified.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify email.",
    });
  }
};
module.exports = {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  register,
  checkUsername,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  verifyEmail,
};
