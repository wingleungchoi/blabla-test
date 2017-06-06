const Response = require('../../../lib/response');

class RouteController {
  static async get(ctx) {
    console.log('route controller get');
    return Response.ok(ctx, { company: 'helloworld' });
  }
}

module.exports = RouteController;
