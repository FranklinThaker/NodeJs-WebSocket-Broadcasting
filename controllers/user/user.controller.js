
const mongoose = require('mongoose');
const UsersModel = require('../../models/users');
const FrdsModel = require('../../models/friends');
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

    const user = new UsersModel({
      emailAddress: param.emailAddress.toLowerCase(),
      name: param.name,
      password: param.password,
    });
    await user.save();

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

    if (param.password === user.password){
      delete newUser.password;
      const token = generateJWTtoken(newUser);
      const encryptedToken = encrypt(token);
      return successResponse(req, res, { newUser, encryptedToken }, "You're now logged in!");
    }
    return errorResponse(req, res, 'Incorrect Email Address/Password!', 401);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.addFriend = async (req, res) => {
  try {
    const param = { ...req.body, ...req.params, ...req.query };


    if (param.emailAddress.toLowerCase() === req.user.emailAddress) return errorResponse(req, res, 'You can not send yourself frd req!', 400);

    const userData = await UsersModel.findOne({
      emailAddress: param.emailAddress.toLowerCase(),
    }).select(ignoredFields);

    if (userData) {
      const checkIfAlreadyFrds = await FrdsModel.findOne({
        $or: [
          { fromSender: userData._id, toRecipient: mongoose.Types.ObjectId(req.user._id), status: 1 },
          { fromSender: req.user._id, toRecipient: mongoose.Types.ObjectId(userData._id), status: 1 },
        ],
      });
      if (checkIfAlreadyFrds){
        return errorResponse(req, res, 'You are already frds!', 400);
      }

      const checkIfRequestAlreadyExist = await FrdsModel.findOne({
        fromSender: req.user._id,
        toRecipient: userData._id,
      });
      if (checkIfRequestAlreadyExist){
        return errorResponse(req, res, 'Friend Request already sent!', 400);
      }

      const checkIfRequestSentFromSenderAlready = await FrdsModel.findOne({
        fromSender: userData._id,
        toRecipient: req.user._id,
      });
      if (checkIfRequestSentFromSenderAlready){
        return errorResponse(req, res, 'They have already sent you a request!', 400);
      }
      const addFrdData = new FrdsModel({
        fromSender: req.user._id,
        toRecipient: userData._id,
        status: 0,
      });
      await addFrdData.save();
      return successResponse(req, res, { emailAddress: param.emailAddress }, 'Friend request sent successfully!');
    }
    return errorResponse(req, res, 'Email is not system user!', 400);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.AcceptFrdRequest = async (req, res) => {
  try {
    const param = { ...req.body, ...req.params, ...req.query };

    // $and: [
    //   { $or: [{ frdId1: req.user._id }, { frdId2: req.user._id }] },
    //   { $or: [{ frdId1: param.frdId }, { frdId1: param.frdId }] },
    // ],
    const ifALreadyAccepted = await FrdsModel({ fromSender: param.senderId, toRecipient: req.user._id, status: 1 });
    if (ifALreadyAccepted) return successResponse(req, res, {}, 'Request already accepted!');
    await FrdsModel.findOneAndUpdate({ fromSender: param.senderId, toRecipient: req.user._id }, {
      status: 1,
    });

    return successResponse(req, res, {}, 'Request accepted!');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.ListSentFrdRequests = async (req, res) => {
  try {
    const data = await FrdsModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'fromSender',
          foreignField: '_id',
          as: 'fromSender',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'toRecipient',
          foreignField: '_id',
          as: 'toRecipient',
        },
      },
      { $unwind: '$fromSender' },
      { $unwind: '$toRecipient' },
      { $match: { status: 0, 'fromSender._id': mongoose.Types.ObjectId(req.user._id) } },
    ]);

    console.log('exports.ListSentFrdRequests -> req.user._id', req.user._id);
    return successResponse(req, res, data, 'List of Sent friend requests!');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.ListReceiveFrdRequests = async (req, res) => {
  try {
    const data = await FrdsModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'fromSender',
          foreignField: '_id',
          as: 'fromSender',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'toRecipient',
          foreignField: '_id',
          as: 'toRecipient',
        },
      },
      { $unwind: '$fromSender' },
      { $unwind: '$toRecipient' },
      { $match: { status: 0, 'toRecipient._id': mongoose.Types.ObjectId(req.user._id) } },
    ]);
    return successResponse(req, res, data, 'List of Received friend requests!');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.friends = async (req, res) => {
  try {
    const data = await FrdsModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'fromSender',
          foreignField: '_id',
          as: 'fromSender',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'toRecipient',
          foreignField: '_id',
          as: 'toRecipient',
        },
      },
      { $unwind: '$fromSender' },
      { $unwind: '$toRecipient' },
      {
        $match: {
          $or: [
            { 'toRecipient._id': mongoose.Types.ObjectId(req.user._id) },
            { 'fromSender._id': mongoose.Types.ObjectId(req.user._id) },
          ],
          status: 1,
        },
      },
    ]);
    return successResponse(req, res, data, 'Friends list!');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
