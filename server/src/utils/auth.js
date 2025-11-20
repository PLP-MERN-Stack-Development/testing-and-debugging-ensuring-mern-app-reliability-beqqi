const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'testsecret';

function generateToken(user) {
  const payload = { id: user._id.toString(), email: user.email };
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
