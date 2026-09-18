const baseTemplate = ({
  title,
  preheader = "",
  content,
  buttonText,
  buttonUrl,
  footerText = "This is an automated message. Please do not reply to this email.",
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f6f8;
  font-family:Arial,Helvetica,sans-serif;
  color:#1f2937;
">

  <div style="display:none;max-height:0;overflow:hidden;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:40px 15px;">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            border:1px solid #e5e7eb;
          "
        >

          <!-- Header -->
          <tr>
            <td style="
              padding:28px 32px;
              background:#111827;
              text-align:center;
            ">

              <div style="
                font-size:24px;
                font-weight:700;
                color:#ffffff;
              ">
                ${process.env.MAIL_FROM_NAME}
              </div>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 32px;">

              <h1 style="
                margin:0 0 20px;
                font-size:24px;
                line-height:1.3;
                color:#111827;
              ">
                ${title}
              </h1>

              ${content}

              ${
                buttonText && buttonUrl
                  ? `
                    <div style="text-align:center;margin:30px 0;">
                      <a
                        href="${buttonUrl}"
                        style="
                          display:inline-block;
                          padding:13px 24px;
                          background:#111827;
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:8px;
                          font-size:14px;
                          font-weight:600;
                        "
                      >
                        ${buttonText}
                      </a>
                    </div>
                  `
                  : ""
              }

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:24px 32px;
              background:#f9fafb;
              border-top:1px solid #e5e7eb;
              text-align:center;
            ">

              <p style="
                margin:0 0 8px;
                font-size:12px;
                color:#6b7280;
                line-height:1.6;
              ">
                ${footerText}
              </p>

              <p style="
                margin:0;
                font-size:12px;
                color:#9ca3af;
              ">
                © ${new Date().getFullYear()} ${process.env.MAIL_FROM_NAME}
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};

const paragraph = (text) => `
  <p style="
    margin:0 0 18px;
    font-size:15px;
    line-height:1.7;
    color:#4b5563;
  ">
    ${text}
  </p>
`;

const infoBox = (content) => `
  <div style="
    margin:24px 0;
    padding:20px;
    background:#f9fafb;
    border:1px solid #e5e7eb;
    border-radius:10px;
  ">
    ${content}
  </div>
`;

// ============================================================
// OTP EMAIL
// ============================================================

export const otpEmail = ({ name = "there", otp, expiryMinutes = 10 }) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      We received a request to verify your account. Use the
      verification code below to continue.
    `)}

    ${infoBox(`
      <div style="
        text-align:center;
        font-size:32px;
        font-weight:700;
        letter-spacing:8px;
        color:#111827;
      ">
        ${otp}
      </div>
    `)}

    ${paragraph(`
      This code will expire in <strong>${expiryMinutes} minutes</strong>.
      For your security, never share this code with anyone.
    `)}

    ${paragraph(`
      If you didn't request this code, you can safely ignore this email.
    `)}
  `;

  return {
    subject: `${otp} is your verification code`,
    html: baseTemplate({
      title: "Your verification code",
      preheader: `Your verification code is ${otp}`,
      content,
    }),
    text: `Hi ${name}, your verification code is ${otp}. It expires in ${expiryMinutes} minutes.`,
  };
};

// ============================================================
// EMAIL VERIFICATION
// ============================================================

export const verifyEmail = ({ name = "there", verificationUrl }) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      Welcome to ${process.env.MAIL_FROM_NAME}.
      Please verify your email address to complete your account setup.
    `)}

    ${paragraph(`
      Click the button below to verify your email address.
    `)}

    ${paragraph(`
      For your security, this verification link may expire after a limited
      period. If it expires, you can request a new verification email.
    `)}
  `;

  return {
    subject: "Verify your email address",
    html: baseTemplate({
      title: "Verify your email",
      preheader: "Complete your account setup by verifying your email address.",
      content,
      buttonText: "Verify Email Address",
      buttonUrl: verificationUrl,
    }),
    text: `Hi ${name}, please verify your email address by visiting: ${verificationUrl}`,
  };
};

// ============================================================
// PASSWORD RESET
// ============================================================

