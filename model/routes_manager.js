class RoutesManager {
  static async createNewRequest({ services, inputRoute }) {
    const route = {
      inputLocations: inputRoute
    };
    let result = await services.route.create(route);
    return { token: result.token };
  }
}

module.exports = RoutesManager;
