const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;

// Nodemailer transporter (Gmail / SMTP setup)
const transporter = nodemailer.createTransport({
    service: 'Gmail',  // OR use 'smtp.ethereal.email' / custom SMTP settings
    auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS   // App password (not your real password)
    }
});

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, verified: false });

        await newUser.save();
        
        // console.log('JWT_SECRET:',JWT_SECRET);
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1h' });
        // console.log("Verification Token:",token);
        console.log('Verification Token:', token);  

        // const verificationLink = `${process.env.BASE_URL}/api/auth/verify-registration?token=${token}`;

          const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify-registration?token=${token}`;


        // Send verification email
        try{
        await transporter.sendMail({
            from: `"Secure Backend App" <${process.env.EMAIL_USER}>`,
            to: newUser.email,
            subject: 'Verify your Email',
            html: `<h3>Email Verification</h3><p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
        });
           console.log("Verification email sent");
        } catch(err) {
            console.error("Error sending email:",err);
        }

        res.status(201).json({ message: 'User registered. Please verify your email.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed.' });
    }
};

// Verify Registration
exports.verifyRegistration = async (req, res) => {
    try {
        const { token } = req.query;

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        if (user.verified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        user.verified = true;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Email verification failed.' });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.verified) {
            return res.status(400).json({ message: 'Please verify your email before logging in' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed.' });
    }
};

// Protected Route
exports.protectedRoute = (req, res) => {
    res.status(200).json({ message: 'Protected route accessed successfully' });
};

exports.generateTokenForUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated Token:', token);

        res.status(200).json({ token });
    } catch (error) {
        console.error('Token Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate token.' });
    }
};

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token valid for 15 mins
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Send email
        const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${token}`;
        await transporter.sendMail({
            from: `"Secure Backend App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `<h3>Reset Your Password</h3><p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`
        });

        res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error('Request password reset error:', error);
        res.status(500).json({ message: 'Failed to send password reset email.' });
    }
};

// Reset Password using token
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Missing token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Password reset failed or token invalid/expired.' });
    }
};