export const resetPassword = ({
  name = "there",
  resetUrl,
  expiryMinutes = 15,
}) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      We received a request to reset the password for your account.
    `)}

    ${paragraph(`
      If you made this request, click the button below to choose a new
      password.
    `)}

    ${infoBox(`
      <p style="
        margin:0;
        font-size:14px;
        line-height:1.6;
        color:#4b5563;
      ">
        This password reset link will expire in
        <strong>${expiryMinutes} minutes</strong>.
      </p>
    `)}

    ${paragraph(`
      If you didn't request a password reset, no action is required.
      Your password will remain unchanged.
    `)}

    ${paragraph(`
      If you believe someone is trying to access your account,
      we recommend changing your password after signing in.
    `)}
  `;

  return {
    subject: "Reset your password",
    html: baseTemplate({
      title: "Reset your password",
      preheader: "Use this link to securely reset your password.",
      content,
      buttonText: "Reset Password",
      buttonUrl: resetUrl,
    }),
    text: `Hi ${name}, reset your password using this link: ${resetUrl}`,
  };
};

// ============================================================
// WELCOME EMAIL
// ============================================================

export const welcomeEmail = ({ name = "there" }) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      Welcome to ${process.env.MAIL_FROM_NAME}.
      Your account has been successfully created.
    `)}

    ${paragraph(`
      We're glad to have you here. You can now sign in and
      start exploring everything available on the platform.
    `)}

    ${paragraph(`
      If you need any help, feel free to reach out to our support team.
    `)}
  `;

  return {
    subject: `Welcome to ${process.env.MAIL_FROM_NAME}`,
    html: baseTemplate({
      title: "Welcome aboard!",
      preheader: "Your account has been successfully created.",
      content,
    }),
    text: `Hi ${name}, welcome to ${process.env.MAIL_FROM_NAME}. Your account has been successfully created.`,
  };
};

// ============================================================
// ARTICLE PUBLISHED
// ============================================================

export const articlePublished = ({
  name = "there",
  articleTitle,
  articleUrl,
}) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      Good news! Your article has been successfully published.
    `)}

    ${infoBox(`
      <p style="
        margin:0 0 8px;
        font-size:12px;
        color:#6b7280;
      ">
        ARTICLE
      </p>

      <p style="
        margin:0;
        font-size:18px;
        line-height:1.5;
        font-weight:600;
        color:#111827;
      ">
        ${articleTitle}
      </p>
    `)}

    ${paragraph(`
      Your article is now available to readers.
      You can view it using the button below.
    `)}
  `;

  return {
    subject: `Your article is now published: ${articleTitle}`,
    html: baseTemplate({
      title: "Your article is live!",
      preheader: `"${articleTitle}" has been published successfully.`,
      content,
      buttonText: "View Article",
      buttonUrl: articleUrl,
    }),
    text: `Hi ${name}, your article "${articleTitle}" has been published. View it here: ${articleUrl}`,
  };
};

// ============================================================
// ARTICLE UPDATED
// ============================================================

export const articleUpdated = ({
  name = "there",
  articleTitle,
  articleUrl,
}) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      Your article has been successfully updated.
    `)}

    ${infoBox(`
      <p style="
        margin:0 0 8px;
        font-size:12px;
        color:#6b7280;
      ">
        ARTICLE
      </p>

      <p style="
        margin:0;
        font-size:18px;
        font-weight:600;
        color:#111827;
      ">
        ${articleTitle}
      </p>
    `)}

    ${paragraph(`
      The latest changes have been saved successfully.
    `)}
  `;

  return {
    subject: `Article updated: ${articleTitle}`,
    html: baseTemplate({
      title: "Your article was updated",
      preheader: `"${articleTitle}" has been updated.`,
      content,
      buttonText: "View Article",
      buttonUrl: articleUrl,
    }),
    text: `Your article "${articleTitle}" has been updated. View it here: ${articleUrl}`,
  };
};

// ============================================================
// ARTICLE ARCHIVED
// ============================================================

export const articleArchived = ({ name = "there", articleTitle }) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      Your article has been moved to the archive.
    `)}

    ${infoBox(`
      <p style="
        margin:0 0 8px;
        font-size:12px;
        color:#6b7280;
      ">
        ARCHIVED ARTICLE
      </p>

      <p style="
        margin:0;
        font-size:18px;
        font-weight:600;
        color:#111827;
      ">
        ${articleTitle}
      </p>
    `)}

    ${paragraph(`
      The article is no longer publicly available while it remains archived.
      You can restore it later from your dashboard.
    `)}
  `;

  return {
    subject: `Article archived: ${articleTitle}`,
    html: baseTemplate({
      title: "Article archived",
      preheader: `"${articleTitle}" has been moved to the archive.`,
      content,
    }),
    text: `Your article "${articleTitle}" has been archived.`,
  };
};

