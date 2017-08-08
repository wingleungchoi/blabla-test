const Response = require('../../../lib/response');
const RoutesManager = require('../../../model/routes_manager');

class RouteController {
  static async get(ctx) {
    const result = await RoutesManager.getRoute({
      services: ctx.app.context.services,
      routeToken: ctx.params.token
    });
    return Response.ok(ctx, result);
  }

  static async post(ctx) {
    const inputRoute = ctx.request.body;
    const result = await RoutesManager.createNewRequest({
      services: ctx.app.context.services,
      inputRoute
    });

    RoutesManager.findAndPersist({ // Promise
      services: ctx.app.context.services,
      routeId: result._id
    });
    return Response.ok(ctx, {
      token: result.token
    });
  }
}

module.exports = RouteController;
