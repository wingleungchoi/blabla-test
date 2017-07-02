/* global describe it */ // for eslint

require('../../config'); // loading environment
const expect = require('chai').expect;
const _ = require('lodash/fp');
const MapApiManager = require('../../../service/map_api_manager');

function expectOK(response) {
  expect(response.status).to.equal(200);
  expect(response.json.status).to.equal('OK');
}

describe('Testing MapApiManager Service', () => {
  describe('Testing getThirdPartyAPIresult method', () => {
    it('should return success responses when inputs are valid', async () => {
      const actualResult = await MapApiManager.getThirdPartyAPIresult(
        [
          ['22.372081', '114.107877'],
          ['22.284419', '114.159510'],
          ['22.326442', '114.167811']
        ]
      );
      expectOK(actualResult);
      expect(_.get('rows.0.elements.0.status', actualResult.json)).to.equal('OK');
    });
    it('should return failed responsed when inputs are invalid', async () => {
      const actualResult = await MapApiManager.getThirdPartyAPIresult(
        [
            [1, 1],
            [2, 2],
            [2, 4]
        ]
      );
      expectOK(actualResult);
      expect(_.get('rows.0.elements.0.status', actualResult.json)).to.equal('ZERO_RESULTS');
    });
  });

  describe('Testing getReverseGeocode', () => {
    it('should return success responses when inputs are valid', async () => {
      const actualResult = await MapApiManager.getReverseGeocode(['22.372081', '114.107877']);
      expectOK(actualResult);
      expect(_.get('json.results.0.formatted_address', actualResult)).to.equal('11 Hoi Shing Rd, Tsuen Wan, Hong Kong');
    });
  });

  describe('Testing convertAddressesToLatLong', () => {
    it('should return a matched address when the address is found', () => {
      const address = '11 Hoi Shing Rd, Tsuen Wan, Hong Kong';
      const addressesWithLatLong = {
        '11 Hoi Shing Rd, Tsuen Wan, Hong Kong': ['22.372081', '114.107877'],
        '802 Nathan Rd, Mong Kok, Hong Kong': ['22.326442', '114.167811'],
        'Hong Kong': ['22.284419', '114.159510']
      };
      const actualResult = MapApiManager.convertAddressesToLatLong(address, addressesWithLatLong);
      expect(actualResult).to.deep.equal(['22.372081', '114.107877']);
    });
    it('should return undefined when the address is NOT found', () => {
      const address = 'Secret Place, Hong Kong';
      const addressesWithLatLong = {
        '11 Hoi Shing Rd, Tsuen Wan, Hong Kong': ['22.372081', '114.107877'],
        '802 Nathan Rd, Mong Kok, Hong Kong': ['22.326442', '114.167811'],
        'Hong Kong': ['22.284419', '114.159510']
      };
      const actualResult = MapApiManager.convertAddressesToLatLong(address, addressesWithLatLong);
      expect(actualResult).to.deep.equal(undefined);
    });
  });

  describe('Testing getformattedAddressesWithLatLong', () => {
    it('should return an object with formatted_address as key and latLong as value', async () => {
      const actualResult = await MapApiManager.getformattedAddressesWithLatLong([
        ['22.372081', '114.107877'],
        ['22.326442', '114.167811'],
        ['22.284419', '114.159510']
      ]);
      const expectedResult = {
        '11 Hoi Shing Rd, Tsuen Wan, Hong Kong': ['22.372081', '114.107877'],
        '802 Nathan Rd, Mong Kok, Hong Kong': ['22.326442', '114.167811'],
        'Hong Kong': ['22.284419', '114.159510']
      };
      expect(actualResult).to.deep.equal(expectedResult);
    });
  });

  describe('Testing presistRouteOfToToken', () => {
    it('return a function to presist route data of token input', () => {

    });
  });

  describe('Testing convertData', () => {
    it('convert data from google standard to internal standard', () => {
      const googleResponse = {
        destination_addresses:
        [
          'Laguna City, Central, Hong Kong',
          '789 Nathan Rd, Mong Kok, Hong Kong'
        ],
        origin_addresses: [
          '11 Hoi Shing Rd, Tsuen Wan, Hong Kong'
        ],
        rows: [
          {
            elements: [
              {
                distance: {
                  text: '15.5 km',
                  value: 15518
                },
                duration: {
                  text: '16 mins',
                  value: 986
                },
                status: 'OK'
              },
              {
                distance: {
                  text: '9.7 km',
                  value: 9667
                },
                duration: {
                  text: '14 mins',
                  value: 833
                },
                status: 'OK'
              }
            ]
          }
        ],
        status: 'OK'
      };

      const expectedResult = {
        status: 'success',
        path: [
          '11 Hoi Shing Rd, Tsuen Wan, Hong Kong',
          'Laguna City, Central, Hong Kong',
          '789 Nathan Rd, Mong Kok, Hong Kong'
        ],
        total_distance: 25185,
        total_time: 1819
      };
      const actualResult = MapApiManager.convertData(googleResponse);
      expect(actualResult).to.deep.equal(expectedResult);
    });
  });

  describe('Testing getDirections', () => {
    it('returns the fastest route in the expected structure', async () => {
      const actualResult = await MapApiManager.getDirections([
        ['22.372081', '114.107877'],
        ['22.326442', '114.167811'],
        ['22.284419', '114.159510']
      ]);
      const expectedResult = {
        status: 'success',
        path: [
          ['22.372081', '114.107877'],
          ['22.326442', '114.167811'],
          ['22.284419', '114.159510']
        ],
        total_distance: 25185,
        total_time: 1819
      };
      expect(actualResult).to.deep.equal(expectedResult);
    });

    it('returns null when no routes are found', async () => {
      const actualResult = await MapApiManager.getDirections([
        ['1', '1'],
        ['2', '1'],
        ['3', '3']
      ]);
      const expectedResult = {
        error: 'No routes is found in google API'
      };
      expect(actualResult).to.deep.equal(expectedResult);
    });
  });
});
