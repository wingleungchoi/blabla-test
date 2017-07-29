const Response = require('../../../lib/response');
const RoutesManager = require('../../../model/routes_manager');

class RouteController {
  static async get(ctx) {
    return Response.ok(ctx, {
      status: 'in progress'
    });
  }

  static async post(ctx) {
    console.log(ctx.request.body);
    const inputRoute = ctx.request.body;
    const actualResult = await RoutesManager.createNewRequest({
      services: ctx.app.context.services,
      inputRoute
    });
    return Response.ok(ctx, {
      token: actualResult.token
    });
  }
}

module.exports = RouteController;
