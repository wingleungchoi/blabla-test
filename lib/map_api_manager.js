const RouteStatus = require('../enum/route_status');
const _ = require('lodash/fp');

const googleMapsClient = require('@google/maps').createClient({
  Promise: require('q').Promise,
  key: process.env.GOOGLE_MAP_API_KEY
});

class MapApiManager {
  static async getDirections(route) {
    const googleResponse = await MapApiManager.getThirdPartyAPIresult(route);
    if (_.get('rows.0.elements.0.status', googleResponse.json) === 'ZERO_RESULTS') {
      // no routes is found in google API
      return { error: 'No routes is found in google API' };
    }

    const response = this.convertData(googleResponse.json);
    const oldLatLongs = route;
    const formattedAddressesWithLatLong = await MapApiManager.getformattedAddressesWithLatLong(oldLatLongs);
    // const pathInTermOfLatLong = _.map(formattedAddress => _.get(formattedAddress, formattedAddressesWithLatLong), response.path);
    const pathInTermOfLatLong = _.map(latLong => this.findTheClosestPosition(oldLatLongs, latLong), _.values(formattedAddressesWithLatLong));
    response.path = pathInTermOfLatLong;
    return response;
  }

  static convertAddressesToLatLong(address, addressesWithLatLong) {
    const latLong = _.get(`${address}`, addressesWithLatLong);
    return latLong;
  }

  static async getThirdPartyAPIresult(locations) {
    let locationsWithLatKeys = _.map(location => ({
      lat: location[0],
      lng: location[1]
    }), locations);
    let result = await googleMapsClient.distanceMatrix({
      mode: 'driving',
      transit_routing_preference: 'fewer_transfers',
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
      status: RouteStatus.success.value,
      path: [
        ..._.get('origin_addresses', data),
        ..._.get('destination_addresses', data)
      ],
      total_distance,
      total_time
    };
  }

  static findTheClosestPosition(arrayOfLatLongs, latLong) {
    const arrayOfDistances = _.map(lt => this.calcCrow(lt, latLong), arrayOfLatLongs);
// console.log(arrayOfLatLongs);
// console.log(latLong);
// console.log('arrayOfDistances', arrayOfDistances);
    return _.pipe([
      _.min,
      value => _.indexOf(value, arrayOfDistances),
      index => _.get(`${index}`, arrayOfLatLongs)
    ])(arrayOfDistances);
  }

  // https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
  // This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
  static calcCrow([latA, lonA], [latB, lonB]) {
    const R = 6371; // km
    const dLat = this.toRad(latB - latA);
    const dLon = this.toRad(lonB - lonA);
    let lat1 = this.toRad(latA);
    let lat2 = this.toRad(lonB);

    const a = (Math.sin(dLat / 2) * Math.sin(dLat / 2)) + (Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2));
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  // Converts numeric degrees to radians
  static toRad(Value) {
    return (Value * Math.PI) / 180;
  }
}

module.exports = MapApiManager;
