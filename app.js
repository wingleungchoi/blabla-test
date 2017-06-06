console.log('server starts');
const Koa = require('koa');
const Router = require('koa-router');
const router = new Router();
const requireDir = require('require-dir');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const LogEnum = require('./enum/log');
const Controller = requireDir('./controller', { camelcase: true, recurse: true });
const Middleware = requireDir('./middleware', { camelcase: true });

// mount the routes
function setVersion(version) {
  return async function (ctx, next) {
    ctx.state.version = version;
    return next();
  };
}

// middleware
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'origin, content-type, accept, api-key, cache-control');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
  ctx.set('Cache-Control', 'no-cache');
  await next();
});
app.use(Middleware.errorHandling.handle);
app.use(bodyParser());

const apiV1 = new Router();
apiV1.get('/route', Controller.api.v1.route.get);
router.use('/v1', setVersion(LogEnum.VERSION.VERSION_ONE), apiV1.routes(), apiV1.allowedMethods());

// app.use(async (ctx) => {
//   ctx.body = 'Invalid URL!!!';
//   // or redirect etc
//   // this.redirect('/someotherspot');
// });

app.use(router.routes());

app.listen(3000);
