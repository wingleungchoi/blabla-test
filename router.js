const Router = require('koa-router');
const requireDir = require('require-dir');
const Controller = requireDir('./controller', { camelcase: true, recurse: true });
const LogEnum = require('./enum/log');
const router = new Router();

// mount the routes
function setVersion(version) {
  return async function (ctx, next) {
    ctx.state.version = version;
    await next();
  };
}

const apiV1 = new Router();
apiV1.get('/route/:token', Controller.api.v1.route.get);
apiV1.post('/routes', Controller.api.v1.route.post);
router.use('/api/v1', setVersion(LogEnum.VERSION.VERSION_ONE), apiV1.routes(), apiV1.allowedMethods());

module.exports = router;
