class RoutesManager {
  static async createNewRequest({ services, inputRoute }) {
    const route = {
      inputLocations: inputRoute
    };
    let result = await services.route.create(route);
console.log('wing result', result)
    return { token: result.token };
  }
}

module.exports = RoutesManager;
