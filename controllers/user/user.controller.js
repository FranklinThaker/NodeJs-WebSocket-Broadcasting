const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const UsersModel = require('../../models/users');

const {
  successResponse, errorResponse, encrypt, generateJWTtoken,
} = require('../../helpers/helpers');

const ignoredFields = { createdAt: 0, updatedAt: 0, __v: 0 };

exports.signup = async (req, res) => {
  try {
    const param = { ...req.body, ...req.params, ...req.query };

    const userData = await UsersModel.findOne({
      emailAddress: param.emailAddress.toLowerCase(),
    }).select(ignoredFields);

    if (userData) {
      return errorResponse(req, res, 'Email Address already existed!', 400);
    }

    const encryptedPassword = bcrypt.hashSync(param.password, bcrypt.genSaltSync(10), null);

    const user = await UsersModel.findOneAndUpdate({ emailAddress: param.emailAddress.toLowerCase() }, {
      emailAddress: param.emailAddress.toLowerCase(),
      name: param.name,
      password: encryptedPassword,
    }, {
      upsert: true,
    });

    const USER = user.toObject();
    delete USER.password;

    return successResponse(req, res, { emailAddress: param.emailAddress }, 'Registration successfully done!');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const param = { ...req.body, ...req.params, ...req.query };

    const user = await UsersModel.findOne({
      emailAddress: param.emailAddress.toLowerCase(),
    }).select(ignoredFields);

    if (!user) {
      return errorResponse(req, res, 'Incorrect Email Address/Password!', 401);
    }

    const newUser = user.toObject();

    user.comparePassword(param.password, (err, isMatch) => {
      if (err) {
        return errorResponse(req, res, 'Incorrect Email Address/Password!', 401);
      }
      if (!isMatch) {
        return errorResponse(req, res, 'Incorrect Email Address/Password!', 401);
      }

      delete newUser.password;
      const token = generateJWTtoken(newUser);
      const encryptedToken = encrypt(token);
      jwt.verify(token, process.env.SECRET, (error) => {
        if (error) {
          return errorResponse(req, res, 'Incorrect Email Address/Password!', 401);
        }
        return successResponse(req, res, { newUser, encryptedToken }, "You're now logged in!");
      });
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
