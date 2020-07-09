// ENCRYPTION_KEY Must be 256 bits (32 characters)
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const SimpleCrypto = require('simple-crypto-js').default;

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

exports.sendMail = async function (toMail, subject, body, attachedItems, companyName) {
  const transporter = nodemailer.createTransport({

    host: 'mail.smtp2go.com',
    port: 8465,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: process.env.ESIGN_USERNAME,
      pass: process.env.ESIGN_PASSWORD,
    },
  });


  let mailOptions;
  if (attachedItems) {
    mailOptions = {
      from: `${companyName} <no-reply@iESign.com>` || '<no-reply@iESign.com>',
      to: toMail,
      subject,
      html: body,
      attachments: [{
        filename: 'Document.pdf',
        path: attachedItems,
      },
      ],
    };
  } else {
    mailOptions = {
      from: `${companyName} <no-reply@iESign.com>` || '<no-reply@iESign.com>',
      to: toMail,
      subject,
      html: body,
      /* attachments: [{
        filename: 'logo_white',
        path: imgPath,
        cid: 'esing@logo', // same cid value as in the html img src
      }, {
        filename: 'bluebg',
        path: bluebg,
        cid: 'esing@bluebg', // same cid value as in the html img src
      }], */
    };
  }


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return error;
    }
    console.log(`Email sent: ${info.response}`, 'email>', toMail);
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

exports.generateJWTtoken = (object) => jwt.sign(JSON.parse(JSON.stringify(object)), process.env.SECRET, { expiresIn: '1y' });
