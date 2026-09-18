const express = require("express");

const {
  sendOtpEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendArticlePublishedEmail,
  sendArticleUpdatedEmail,
  sendArticleArchivedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendPaymentPendingEmail,
} = require("../services/mailService");

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await sendWelcomeEmail({
      email,
      name: "Ram",
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: result.error,
      });
    }

    return res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

module.exports = router;
