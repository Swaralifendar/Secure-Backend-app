const express = require('express');
const { registerUser, verifyRegistration, loginUser, protectedRoute, generateTokenForUser } = require('../controllers/authController');
// const { registerUser, loginUser } = require('../controllers/authController');
const { requestPasswordReset, resetPassword } = require('../controllers/authController');

const { generalLimiter } = require('../middlewares/rateLimitMiddleware');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', generalLimiter, registerUser);
router.post('/login', generalLimiter, loginUser);

router.post('/register', registerUser);
router.get('/verify-registration', verifyRegistration);
router.post('/login', loginUser);
router.get('/protectedRoute', authMiddleware, protectedRoute);
router.get('/generate-token/:userId', generateTokenForUser);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

const { store } = require('../middlewares/rateLimitMiddleware');

// Admin-only route to reset rate limit for IP
router.post('/reset-rate-limit', (req, res) => {
    const realIp = req.headers['x-forwarded-for'] || req.ip;
    store.resetKey(realIp);
    console.log(`🧹 Rate limit cleared for IP: ${realIp}`);
    res.json({ message: `Rate limit cleared for your IP: ${realIp}` });
});

module.exports = router;