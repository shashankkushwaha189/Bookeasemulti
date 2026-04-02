const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const { User, Staff, Customer, Business } = require('../models');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Configure Nodemailer
const transporter = nodemailer.createTransport({
  pool: true, // Use pooled connections for faster subsequent emails
  maxConnections: 5,
  maxMessages: 100,
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || 465, 10),
  secure: parseInt(process.env.SMTP_PORT || 465, 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4, // Force IPv4 preference
  localAddress: '0.0.0.0', // Strictly bind to IPv4 to prevent ENETUNREACH in all Node versions
});

const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"BookEase" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your BookEase Account',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2>Welcome to BookEase!</h2>
          <p>Please use the following 6-digit code to verify your account.</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });
    
    let user = await User.findOne({ where: { email } });
    
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60000); // 10 minutes

    if (user) {
      if (user.is_verified) {
        return res.status(409).json({ message: 'Email already registered and verified. Please login.' });
      } else {
        // Resend OTP for existing unverified user
        await user.update({ otp, otp_expires_at });
        sendOTP(email, otp); // Fire and forget email to speed up response
        return res.status(200).json({ message: 'OTP re-sent to email.', email: user.email });
      }
    }

    user = await User.create({ email, password, role: 'CUSTOMER', is_verified: false, otp, otp_expires_at });
    await Customer.create({ user_id: user.id, name, phone: phone || '' });
    
    sendOTP(email, otp); // Fire and forget email to speed up response
    
    return res.status(201).json({ message: 'Registration initiated. OTP sent to email.', email: user.email });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    if (user.is_verified) return res.status(400).json({ message: 'User is already verified.' });
    
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
    
    if (new Date() > user.otp_expires_at) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    // Mark as verified
    await user.update({ is_verified: true, otp: null, otp_expires_at: null });

    // Login customer and give token
    const customer = await Customer.findOne({ where: { user_id: user.id } });
    const name = customer ? customer.name : email;

    const token = generateToken(user);
    return res.status(200).json({ 
      message: 'Account verified successfully.', 
      token, 
      user: { id: user.id, email: user.email, role: user.role, name } 
    });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
    
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Account not verified. Please verify your email first.', unverified: true, email: user.email });
    }

    let name = email;
    let businessName = null;
    let businessCategory = null;

    if (user.role === 'STAFF') {
      const staff = await Staff.findOne({ where: { user_id: user.id } });
      if (staff) name = staff.name;
    } else if (user.role === 'CUSTOMER') {
      const customer = await Customer.findOne({ where: { user_id: user.id } });
      if (customer) name = customer.name;
    }

    if (user.business_id) {
      const business = await Business.findByPk(user.business_id);
      if (business) { businessName = business.name; businessCategory = business.category; }
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, email: user.email, role: user.role, name, business_id: user.business_id, businessName, businessCategory },
    });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'STAFF') profile = await Staff.findOne({ where: { user_id: user.id } });
    else if (user.role === 'CUSTOMER') profile = await Customer.findOne({ where: { user_id: user.id } });
    return res.status(200).json({ user: { id: user.id, email: user.email, role: user.role, business_id: user.business_id }, profile });
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Token is required.' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: google_id } = payload;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please register using your email first.' });
    }

    // Since they authenticated via google, we can safely consider their email verified
    if (!user.is_verified || !user.google_id) {
      user.google_id = google_id;
      user.auth_provider = 'google';
      user.is_verified = true;
      user.otp = null;
      user.otp_expires_at = null;
      await user.save();
    }

    let userName = name;
    let businessName = null;
    let businessCategory = null;

    if (user.role === 'STAFF') {
      const staff = await Staff.findOne({ where: { user_id: user.id } });
      if (staff) userName = staff.name;
    } else if (user.role === 'CUSTOMER') {
      const customer = await Customer.findOne({ where: { user_id: user.id } });
      if (customer) userName = customer.name;
    }

    if (user.business_id) {
      const business = await Business.findByPk(user.business_id);
      if (business) { businessName = business.name; businessCategory = business.category; }
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Google Login successful.',
      token,
      user: { id: user.id, email: user.email, role: user.role, name: userName, business_id: user.business_id, businessName, businessCategory },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(500).json({ message: 'Server error during Google Authentication.' });
  }
};

module.exports = { register, verifyOtp, login, getMe, googleAuth };
