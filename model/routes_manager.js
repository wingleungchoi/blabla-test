const _ = require('lodash/fp');
const RouteStatus = require('../enum/route_status');
const MapApiManager = require('../lib/map_api_manager');

class RoutesManager {
  static async getRoute({ services, routeToken }) {
    const route = await services.route.findOne({ token: routeToken });
    return {
      path: route.path,
      total_distance: route.total_distance,
      total_time: route.total_time,
      status: _.find(s => s.value === route.status, _.values(RouteStatus)).name
    };
  }

  static async createNewRequest({ services, inputRoute }) {
    const route = {
      status: RouteStatus.inProgress.value,
      inputLocations: inputRoute
    };
    let result = await services.route.create(route);
    return {
      _id: result._id,
      token: result.token
    };
  }

  static async findAndPersist({ services, routeId }) {
    // ideally this function shall be micro service
    const route = await services.route.findOne({ _id: routeId });
    const apiResult = await MapApiManager.getDirections(route.inputLocations);
    const result = await services.route.updateById(routeId, apiResult);
    return result;
  }
}

module.exports = RoutesManager;
