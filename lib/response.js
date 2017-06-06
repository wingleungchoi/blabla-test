const STATUS = {
  OK: 200,
  NOT_FOUND: 404
};

module.exports = {
  ok(koa, payload) {
    koa.body = {
      meta: {
        status: STATUS.OK,
        version: koa.state.version
      },
      data: payload
    };
  },
  notFound(koa) {
    koa.body = {
      meta: {
        status: STATUS.NOT_FOUND,
        version: koa.state.version
      }
    };
  },
  error(koa, error) {
    koa.body = {
      meta: {
        status: error.status,
        version: koa.state.version
      },
      message: error.message,
      errors: error.errors
    };
  }
};
