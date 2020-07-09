const { errorResponse } = require('../helpers/helpers');

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err.code === 'INVALID_DOCUMENT_EXTENSION'){
    return errorResponse(req, res, err.message, 400);
  }

  if (err.code === 'INVALID_IMG_EXTENSION'){
    return errorResponse(req, res, err.message, 400);
  }

  if (err.code === 'LIMIT_FIELD_VALUE'){
    return errorResponse(req, res, 'Large file size! Unable to upload!', 400);
  }

  if (err.code === 'LIMIT_FILE_SIZE'){
    return errorResponse(req, res, 'Invalid file size!', 400);
  }

  if (err && err.message === 'validation error') {
    let messages = err.errors.map((e) => e.field);
    if (messages.length && messages.length > 1) {
      messages = `${messages.join(', ')} are required fields`;
    } else {
      messages = `${messages.join(', ')} is required field`;
    }
    return errorResponse(req, res, messages, 400, err);
  }
};
