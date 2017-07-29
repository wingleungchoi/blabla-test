console.log('server starts');
require('dotenv').config();
console.log('setting env variables');

const PORT = process.env.PORT || 3000;
const Koa = require('koa');
const Router = require('koa-router');
const router = new Router();
const requireDir = require('require-dir');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const LogEnum = require('./enum/log');
const Controller = requireDir('./controller', { camelcase: true, recurse: true });
const Service = requireDir('./service', { camelcase: true });
const Middleware = requireDir('./middleware', { camelcase: true });
const MongoClient = require('mongodb').MongoClient;

// mount the routes
function setVersion(version) {
  return async function (ctx, next) {
    ctx.state.version = version;
    await next();
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
app.use(bodyParser({ jsonLimit: '5mb' }));

const apiV1 = new Router();
apiV1.get('/route/:token', Controller.api.v1.route.get);
apiV1.post('/routes', Controller.api.v1.route.post);
router.use('/api/v1', setVersion(LogEnum.VERSION.VERSION_ONE), apiV1.routes(), apiV1.allowedMethods());

app.use(router.routes());

MongoClient.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/lala-dev').then((db) => {
  // set up database
  app.context.db = db;
  app.context.services = {};

  Object.keys(Service).forEach((service) => {
    try {
      if (service !== 'abstract') app.context.services[service] = new Service[service](app);
    } catch (err) {
      console.log(err.stack);
    }
  });

  app.listen(PORT, () => {
    console.log(`Bootstrapped in ${PORT}`);
  });
  db.on('reconnect', () => {
    console.log(`Database is reconnected at ${new Date()}`);
  });
  db.on('timeout', (err) => {
    console.log(`Database connection timed out at ${new Date()}`);
    console.log(`The error stack is ${err.stack}`);
  });
  db.on('error', (err) => {
    console.log(`An error occurred in databased at ${new Date()}`);
    console.log(`The error stack is ${err.stack}`);
  });
  db.on('close', (err) => {
    console.log(`Database is disconnected at ${new Date()}`);
    console.log(`The error stack is ${err.stack}`);
  });
});

// app.listen(3000);
