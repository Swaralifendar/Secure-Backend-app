const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
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
    req.user = user; //  Store the user data from the token in the request
    next(); //  Pass control to the next middleware or route handler
  });
};

module.exports = authenticateToken;








// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ message: 'Unauthorized, token missing' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: 'Unauthorized, invalid token' });
//     }
// };
