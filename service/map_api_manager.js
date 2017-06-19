const _ = require('lodash/fp');

const googleMapsClient = require('@google/maps').createClient({
  Promise: require('q').Promise,
  key: process.env.GOOGLE_MAP_API_KEY
});

class MapApiManager {
  static async getDirections(token, routeService) {
    // get locations from database by token
    const route = await routeService.find({ token });
    const response = MapApiManager.getThirdPartyAPIresult(route.inputLocations);
    return response;
  }

  static async getThirdPartyAPIresult(locations) {
    let locationsWithLatKeys = _.map(location => ({
      lat: location[0],
      lng: location[1]
    }), locations);
    let result = await googleMapsClient.distanceMatrix({
      mode: 'driving',
      origins: _.take(1, locationsWithLatKeys),
      destinations: _.takeRight((locationsWithLatKeys.length - 1), locationsWithLatKeys)
    }).asPromise();
    return result;
  }

  static presistRouteOfToToken(route, routeService) {
    return function* (response) {
      return yield routeService.updateById(route.id, response);
    };
  }

  static async getReverseGeocode(latlng) {
    const response = await googleMapsClient.reverseGeocode({
      latlng,
      result_type: ['country', 'street_address'],
      location_type: ['ROOFTOP', 'APPROXIMATE']
    }).asPromise();
    return response;
  }

  static async getformattedAddressesWithLatLong(latlngs) {
    const responses = await Promise.all(_.map(latlng => MapApiManager.getReverseGeocode(latlng), latlngs));
    const obj = _.reduce((sum, value) => {
      const index = _.indexOf(value, latlngs);
      const formattedAddress = _.get(`${index}.json.results.0.formatted_address`, responses);
      return _.set(formattedAddress, value, sum);
    }, {}, latlngs);
    return obj;
  }

  static convertData(data) {
    const total_distance = _.flow(
      _.get('rows.0.elements'),
      _.map(element => element.distance.value),
      _.sum
    )(data);

    const total_time = _.flow(
      _.get('rows.0.elements'),
      _.map(element => element.duration.value),
      _.sum
    )(data);

    return {
      status: 'success',
      path: [
        ..._.get('origin_addresses', data),
        ..._.get('destination_addresses', data)
      ],
      total_distance,
      total_time
    };
  }
}

module.exports = MapApiManager;
