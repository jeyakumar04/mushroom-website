const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service for TJP Mushroom Farming
 * Sends OTP and notifications via Gmail
 */

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send OTP Email to Admin
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} phoneNumber - Admin phone number
 */
const sendOtpEmail = async (email, otp, phoneNumber) => {
    try {
        const mailOptions = {
            from: `"TJP Mushroom Farming 🍄" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'TJP-OTP-LOGIN', // Simplified for easy Gmail filtering
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                        .container { background: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #F4D03F; }
                        .header h1 { color: #022C22; margin: 0; font-size: 28px; }
                        .header p { color: #666; margin: 5px 0 0 0; }
                        .otp-box { background: linear-gradient(135deg, #022C22 0%, #034d3a 100%); color: white; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; }
                        .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #F4D03F; margin: 10px 0; }
                        .info { background: #f9f9f9; padding: 20px; border-left: 4px solid #F4D03F; margin: 20px 0; }
                        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
                        .warning { color: #e74c3c; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🍄 TJP Mushroom Farming</h1>
                            <p>Admin Dashboard Access</p>
                        </div>
                        
                        <div class="otp-box">
                            <p style="margin: 0; font-size: 16px;">Your Login OTP is</p>
                            <div class="otp-code">${otp}</div>
                            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Valid for 10 minutes</p>
                        </div>
                        
                        <div class="info">
                            <p style="margin: 0 0 10px 0;"><strong>📱 Requested by:</strong> ${phoneNumber}</p>
                            <p style="margin: 0 0 10px 0;"><strong>🕐 Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                            <p style="margin: 0;"><strong>🔒 Security:</strong> Never share this OTP with anyone</p>
                        </div>
                        
                        <p style="text-align: center; color: #666; margin: 20px 0;">
                            If you didn't request this OTP, please ignore this email or contact support immediately.
                        </p>
                        
                        <div class="footer">
                            <p class="warning">⚠️ This is an automated email. Please do not reply.</p>
                            <p>© 2026 TJP Mushroom Farming | "இயற்கையோடு இணைந்த சுவை!" 🌱</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `TJP ADMIN ACCESS\n\nYour OTP for login is: ${otp}\n\n(Valid for 10 minutes)\n\nRequested from: ${phoneNumber}\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\nNever share this OTP with anyone.\n\nIf you didn't request this, please ignore this email.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP Email sent to ${email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email Send Error:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send Generic Notification Email
 * @param {string} email - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email body (HTML or text)
 */
const sendNotificationEmail = async (email, subject, message) => {
    try {
        const mailOptions = {
            from: `"TJP Mushroom Farming 🍄" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: message
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Notification Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Notification Email Error:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOtpEmail,
    sendNotificationEmail,
    transporter
};
