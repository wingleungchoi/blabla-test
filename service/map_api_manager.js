const _ = require('lodash/fp');

const googleMapsClient = require('@google/maps').createClient({
  Promise: require('q').Promise,
  key: process.env.GOOGLE_MAP_API_KEY
});

class MapApiManager {
  static getDirections(token) {
    // get locations from database by token
    MapApiManager.getThirdPartyAPIresult(locations)
    .asPromise();
    // .then(checkResult) // TODO
    // .then(presistRoute)
    // .catch() // TODO
  }

  static getThirdPartyAPIresult(locations) {
    let locationsWithLatKeys = _.map(location => ({
      lat: location[0],
      lng: location[1]
    }), locations);
    let result = googleMapsClient.distanceMatrix({
      mode: 'driving',
      origins: _.take(1, locationsWithLatKeys),
      destinations: _.takeRight((locationsWithLatKeys.length - 1), locationsWithLatKeys)
    });
    return result;
  }

  static presistRouteOfToToken(token) {
    return (response) => {

    }
  }
}

module.exports = MapApiManager;