// ============================================================
// PAYMENT SUCCESS
// ============================================================

export const paymentSuccess = ({
  name = "there",
  amount,
  currency = "INR",
  transactionId,
  productName,
}) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      Your payment has been successfully completed.
      Thank you for your purchase.
    `)}

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0">

        <tr>
          <td style="
            padding:7px 0;
            color:#6b7280;
            font-size:14px;
          ">
            Item
          </td>

          <td style="
            padding:7px 0;
            text-align:right;
            color:#111827;
            font-weight:600;
            font-size:14px;
          ">
            ${productName}
          </td>
        </tr>

        <tr>
          <td style="
            padding:7px 0;
            color:#6b7280;
            font-size:14px;
          ">
            Amount
          </td>

          <td style="
            padding:7px 0;
            text-align:right;
            color:#111827;
            font-weight:600;
            font-size:14px;
          ">
            ${currency} ${amount}
          </td>
        </tr>

        <tr>
          <td style="
            padding:7px 0;
            color:#6b7280;
            font-size:14px;
          ">
            Transaction ID
          </td>

          <td style="
            padding:7px 0;
            text-align:right;
            color:#111827;
            font-size:13px;
          ">
            ${transactionId}
          </td>
        </tr>

      </table>
    `)}

    ${paragraph(`
      Please keep this email for your records.
    `)}
  `;

  return {
    subject: `Payment successful - ${currency} ${amount}`,
    html: baseTemplate({
      title: "Payment successful",
      preheader: `Your payment of ${currency} ${amount} was successful.`,
      content,
    }),
    text: `Payment successful. Amount: ${currency} ${amount}. Transaction ID: ${transactionId}.`,
  };
};

// ============================================================
// PAYMENT FAILED
// ============================================================

export const paymentFailed = ({
  name = "there",
  amount,
  currency = "INR",
  reason = "The payment could not be completed.",
}) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      Unfortunately, we couldn't complete your payment.
    `)}

    ${infoBox(`
      <p style="
        margin:0 0 10px;
        font-size:14px;
        color:#4b5563;
      ">
        <strong>Amount:</strong>
        ${currency} ${amount}
      </p>

      <p style="
        margin:0;
        font-size:14px;
        line-height:1.6;
        color:#4b5563;
      ">
        <strong>Reason:</strong>
        ${reason}
      </p>
    `)}

    ${paragraph(`
      Please try the payment again. If the issue continues,
      contact support for assistance.
    `)}
  `;

  return {
    subject: "Payment could not be completed",
    html: baseTemplate({
      title: "Payment unsuccessful",
      preheader: "We couldn't complete your recent payment.",
      content,
    }),
    text: `Your payment of ${currency} ${amount} failed. Reason: ${reason}`,
  };
};

// ============================================================
// PAYMENT PENDING
// ============================================================

export const paymentPending = ({
  name = "there",
  amount,
  currency = "INR",
  transactionId,
}) => {
  const content = `
    ${paragraph(`Hi ${name},`)}

    ${paragraph(`
      Your payment is currently being processed.
    `)}

    ${infoBox(`
      <p style="
        margin:0 0 10px;
        font-size:14px;
        color:#4b5563;
      ">
        <strong>Amount:</strong>
        ${currency} ${amount}
      </p>

      <p style="
        margin:0;
        font-size:14px;
        color:#4b5563;
      ">
        <strong>Transaction ID:</strong>
        ${transactionId}
      </p>
    `)}

    ${paragraph(`
      You don't need to make another payment while this transaction
      is being processed. We'll notify you once the status is updated.
    `)}
  `;

  return {
    subject: "Your payment is being processed",
    html: baseTemplate({
      title: "Payment processing",
      preheader: "Your payment is currently being processed.",
      content,
    }),
    text: `Your payment of ${currency} ${amount} is being processed. Transaction ID: ${transactionId}`,
  };
};
