const RouteStatus = require('../enum/route_status');
const MapApiManager = require('../lib/map_api_manager');

class RoutesManager {
  static async createNewRequest({ services, inputRoute }) {
    const route = {
      status: RouteStatus.inProgress.value,
      inputLocations: inputRoute
    };
    let result = await services.route.create(route);
    return { token: result.token };
  }

  static async findAndPersist({ services, routeId }) {
    // idea this function shall be micro service
    const route = await services.route.findOne({ _id: routeId });
    const apiResult = await MapApiManager.getDirections(route.inputLocations);
    const result = await services.route.updateById(routeId, apiResult);
    return result;
  }
}

module.exports = RoutesManager;
