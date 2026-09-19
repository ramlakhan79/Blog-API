import sendEmail from "../utils/sendEmail.js";

import {
  otpEmail,
  verifyEmail,
  resetPassword,
  welcomeEmail,
  articlePublished,
  articleUpdated,
  articleArchived,
  paymentSuccess,
  paymentFailed,
  paymentPending,
} from "../templates/emailTemplates.js";

// ============================================================
// OTP
// ============================================================

export const sendOtpEmail = async ({
  email,
  name,
  otp,
  expiryMinutes,
}) => {
  const template = otpEmail({
    name,
    otp,
    expiryMinutes,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// EMAIL VERIFICATION
// ============================================================

export const sendVerificationEmail = async ({
  email,
  name,
  verificationUrl,
}) => {
  const template = verifyEmail({
    name,
    verificationUrl,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// PASSWORD RESET
// ============================================================

export const sendResetPasswordEmail = async ({
  email,
  name,
  resetUrl,
  expiryMinutes = 15,
}) => {
  const template = resetPassword({
    name,
    resetUrl,
    expiryMinutes,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// WELCOME
// ============================================================

export const sendWelcomeEmail = async ({ email, name }) => {
  const template = welcomeEmail({
    name,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// ARTICLE PUBLISHED
// ============================================================

export const sendArticlePublishedEmail = async ({
  email,
  name,
  articleTitle,
  articleUrl,
}) => {
  const template = articlePublished({
    name,
    articleTitle,
    articleUrl,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// ARTICLE UPDATED
// ============================================================

export const sendArticleUpdatedEmail = async ({
  email,
  name,
  articleTitle,
  articleUrl,
}) => {
  const template = articleUpdated({
    name,
    articleTitle,
    articleUrl,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// ARTICLE ARCHIVED
// ============================================================

export const sendArticleArchivedEmail = async ({
  email,
  name,
  articleTitle,
}) => {
  const template = articleArchived({
    name,
    articleTitle,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// PAYMENT SUCCESS
// ============================================================

export const sendPaymentSuccessEmail = async ({
  email,
  name,
  amount,
  currency = "INR",
  transactionId,
  productName,
}) => {
  const template = paymentSuccess({
    name,
    amount,
    currency,
    transactionId,
    productName,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// PAYMENT FAILED
// ============================================================

export const sendPaymentFailedEmail = async ({
  email,
  name,
  amount,
  currency = "INR",
  reason,
}) => {
  const template = paymentFailed({
    name,
    amount,
    currency,
    reason,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

// ============================================================
// PAYMENT PENDING
// ============================================================

export const sendPaymentPendingEmail = async ({
  email,
  name,
  amount,
  currency = "INR",
  transactionId,
}) => {
  const template = paymentPending({
    name,
    amount,
    currency,
    transactionId,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};
