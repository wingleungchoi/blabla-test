const Response = require('../../../lib/response');
const RoutesManager = require('../../../model/routes_manager');

class RouteController {
  static async get(ctx) {
    return Response.ok(ctx, {
      status: 'in progress'
    });
  }

  static async post(ctx) {
    return Response.ok(ctx, {
    });
  }
}

module.exports = RouteController;
