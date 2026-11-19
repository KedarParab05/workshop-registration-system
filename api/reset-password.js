import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://omkarparelkarwork_db_user:omkarparelkar1123232@ac-qihkhkq-shard-00-00.sohnwre.mongodb.net:27017,ac-qihkhkq-shard-00-01.sohnwre.mongodb.net:27017,ac-qihkhkq-shard-00-02.sohnwre.mongodb.net:27017/kaushalya_db?ssl=true&replicaSet=atlas-6jb3jg-shard-0&authSource=admin';

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
    const { token, email, newPassword } = body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Reset token is required.' });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const db = await getDb();
    const query = email 
      ? { email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } }
      : { resetPasswordToken: token };

    const user = await db.collection('users').findOne(query);

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset link.' });
    }

    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ success: false, error: 'Reset token does not match.' });
    }

    if (user.resetPasswordTokenExpiry && new Date(user.resetPasswordTokenExpiry) < new Date()) {
      return res.status(400).json({ success: false, error: 'This password reset link has expired. Please request a new one.' });
    }

    // Hash new password using standard bcrypt with 10 salt rounds (compatible with Spring Security BCryptPasswordEncoder)
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordTokenExpiry: ""
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Password successfully updated in the database! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Error in reset-password:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset password: ' + (err.message || 'Internal error')
    });
  }
}
