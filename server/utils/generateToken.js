const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'micro_volunteer_match_jwt_super_secret_key_2026', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
