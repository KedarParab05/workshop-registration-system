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
  // Set CORS headers
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
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const recipientName = user.fullName || 'Learner';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF5E9; padding: 24px; color: #101D32; margin: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #101D32; border-radius: 16px; box-shadow: 6px 6px 0px #101D32; overflow: hidden;">
        <tr>
            <td style="background-color: #F4511E; padding: 28px 24px; text-align: center; border-bottom: 2px solid #101D32;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Kaushalya</h1>
                <p style="color: #FFF5E9; margin: 6px 0 0; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">Academic Skills & Workshop Hub</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 36px 32px;">
                <h2 style="font-size: 20px; font-weight: 800; color: #101D32; margin-top: 0; margin-bottom: 12px;">
                    Password Reset Request
                </h2>
                <p style="font-size: 14px; line-height: 1.6; color: #101D32; margin-bottom: 20px;">
                    Hello <strong>${recipientName}</strong>,
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                    We received a request to reset the password for your Kaushalya account associated with <strong>${user.email}</strong>. Click the button below to verify your account and set a new password:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" style="background-color: #F4511E; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; border: 2px solid #101D32; box-shadow: 4px 4px 0px #101D32; display: inline-block;">
                        Reset My Password &rarr;
                    </a>
                </div>
                <div style="background-color: #FFF5E9; border: 2px solid #101D32; border-radius: 10px; padding: 14px 16px; margin: 24px 0; font-size: 12px; line-height: 1.5; color: #101D32;">
                    <strong>&#9888; Security Notice:</strong> This reset link will automatically expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely disregard this email &mdash; your existing password remains safe and unchanged.
                </div>
                <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-top: 24px; word-break: break-all;">
                    If the button above does not work, copy and paste this link into your web browser:<br>
                    <a href="${resetUrl}" style="color: #F4511E; text-decoration: underline;">${resetUrl}</a>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #101D32; padding: 18px 24px; text-align: center; color: #FFF5E9; font-size: 11px;">
                &copy; 2026 Kaushalya Academic Hub. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"Kaushalya Academic Workshops" <${SMTP_USER}>`,
      to: user.email,
      subject: 'Reset Your Kaushalya Account Password',
      html: htmlContent
    });

    return res.status(200).json({
      success: true,
      message: `A password reset link has been dispatched to ${user.email}. Please check your email inbox to reset your password.`
    });
  } catch (err) {
    console.error('Error handling forgot-password:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process password reset email: ' + (err.message || 'Internal error')
    });
  }
}
