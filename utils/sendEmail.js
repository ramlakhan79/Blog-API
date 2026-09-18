// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// export const sendOTPEmail = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"Ramlakhan Portfolio" <${process.env.SMTP_USER}>`,
//     to: email,
//     subject: "Your Email Verification OTP",
//     text: `Your OTP is ${otp}. It will expire in ${
//       process.env.OTP_EXPIRE_MINUTES || 1
//     } minutes.`,
//     html: `
//       <div style="font-family:Arial,sans-serif;background:#111827;padding:30px;">
//         <div style="max-width:500px;margin:auto;background:#1f2937;padding:30px;border-radius:12px;color:white;">

//           <h2 style="margin-top:0;">
//             Verify your email
//           </h2>

//           <p style="color:#9ca3af;">
//             Use the OTP below to complete your registration.
//           </p>

//           <div style="
//             font-size:32px;
//             font-weight:bold;
//             letter-spacing:8px;
//             background:#111827;
//             padding:18px;
//             text-align:center;
//             border-radius:8px;
//             margin:25px 0;
//           ">
//             ${otp}
//           </div>

//           <p style="color:#9ca3af;">
//             This OTP will expire in ${
//               process.env.OTP_EXPIRE_MINUTES || 1
//             } minutes.
//           </p>

//           <p style="color:#6b7280;font-size:12px;">
//             If you did not request this code, you can safely ignore this email.
//           </p>

//         </div>
//       </div>
//     `,
//   });
// };

import transporter from "../config/mail.js";

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export default sendEmail;