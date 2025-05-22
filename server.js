require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// const https = require('https');
const fs = require('fs');
// const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Assuming you have this

// dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Trust proxy for correct IP detection (especially when using ngrok or proxies)
app.set('trust proxy', 1);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


const user = require('./models/User');

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// *** ADD THIS ROUTE HANDLER ***
app.get('/', (req, res) => {
  res.send('Welcome to the Secure Backend API!'); // Or any other response
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const jwt = require('jsonwebtoken');

module.exports = app;











// app.post('/api/login', (req, res) => {
//   const user = { id: 1, username: 'testuser' };  // Simulated user data
//   const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
//   res.json({ token });
// });

// //SSL options
// const options = {
//   key: fs.readFileSync('./cert/server.key'),
//   cert: fs.readFileSync('./cert/server.cert')
// };

//Create HTTPS server only
// https.createServer(options, app).listen(PORT, () => {
//   console.log(`Secure server running on port ${PORT}`);
// });






// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');

// const app = express();
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.error(err));

// const authRoutes = require('./routes/authRoutes');
// app.use('/api', authRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch(err => {
//   console.error('Error connecting to MongoDB:', err);
// });