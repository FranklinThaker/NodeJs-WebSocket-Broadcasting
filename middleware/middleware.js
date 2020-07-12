const jwt = require('jsonwebtoken');
const { errorResponse, decrypt } = require('../helpers/helpers');

exports.authentication = async function (req, res, next) {
  let decoded;
  if (!(req.headers && req.headers.authorization)) {
    return errorResponse(req, res, 'Token is not provided', 401);
  }
  const encryptedToken = req.headers.authorization;
  try {
    const decryptedToken = decrypt(encryptedToken);
    decoded = jwt.verify(decryptedToken, process.env.SECRET);
  } catch (error) {
    switch (error.message) {
    case 'jwt expired': return errorResponse(req, res, 'Token Expired!', 401);
    default: return errorResponse(req, res, 'Invalid Token', 401);
    }
  }
  delete decoded.password;
  req.user = decoded;
  return next();
};
