const Route = require('../model/route');
const AbstractService = require('./abstract');

class RouteService extends AbstractService {
  constructor(app) {
    super(app);
    this.collection = app.context.db.collection('Routes');
  }

  async create(object) {
    const route = Route.build(object);
    await this.insert(route);
    return route;
  }

  async save(route) {
    const newRoute = Route.build(route, { setDefault: false });
    newRoute.updatedAt = new Date();
    const result = await this.updateById(newRoute._id, newRoute);
    return result;
  }
}

module.exports = RouteService;
