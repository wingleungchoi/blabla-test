const ERROR_TYPE = {
  USER: 'user',
  INTERNAL: 'internal'
};

module.exports = {
  INVALID_PAYLOAD: {
    type: ERROR_TYPE.USER,
    status: 400,
    message: 'The payload is incorrect.'
  },
  UNAUTHENTICATED: {
    type: ERROR_TYPE.USER,
    status: 403,
    message: 'Wrong API Key'
  },
  NOT_FOUND: {
    type: ERROR_TYPE.USER,
    status: 404,
    message: 'No data found'
  },
  INTERNAL_ERROR: {
    type: ERROR_TYPE.INTERNAL,
    status: 500,
    message: 'Internal Error'
  }
};
