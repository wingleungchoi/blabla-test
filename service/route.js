const Route = require('../model/route');
const AbstractService = require('./abstract');

class RouteService extends AbstractService {
  constructor(app) {
    super(app);
    this.collection = this.db.collection('Routes');
  }

  * create(object) {
    const route = Route.build(object);
    yield this.insert(route);
    return route;
  }

  * save(route) {
    const newRoute = Route.build(route, { setDefault: false });
    newRoute.updatedAt = new Date();
    return yield this.updateById(newRoute._id, newRoute);
  }
}

module.exports = RouteService;
