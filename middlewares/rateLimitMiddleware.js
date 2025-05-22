const rateLimit = require('express-rate-limit');
const MemoryStore = require('express-rate-limit').MemoryStore;

// Create a memory store instance
const store = new MemoryStore();

// Limit per IP (simple rate limiter for login & register)
const generalLimiter = rateLimit({
    store,
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many requests, please try again after 15 minutes.' },
    // standardHeaders: true,
    // legacyHeaders: false,
    keyGenerator: (req) => {
        const realIp = req.headers['x-forwarded-for'] || req.ip;
        // const ip = req.ip;
        console.log('Rate Limit Check IP:', realIp);
        return realIp;
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// const generalLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 5, // Limit each IP to 5 requests per windowMs
//     message: { message: 'Too many requests, please try again after 15 minutes.' },
//     standardHeaders: true,
//     legacyHeaders: false,
// });

module.exports = {
    generalLimiter,
    store
};
