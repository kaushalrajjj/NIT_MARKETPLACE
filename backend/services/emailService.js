const nodemailer = require('nodemailer');

/**
 * emailService — Sends OTP emails via Gmail SMTP
 * ─────────────────────────────────────────────────
 * Uses Nodemailer with a Gmail "App Password" (not the account password).
 *
 * WHY App Password and not Gmail login password?
 *   Google blocks plain username/password login for programmatic access.
 *   App Passwords are special 16-character codes generated in Google Account settings.
 *   They work with 2FA enabled and can be revoked independently.
 *   Setup: Gmail → Security → 2-Step Verification → App Passwords → Generate
 *
 * Two email types:
 *   1. Signup OTP     — sent with an indigo/purple theme
 *   2. Password change OTP — sent with a red/danger theme
 */

/**
 * Transporter singleton — lazy initialization.
 *
 * WHY lazy (not created at module load)?
 *   process.env variables might not be loaded yet when this module is first required.
 *   By creating the transporter on first use (inside getTransporter), we ensure
 *   the .env is already loaded by that point.
 *
 * WHY singleton (not created every call)?
 *   Creating an SMTP connection is expensive. We reuse the same transporter
 *   for all emails in the process lifetime.
 */
let transporter = null;
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',               // Uses Gmail's SMTP server automatically
            auth: {
                user: process.env.EMAIL_USER, // e.g. marketplacenit@gmail.com
                pass: process.env.EMAIL_PASS, // Gmail App Password (not the account password)
            },
        });
    }
    return transporter;
};

/**
 * sendOtpEmail — Send sign-up OTP to a new user.
 *
 * @param {string} to  - Recipient email (must be @nitkkr.ac.in)
 * @param {string} otp - 6-digit OTP code to embed in the email
 */
const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: `"NIT KKR Marketplace" <${process.env.EMAIL_USER}>`, // Display name + address
        to,
        subject: 'Your OTP for NIT Marketplace Sign Up',
        // HTML email with inline styles (no CSS classes — email clients don't support them)
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background: #4f46e5; padding: 32px 24px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">NIT KKR Marketplace</h1>
                <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px;">Campus Exclusive · Verified Users Only</p>
            </div>

            <div style="padding: 32px 28px;">
                <p style="color: #111827; font-size: 15px; margin: 0 0 8px;">Hi there 👋</p>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
                    Use the OTP below to complete your registration. It is valid for <strong>10 minutes</strong>.
                </p>

                <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; border: 2px dashed #d1d5db;">
                    <p style="margin: 0 0 6px; font-size: 12px; color: #9ca3af; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">Your OTP</p>
                    <p style="margin: 0; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #4f46e5;">${otp}</p>
                </div>

                <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
                    If you did not request this, simply ignore this email.<br/>
                    Never share this OTP with anyone.
                </p>
            </div>

            <div style="padding: 16px 24px; background: #f3f4f6; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">© 2026 NIT KKR Marketplace — Campus Exclusive</p>
            </div>
        </div>`,
    };

    const mailTransporter = getTransporter();
    await mailTransporter.sendMail(mailOptions);
};

/**
 * sendPasswordChangeOtpEmail — Send password-change OTP to an authenticated user.
 *
 * Uses a red/danger color scheme to visually emphasize this is a security action.
 *
 * @param {string} to  - Recipient email (student's @nitkkr.ac.in or admin's email)
 * @param {string} otp - 6-digit OTP code to embed in the email
 */
const sendPasswordChangeOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: `"NIT KKR Marketplace" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your OTP for Password Change — NIT Marketplace',
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background: #dc2626; padding: 32px 24px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">NIT KKR Marketplace</h1>
                <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px;">Password Change Request</p>
            </div>

            <div style="padding: 32px 28px;">
                <p style="color: #111827; font-size: 15px; margin: 0 0 8px;">Hi there 👋</p>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
                    We received a request to change your account password. Use the OTP below to confirm. It is valid for <strong>10 minutes</strong>.
                </p>

                <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; border: 2px dashed #fca5a5;">
                    <p style="margin: 0 0 6px; font-size: 12px; color: #9ca3af; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">Your OTP</p>
                    <p style="margin: 0; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #dc2626;">${otp}</p>
                </div>

                <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
                    If you did not request a password change, please ignore this email.<br/>
                    Never share this OTP with anyone.
                </p>
            </div>

            <div style="padding: 16px 24px; background: #f3f4f6; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">© 2026 NIT KKR Marketplace — Campus Exclusive</p>
            </div>
        </div>`,
    };

    const mailTransporter = getTransporter();
    await mailTransporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendPasswordChangeOtpEmail };
