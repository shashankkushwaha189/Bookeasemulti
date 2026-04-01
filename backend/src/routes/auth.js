const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyOtp, googleAuth } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login',    login);
router.post('/google',   googleAuth);
router.get('/me',        authenticate, getMe);

module.exports = router;
