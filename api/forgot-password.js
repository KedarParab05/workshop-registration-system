import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://omkarparelkarwork_db_user:omkarparelkar1123232@ac-qihkhkq-shard-00-00.sohnwre.mongodb.net:27017,ac-qihkhkq-shard-00-01.sohnwre.mongodb.net:27017,ac-qihkhkq-shard-00-02.sohnwre.mongodb.net:27017/kaushalya_db?ssl=true&replicaSet=atlas-6jb3jg-shard-0&authSource=admin';
const SMTP_USER = process.env.SPRING_MAIL_USERNAME || 'mindscrapers33@gmail.com';
const SMTP_PASS = process.env.SPRING_MAIL_PASSWORD || 'gxcmzvxbjtovuwbh';

let cachedClient = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db('kaushalya_db');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const { email } = body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getDb();
    const user = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `No registered user found with email "${cleanEmail}" in the Kaushalya database.`
      });
    }

    // Generate secure 1-hour expiration reset token
    const token = crypto.randomBytes(24).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: token,
          resetPasswordTokenExpiry: expiry,
          updatedAt: new Date()
        }
      }
    );

    const baseUrl = process.env.APP_FRONTEND_URL || 'https://workshop-registration-system-peach.vercel.app';
    const resetUrl = `${baseUrl.replace(/\/+$/, '')}/?resetToken=${token}&email=${encodeURIComponent(user.email)}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const recipientName = user.fullName || 'User';

    const textBody = `Hello ${recipientName},

A password reset request was made for your Kaushalya Workshop account (${user.email}).

To set a new password, open this secure link in your browser:
${resetUrl}

This link is valid for 1 hour. If you did not make this request, you can ignore this email.

Best regards,
Kaushalya Academic Skills & Workshop Hub`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #FFF5E9; padding: 20px; color: #101D32; margin: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 2px solid #101D32; border-radius: 14px; box-shadow: 4px 4px 0px #101D32;">
        <tr>
            <td style="background-color: #F4511E; padding: 22px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Kaushalya</h1>
                <p style="color: #FFF5E9; margin: 4px 0 0; font-size: 13px;">Workshop Registration Hub</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 28px 24px;">
                <h2 style="font-size: 18px; color: #101D32; margin-top: 0;">Password Reset Verification</h2>
                <p style="font-size: 14px; line-height: 1.5; color: #101D32;">Hello <strong>${recipientName}</strong>,</p>
                <p style="font-size: 14px; line-height: 1.5; color: #334155;">
                    We received a request to reset your password for account <strong>${user.email}</strong>. Click the link below to choose a new password:
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${resetUrl}" style="background-color: #F4511E; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; border: 2px solid #101D32; display: inline-block;">
                        Reset My Password &rarr;
                    </a>
                </div>
                <p style="font-size: 12px; color: #64748B; line-height: 1.5; word-break: break-all;">
                    Or copy-paste this direct URL into your browser:<br>
                    <a href="${resetUrl}" style="color: #F4511E;">${resetUrl}</a>
                </p>
                <div style="background-color: #FFF5E9; border: 1px solid #101D32; border-radius: 8px; padding: 12px; margin-top: 20px; font-size: 12px; color: #101D32;">
                    <strong>Security Note:</strong> This reset link will expire in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #101D32; padding: 14px; text-align: center; color: #FFF5E9; font-size: 11px; border-radius: 0 0 12px 12px;">
                Kaushalya Academic Hub &copy; 2026
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const mailResult = await transporter.sendMail({
      from: `"Kaushalya Hub" <${SMTP_USER}>`,
      replyTo: SMTP_USER,
      to: user.email,
      subject: 'Reset Your Kaushalya Account Password',
      text: textBody,
      html: htmlBody
    });

    console.log('[ForgotPassword] Mail sent successfully:', mailResult.messageId, 'response:', mailResult.response);

    return res.status(200).json({
      success: true,
      message: `A password reset link has been dispatched to ${user.email}. Please check your email inbox (and Spam/Junk folder) to reset your password.`
    });
  } catch (err) {
    console.error('Error handling forgot-password:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process password reset email: ' + (err.message || 'Internal error')
    });
  }
}
