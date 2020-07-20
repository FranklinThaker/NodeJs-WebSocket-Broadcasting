// ENCRYPTION_KEY Must be 256 bits (32 characters)
const jwt = require('jsonwebtoken');
const SimpleCrypto = require('simple-crypto-js').default;
const nodemailer = require('nodemailer');

// const { uploadDOCXtoS3 } = require('./imageUpload');

// const IV_LENGTH = 16; // For AES, this is always 16

exports.successResponse = function (req, res, data, message = 'Operation successfully completed!', code = 200) {
  res.status(code);
  res.send({
    code,
    success: true,
    message,
    data,
  });
};

exports.errorResponse = function (req, res, errorMessage, code = 500, error) {
  res.status(code);
  res.send({
    code,
    errorMessage,
    error,
    data: null,
    success: false,
  });
};

exports.encrypt = (text) => {
  /* const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`; */
  const simpleCrypto = new SimpleCrypto(process.env.ENCRYPTION_KEY);
  const chiperText = simpleCrypto.encrypt(text);
  return chiperText;
};

exports.decrypt = (text) => {
  /*  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString(); */
  const simpleCrypto = new SimpleCrypto(process.env.ENCRYPTION_KEY);
  const chiperText = simpleCrypto.decrypt(text);
  return chiperText;
};

exports.sendMail = async function (toMail, subject, body) {
  console.log('process.env.WEBSOCKET_USERNAME', process.env.WEBSOCKET_USERNAME);
  console.log('process.env.WEBSOCKET_PASSWORD', process.env.WEBSOCKET_PASSWORD);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.WEBSOCKET_USERNAME,
      pass: process.env.WEBSOCKET_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.WEBSOCKET_USERNAME,
    to: toMail,
    subject,
    html: body,
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return error;
    }
    console.log(`Email sent: ${info.response}`, 'email>', toMail);
  });
};

exports.generateJWTtoken = (object) => jwt.sign(JSON.parse(JSON.stringify(object)), process.env.SECRET, { expiresIn: '1y' });
