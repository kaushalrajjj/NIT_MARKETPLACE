const nodemailer = require('nodemailer');

let transporter = null;
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
};

const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: `"NIT KKR Marketplace" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your OTP for NIT Marketplace Sign Up',
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
