Github Link to see the Doc - https://github.com/Swaralifendar/Secure-Backend-app

Honors- Internal Assessment
Name : Swarali Fendar
Roll No. : 13
Sem : VI(3rd year)
Phase 1: Environment Setup
Phase 2: Backend Development (Express.js)
Phase 3: MongoDB Atlas Integration
Phase 4: Email Registration Flow (Nodemailer + Gmail)
Phase 5: JWT Authentication Mechanism
Phase 6: Login Functionality
Phase 7: Protected Route Access Using JWT
Phase 8: Deployment (Nginx + HTTPS via Let’s Encrypt)
Phase 9: Final Testing & Demo with Postman
1. Install WSL Ubuntu TerminalInstall nginx
Create a directory for your projectmkdir secure-backend-app
cd secure-backend-app
2. In the directorynpm init -y
Install express mongoose nodemailer jsonwebtoken bcrypt dotenv
In the directory have the folder structure as -
secure-backend-app/
├── controllers/
│ └── authController.js
├── models/
│ └── User.js
├── routes/
│ └── authRoutes.js
├── middlewares/
│ └── authMiddleware.js
├── .env
├── server.js
├── package.json
To open the folder in VS code, install WSL Remote and open it using the commandcode .
3. MongoDB Atlas -
Create cluster and connect stringSave the following details in the .env file as-
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<yourMongoUser>:<yourMongoPassword>@clus
ter0.mongodb.net/secureApp
# JWT Secret Key for Token Generation
JWT_SECRET=yourStrongJwtSecretKey
# Gmail Credentials for Nodemailer (Use App Password here)
EMAIL_USER=yourEmail@gmail.com
EMAIL_PASS=your16CharAppPassword
Select the option Allow Access from Anywhere
Generate the JWT_Secret key by running the commandopenssl rand -base64 32
4. Run the command -
npm start
Key challenges-
-Configure the Code of the server.js
-Check the package.json file for the start script and the “main”
-Make sure to install all the dependencies such as node in the Ubuntu terminal path
not in the Windows, also install dotenv, express, etc.
5. I configure an error first the server run on port 3000
After all issues are solved it finally run on port 5000
This is the initial step to successfully run the server by Express.js server.
6. Install Nodemailer -
npm install nodemailer
Add code for the folderscontrollers, middlewares, models, routes with the files as authController.js,
authMiddleware.js, User.js, authRoutes.js
authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const JWT_SECRET = process.env.JWT_SECRET;
// Nodemailer transporter (Gmail / SMTP setup)
const transporter = nodemailer.createTransport({
 service: 'Gmail', // OR use 'smtp.ethereal.email' / custom
SMTP settings
 auth: {
 user: process.env.EMAIL_USER, // Your Gmail address
 pass: process.env.EMAIL_PASS // App password (not your
real password)
 }
});
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' :
'Missing');
// Register User
exports.registerUser = async (req, res) => {
 try {
 const { email, password } = req.body;
 const existingUser = await User.findOne({ email });
 if (existingUser) {
 return res.status(400).json({ message: 'User already
exists' });
 }
 const hashedPassword = await bcrypt.hash(password, 10);
 const newUser = new User({ email, password:
hashedPassword, verified: false });
 await newUser.save();

 // console.log('JWT_SECRET:',JWT_SECRET);
 const token = jwt.sign({ userId: newUser._id },
JWT_SECRET, { expiresIn: '1h' });
 // console.log("Verification Token:",token);
 console.log('Verification Token:', token);
 const verificationLink =
`${process.env.BASE_URL}/api/auth/verify-registration?token=${tok
en}`;
 // Send verification email
 try{
 await transporter.sendMail({
 from: `"Secure Backend App"
<${process.env.EMAIL_USER}>`,
 to: newUser.email,
 subject: 'Verify your Email',
 html: `<h3>Email Verification</h3><p>Click <a
href="${verificationLink}">here</a> to verify your email.</p>`
 });
 console.log("Verification email sent");
 } catch(err) {
 console.error("Error sending email:",err);
 }
 res.status(201).json({ message: 'User registered. Please
verify your email.' });
 } catch (error) {
 console.error('Registration error:', error);
 res.status(500).json({ message: 'Registration failed.'
});
 }
};
// Verify Registration
exports.verifyRegistration = async (req, res) => {
 try {
 const { token } = req.query;
 const decoded = jwt.verify(token, JWT_SECRET);
 const user = await User.findById(decoded.userId);
 if (!user) {
 return res.status(400).json({ message: 'Invalid
token' });
 }
 if (user.verified) {
 return res.status(400).json({ message: 'User already
verified' });
 }
 user.verified = true;
 await user.save();
 res.status(200).json({ message: 'Email verified
successfully' });
 } catch (error) {
 console.error('Verification error:', error);
 res.status(500).json({ message: 'Email verification
failed.' });
 }
};
// Login User
exports.loginUser = async (req, res) => {
 try {
 const { email, password } = req.body;
 const user = await User.findOne({ email });
 if (!user) {
 return res.status(400).json({ message: 'Invalid
credentials' });
 }
 if (!user.verified) {
 return res.status(400).json({ message: 'Please verify
your email before logging in' });
 }
 const isPasswordValid = await bcrypt.compare(password,
user.password);
 if (!isPasswordValid) {
 return res.status(400).json({ message: 'Invalid
credentials' });
 }
 const token = jwt.sign({ userId: user._id }, JWT_SECRET,
{ expiresIn: '1h' });
 res.status(200).json({ token });
 } catch (error) {
 console.error('Login error:', error);
 res.status(500).json({ message: 'Login failed.' });
 }
};
// Protected Route
exports.protected = (req, res) => {
 res.status(200).json({ message: 'Protected route accessed
successfully' });
};
exports.generateTokenForUser = async (req, res) => {
 const { userId } = req.params;
 try {
 const token = jwt.sign({ userId },
process.env.JWT_SECRET, { expiresIn: '1h' });
 console.log('Generated Token:', token);
 res.status(200).json({ token });
 } catch (error) {
 console.error('Token Generation Error:', error);
 res.status(500).json({ message: 'Failed to generate
token.' });
 }
};
authMiddleware.js
const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
 const authHeader = req.headers.authorization;
 if (!authHeader) {
 return res.status(401).json({ message: 'Authorization header
is missing' });
 }
 const token = authHeader.split(' ')[1]; // Bearer <token>
 if (!token) {
 return res.status(401).json({ message: 'Token is missing' });
 }
 jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
 if (err) {
 console.log(err)
 return res.status(403).json({ message: 'Invalid token' });
 }
 req.user = user; // Store the user data from the token in
the request
 next(); // Pass control to the next middleware or route
handler
 });
};
module.exports = authenticateToken;
User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
 email: { type: String, required: true, unique: true },
 password: { type: String, required: true },
 verified: { type: Boolean, default: false },
 verificationToken: {type:String},
 tokenExpiry: Date
});
module.exports = mongoose.model('User', userSchema);
authRoutes.js
const express = require('express');
const { registerUser, verifyRegistration, loginUser, protected,
generateTokenForUser } = require('../controllers/authController');
// const { registerUser, loginUser } =
require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
router.post('/register', registerUser);
router.get('/verify-registration', verifyRegistration);
router.post('/login', loginUser);
router.get('/protected', authMiddleware, protected);
router.get('/generate-token/:userId', generateTokenForUser);
module.exports = router;
server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Assuming you have
this
// dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running on port
${PORT}`));
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
 useNewUrlParser: true,
 useUnifiedTopology: true,
}).then(() => {
 console.log('Connected to MongoDB');
}).catch(err => {
 console.error('Error connecting to MongoDB:', err);
});
const user = require('./models/User');
// Middleware
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
// *** ADD THIS ROUTE HANDLER ***
app.get('/', (req, res) => {
 res.send('Welcome to the Secure Backend API!'); // Or any other
response
});
app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});
const jwt = require('jsonwebtoken');
app.post('/api/login', (req, res) => {
 const user = { id: 1, username: 'testuser' }; // Simulated user data
 const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn:
'1h' });
 res.json({ token });
});
7. JWT Authentication Mechanism:
secure-backend-app@1.0.0 /home/swara/secure-backend-app
├── bcrypt@5.1.1
├── dotenv@16.5.0
├── express@4.21.2
├── jsonwebtoken@9.0.2
├── mongoose@8.14.2
├── nodemailer@6.10.1
└── nodemon@3.1.10
This is the installed dependencies on the directory by running the commandnpm list
As, we will require jsonwebtoken for the JWT Authentication
8. I have created a test file to check the nodemailer so I have run it and the output is as
follows9. The mail is successfully sent to the recipient-
Token generation-
Verification by tokenLogin -
Protected - Route -
This is the summary-
[POST] /api/auth/register ➔ User created
│
▼
[GET] /api/auth/verify-registration?token=... ➔ User verified
│
▼
[POST] /api/auth/login ➔ Get JWT Token
│
▼
[GET] /api/auth/protected with Bearer Token ➔ Access granted
Ngrok installation and configuring the authtoken -
Phase : 1 - Email-Based Password Reset Flow
Phase : 2 - Rate Limiting with express-rate-limit
Phase : 3 - CLI Testing Tool
Phase : 4 - Unit Testing with Jest or Mocha
Phase : 5 - Demonstration using Postman & CLI Tool
Folder Structure -
/secure-backend-app
│
├── controllers/
│ ├── authController.js
│ └── rateLimitController.js (optional)
│
├── middlewares/
│ ├── authMiddleware.js
│ └── rateLimitMiddleware.js
│
├── models/
│ ├── User.js
│ └── LoginAttempt.js (if storing in DB)
│
├── routes/
│ └── authRoutes.js
│
├── cli-tool.js <-- CLI script for rate limit testing
├── tests/ <-- For Jest & Supertest tests
│ └── auth.test.js
│
├── .env
└── server.js
Flow -
Feature How to Demo
Password Reset Use Postman ➔ Request reset ➔ Get email ➔ Use token to reset
password
Rate Limiting Use Postman ➔ Try rapid requests ➔ See 429 error
Block Multiple
Logins
Login ➔ Try new login ➔ Show token invalidation
CLI tool Run CLI ➔ Show failed login flooding simulation
Unit Tests npm test ➔ Show test pass/fail status
Register-password
Rate - limit :
Reset Rate Limit
