const uuid = require('uuid').v4;
const AppError = require('../lib/app_error');
const ErrorEnum = require('../enum/error');
const Response = require('../lib/response');

module.exports = {
  async handle(ctx, next) {
    ctx.state.request_id = uuid();
    try {
      await next();
    } catch (err) {
      let error = ErrorEnum.INTERNAL_ERROR;
      console.log('INTERNAL_ERROR err', err);
      if (err instanceof AppError) {
        error = err;
      }
      ctx.status = error.status;
      Response.error(ctx, error);
    }
  }
};
