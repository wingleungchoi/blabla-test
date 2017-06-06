/* global describe it */
const expect = require('chai').expect;
const MapApiManager = require('../../../service/map_api_manager');

describe('Testing MapApiManager Service', () => {
  describe('Testing getDirections method', () => {
    it('#1 Should check required fields and output error', () => {
      let expectedResult = {
        status: 'success',
        path: [
          ['22.372081', '114.107877'],
          ['22.326442', '114.167811'],
          ['22.284419', '114.159510']
        ],
        total_distance: 20000,
        total_time: 1800
      };
      const result = MapApiManager.getDirections(
        ['22.372081', '114.107877'],
        ['22.284419', '114.159510'],
        ['22.326442', '114.167811']
      );
      expect(result).to.be.eql(expectedResult);
    });
  });
});
